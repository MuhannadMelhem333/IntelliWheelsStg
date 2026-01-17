"""Import SQL car data directly to Render PostgreSQL database."""
import re
import json
import os
import sys

try:
    import psycopg2
except ImportError:
    print("Installing psycopg2-binary...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary")
    import psycopg2

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SQL_DUMP_PATH = BASE_DIR / "data" / "Middle-East-GCC-Car-Database-by-Teoalida-SAMPLE.sql"

# AED to JOD conversion rate (1 AED ≈ 0.19 JOD)
AED_TO_JOD = 0.19

def parse_price_aed(price_str: str) -> float | None:
    """Extract average price from AED price string."""
    if not price_str or 'AED' not in price_str:
        return None
    matches = re.findall(r'AED\s*([\d,]+)', price_str)
    if not matches:
        return None
    prices = [int(m.replace(',', '')) for m in matches]
    if not prices:
        return None
    return sum(prices) / len(prices)

def extract_star_rating(value: str) -> float | None:
    """Extract star rating from URL like 'star4.jpg' or 'star45.jpg'"""
    if not value:
        return None
    match = re.search(r'star(\d+)', value)
    if match:
        rating = int(match.group(1))
        if rating >= 10:
            return rating / 10
        return float(rating)
    return None

def parse_sql_dump():
    """Parse the SQL dump file and extract car data."""
    print(f"📂 Reading: {SQL_DUMP_PATH}")
    with open(SQL_DUMP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cars = []
    seen = set()
    
    row_pattern = re.compile(
        r"\('([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'(\d{4})',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)"
    )
    
    for match in row_pattern.finditer(content):
        groups = match.groups()
        
        url = groups[0]
        make = groups[1]
        model = groups[2]
        year = groups[3]
        image1 = groups[4]
        image2 = groups[5]
        price_uae = groups[6]
        price_ksa = groups[7]
        origin = groups[8]
        car_class = groups[9]
        body = groups[10]
        weight = groups[11]
        good = groups[12]
        bad = groups[13]
        overview = groups[14]
        reliability = groups[15]
        resale = groups[16]
        
        if not make or not model:
            continue
        
        key = f"{make}|{model}|{year}"
        if key in seen:
            continue
        seen.add(key)
        
        price_aed = parse_price_aed(price_uae)
        price_jod = round(price_aed * AED_TO_JOD, 2) if price_aed else None
        
        rating1 = extract_star_rating(reliability)
        rating2 = extract_star_rating(resale)
        ratings = [r for r in [rating1, rating2] if r]
        rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.0
        
        specs = {
            'overview': overview[:500] if overview else f"{make} {model} {year}",
            'origin': origin,
            'class': car_class,
            'bodyStyle': body,
            'weight': weight,
            'pros': good,
            'cons': bad,
        }
        
        gallery = [img for img in [image1, image2] if img and img.startswith('http')]
        
        cars.append({
            'make': make,
            'model': model,
            'year': int(year),
            'price': price_jod,
            'currency': 'JOD',
            'image_url': image1 if image1.startswith('http') else None,
            'gallery_images': json.dumps(gallery) if gallery else None,
            'rating': rating,
            'description': overview[:500] if overview else None,
            'specs': json.dumps(specs)
        })
    
    return cars

def import_to_postgres(database_url: str, cars: list):
    """Import cars to PostgreSQL database."""
    # Fix Render's postgres:// URL to postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    print(f"🔌 Connecting to PostgreSQL...")
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Check if cars table exists and has data
    cursor.execute("SELECT COUNT(*) FROM cars")
    existing = cursor.fetchone()[0]
    print(f"📊 Existing cars in database: {existing}")
    
    if existing > 0:
        if os.environ.get('FORCE_REIMPORT'):
            print(f"⚠️  Database has {existing} cars. FORCE_REIMPORT is set. Clearing data...")
            cursor.execute("DELETE FROM cars")
            conn.commit()
            print("🗑️  Cleared existing cars.")
        else:
            print(f"✅ Database already has {existing} cars. Skipping import.")
            conn.close()
            return
    
    # Insert cars
    for car in cars:
        cursor.execute("""
            INSERT INTO cars (make, model, year, price, currency, image_url, gallery_images, rating, description, specs, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            car['make'],
            car['model'],
            car['year'],
            car['price'],
            car['currency'],
            car['image_url'],
            car['gallery_images'],
            car['rating'],
            car['description'],
            car['specs']
        ))
    
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM cars")
    total = cursor.fetchone()[0]
    print(f"✅ Imported {total} cars to PostgreSQL!")
    
    cursor.execute("SELECT make, model, year, price FROM cars LIMIT 5")
    print("\n📋 Sample data:")
    for row in cursor.fetchall():
        print(f"   {row[0]} {row[1]} ({row[2]}) - {row[3]} JOD" if row[3] else f"   {row[0]} {row[1]} ({row[2]}) - No price")
    
    conn.close()

def get_sample_dealers():
    """Return a list of sample dealers."""
    return [
        {
            "name": "Jordan Auto Elite",
            "location": "Mecca St, Amman",
            "latitude": 31.975,
            "longitude": 35.860,
            "rating": 4.8,
            "reviews_count": 124,
            "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1000&auto=format&fit=crop",
            "showroom_images": json.dumps([
                "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=1000",
                "https://images.unsplash.com/photo-1562141993-27150e234f96?q=80&w=1000"
            ]),
            "contact_email": "sales@jordanautoelite.com",
            "contact_phone": "+962 7 9000 1111",
            "business_hours": json.dumps({"Sun-Thu": "9:00 AM - 9:00 PM", "Fri": "2:00 PM - 9:00 PM"}),
            "description": "Premium luxury vehicles in the heart of Amman. Certified dealer for BMW and Mercedes-Benz.",
            "verified": True
        },
        {
            "name": "Al-Nour Cars",
            "location": "Gardens St, Amman",
            "latitude": 31.980,
            "longitude": 35.880,
            "rating": 4.5,
            "reviews_count": 89,
            "image_url": "https://images.unsplash.com/photo-1581458763581-291752b04753?q=80&w=1000",
            "showroom_images": json.dumps([
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000"
            ]),
            "contact_email": "info@alnourcars.jo",
            "contact_phone": "+962 7 9000 2222",
            "business_hours": json.dumps({"Everyday": "10:00 AM - 10:00 PM"}),
            "description": "Best prices for family sedans and SUVs. We offer financing options.",
            "verified": True
        },
        {
            "name": "Zarqa Free Zone Motors",
            "location": "Zarqa Free Zone",
            "latitude": 32.067,
            "longitude": 36.140,
            "rating": 4.2,
            "reviews_count": 215,
            "image_url": "https://images.unsplash.com/photo-1596701103001-f2fdb3ca511c?q=80&w=1000",
            "showroom_images": json.dumps([]),
            "contact_email": "contact@zarqafreezone.com",
            "contact_phone": "+962 7 9000 3333",
            "business_hours": json.dumps({"Sun-Thu": "8:00 AM - 5:00 PM"}),
            "description": "Direct imports from Korea and USA. Unbeatable wholesale prices.",
            "verified": False
        },
        {
            "name": "Royal Hybrid Center",
            "location": "Abdallah Ghosheh St, Amman",
            "latitude": 31.968,
            "longitude": 35.850,
            "rating": 4.9,
            "reviews_count": 56,
            "image_url": "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?q=80&w=1000",
            "showroom_images": json.dumps([
                 "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1000"
            ]),
            "contact_email": "service@royalhybrid.com",
            "contact_phone": "+962 7 9000 4444",
            "business_hours": json.dumps({"Sat-Thu": "9:30 AM - 8:30 PM"}),
            "description": "Specialists in Hybrid and Electric Vehicles. Toyota, Lexus, and Tesla available.",
            "verified": True
        },
        {
            "name": "Aqaba Auto Port",
            "location": "Aqaba",
            "latitude": 29.530,
            "longitude": 35.000,
            "rating": 4.0,
            "reviews_count": 32,
            "image_url": "https://images.unsplash.com/photo-1574766795819-3fde6eb2a36b?q=80&w=1000",
            "showroom_images": json.dumps([]),
            "contact_email": "sales@aqabaauto.com",
            "contact_phone": "+962 3 200 5555",
            "business_hours": json.dumps({"Sun-Thu": "9:00 AM - 6:00 PM"}),
            "description": "Your gateway to tax-free cars in Aqaba Special Economic Zone.",
            "verified": True
        }
    ]

def import_dealers_to_postgres(database_url: str):
    """Import sample dealers to PostgreSQL database."""
    # Fix Render's postgres:// URL to postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
        
    print(f"\n🏢 Checking Dealers table...")
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Check if dealers table exists and has data
    cursor.execute("SELECT COUNT(*) FROM dealers")
    existing_count = cursor.fetchone()[0]
    
    if existing_count > 0:
        if os.environ.get('FORCE_REIMPORT'):
            print(f"⚠️  Database has {existing_count} dealers. FORCE_REIMPORT is set. Clearing data...")
            cursor.execute("DELETE FROM dealers")
            conn.commit()
        else:
            print(f"✅ Database already has {existing_count} dealers. Skipping dealer import.")
            conn.close()
            return

    dealers = get_sample_dealers()
    print(f"📥 Importing {len(dealers)} sample dealers...")
    
    for dealer in dealers:
        cursor.execute("""
            INSERT INTO dealers (
                name, location, latitude, longitude, rating, reviews_count, 
                image_url, showroom_images, contact_email, contact_phone, 
                business_hours, description, verified, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            dealer['name'], dealer['location'], dealer['latitude'], dealer['longitude'],
            dealer['rating'], dealer['reviews_count'], dealer['image_url'],
            dealer['showroom_images'], dealer['contact_email'], dealer['contact_phone'],
            dealer['business_hours'], dealer['description'], dealer['verified']
        ))
    
    conn.commit()
    print(f"✅ Imported {len(dealers)} sample dealers!")
    conn.close()

def main():
    print("🚗 IntelliWheels - Import to Render PostgreSQL")
    print("=" * 50)
    
    # Get DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("\n⚠️  DATABASE_URL not found in environment.")
        print("❌ No DATABASE_URL provided. Exiting.")
        return
    
    # Parse SQL dump
    cars = parse_sql_dump()
    print(f"📥 Found {len(cars)} unique cars in SQL dump")
    
    # Import to PostgreSQL
    import_to_postgres(database_url, cars)
    
    # Import Dealers
    import_dealers_to_postgres(database_url)
    
    print("\n🎉 Done! Your Render database now has the car and dealer data.")
    print("   Refresh your website to see the contents!")

if __name__ == "__main__":
    main()
