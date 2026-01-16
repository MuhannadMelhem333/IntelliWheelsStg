import sqlite3

# Connect to database
db_path = r'C:\Users\muhan\Downloads\IntelliWheels_FullStack-main\IntelliWheels_FullStack-main\backend\intelliwheels.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check current schema
cursor.execute("PRAGMA table_info(dealers)")
columns = [row[1] for row in cursor.fetchall()]
print("Current columns:", columns)

# Add missing columns if they don't exist
columns_to_add = [
    ('latitude', 'REAL'),
    ('longitude', 'REAL'),
    ('showroom_images', 'TEXT'),
    ('business_hours', 'TEXT'),
    ('description', 'TEXT'),
    ('verified', 'INTEGER DEFAULT 0'),
    ('rating', 'REAL'),
    ('reviews_count', 'INTEGER DEFAULT 0'),
    ('user_id', 'INTEGER'),
]

for col_name, col_type in columns_to_add:
    if col_name not in columns:
        try:
            cursor.execute(f'ALTER TABLE dealers ADD COLUMN {col_name} {col_type}')
            print(f"✅ Added column: {col_name}")
        except Exception as e:
            print(f"❌ Failed to add {col_name}: {e}")

conn.commit()
print("\n✅ Dealers table schema updated!")

# Verify
cursor.execute("PRAGMA table_info(dealers)")
print("\nFinal columns:")
for row in cursor.fetchall():
    print(f"  - {row[1]} ({row[2]})")

conn.close()
