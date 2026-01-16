import sqlite3
import json

# Connect to database
db_path = r'C:\Users\muhan\Downloads\IntelliWheels_FullStack-main\IntelliWheels_FullStack-main\backend\intelliwheels.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Amman coordinates (different locations around the city)
amman_locations = [
    {'name': 'Premium Motors Amman', 'lat': 31.9539, 'lng': 35.9106, 'area': 'Downtown Amman'},
    {'name': 'Elite Auto Gallery', 'lat': 31.9686, 'lng': 35.8358, 'area': 'Abdoun'},
    {'name': 'Royal Car Center', 'lat': 31.9945, 'lng': 35.8709, 'area': 'Shmeisani'},
    {'name': 'Luxury Wheels Jordan', 'lat': 31.9167, 'lng': 35.9333, 'area': 'Mecca Street'},
]

# Image paths (convert to web paths)
showroom_images = [
    '/images (1).jfif',
    '/images (2).jfif',
    '/images.jfif',
    '/outdoor-photo-modern-car-dealership-260nw-2591202017.webp'
]

# Business hours
business_hours = {
    'Sunday': '9:00 AM - 8:00 PM',
    'Monday': '9:00 AM - 8:00 PM',
    'Tuesday': '9:00 AM - 8:00 PM',
    'Wednesday': '9:00 AM - 8:00 PM',
    'Thursday': '9:00 AM - 8:00 PM',
    'Friday': 'Closed',
    'Saturday': '10:00 AM - 6:00 PM'
}

# Sample dealers
dealers = [
    {
        'name': 'Premium Motors Amman',
        'location': 'Downtown Amman, Jordan',
        'latitude': 31.9539,
        'longitude': 35.9106,
        'contact_email': 'info@premiummotors.jo',
        'contact_phone': '+962-6-123-4567',
        'description': 'Leading luxury car dealership in Amman with over 20 years of experience. Specializing in European luxury brands including Mercedes-Benz, BMW, and Audi. We offer comprehensive after-sales service and financing options.',
        'verified': 1,
        'rating': 4.8,
        'reviews_count': 156,
        'showroom_images': json.dumps(showroom_images[:2]),
        'business_hours': json.dumps(business_hours),
        'image_url': '/outdoor-photo-modern-car-dealership-260nw-2591202017.webp'
    },
    {
        'name': 'Elite Auto Gallery',
        'location': 'Abdoun, Amman, Jordan',
        'latitude': 31.9686,
        'longitude': 35.8358,
        'contact_email': 'sales@eliteauto.jo',
        'contact_phone': '+962-6-234-5678',
        'description': 'Premium automotive showroom featuring the finest selection of sports cars and luxury vehicles. Certified pre-owned vehicles with warranty. Expert team ready to assist you in finding your dream car.',
        'verified': 1,
        'rating': 4.9,
        'reviews_count': 203,
        'showroom_images': json.dumps([showroom_images[2], showroom_images[3]]),
        'business_hours': json.dumps(business_hours),
        'image_url': '/images (1).jfif'
    },
    {
        'name': 'Royal Car Center',
        'location': 'Shmeisani, Amman, Jordan',
        'latitude': 31.9945,
        'longitude': 35.8709,
        'contact_email': 'contact@royalcars.jo',
        'contact_phone': '+962-6-345-6789',
        'description': 'Your trusted partner for quality vehicles in Jordan. Wide range of new and certified pre-owned cars. Competitive pricing, flexible financing, and exceptional customer service. Visit our modern showroom today!',
        'verified': 1,
        'rating': 4.7,
        'reviews_count': 128,
        'showroom_images': json.dumps(showroom_images),
        'business_hours': json.dumps(business_hours),
        'image_url': '/images (2).jfif'
    },
    {
        'name': 'Luxury Wheels Jordan',
        'location': 'Mecca Street, Amman, Jordan',
        'latitude': 31.9167,
        'longitude': 35.9333,
        'contact_email': 'info@luxurywheels.jo',
        'contact_phone': '+962-6-456-7890',
        'description': 'Exclusive dealership for high-end automobiles. Featuring the latest models from top manufacturers. Professional service center with certified technicians. Trade-in options available.',
        'verified': 0,
        'rating': 4.6,
        'reviews_count': 89,
        'showroom_images': json.dumps([showroom_images[0], showroom_images[3]]),
        'business_hours': json.dumps(business_hours),
        'image_url': '/images.jfif'
    }
]

# Insert dealers
for dealer in dealers:
    cursor.execute('''
        INSERT INTO dealers (
            name, location, latitude, longitude, contact_email, contact_phone,
            description, verified, rating, reviews_count, showroom_images,
            business_hours, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        dealer['name'],
        dealer['location'],
        dealer['latitude'],
        dealer['longitude'],
        dealer['contact_email'],
        dealer['contact_phone'],
        dealer['description'],
        dealer['verified'],
        dealer['rating'],
        dealer['reviews_count'],
        dealer['showroom_images'],
        dealer['business_hours'],
        dealer['image_url']
    ))

conn.commit()
print(f"✅ Successfully added {len(dealers)} dealers to the database!")

# Verify
cursor.execute('SELECT COUNT(*) FROM dealers')
count = cursor.fetchone()[0]
print(f"📊 Total dealers in database: {count}")

# Show details
cursor.execute('SELECT name, location, latitude, longitude, verified FROM dealers')
for row in cursor.fetchall():
    verified_badge = "✓" if row[4] else "○"
    print(f"{verified_badge} {row[0]} - {row[1]} ({row[2]}, {row[3]})")

conn.close()
