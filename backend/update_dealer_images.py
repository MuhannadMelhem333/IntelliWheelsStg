import sqlite3
import json

# Connect to database
db_path = r'C:\Users\muhan\Downloads\IntelliWheels_FullStack-main\IntelliWheels_FullStack-main\backend\intelliwheels.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# New image paths (in public folder)
showroom_images = [
    '/dealers/showroom1.jfif',
    '/dealers/showroom2.jfif',
    '/dealers/showroom3.jfif',
    '/dealers/showroom4.webp'
]

# Update each dealer with correct image paths
updates = [
    {
        'id': 1,
        'showroom_images': json.dumps([showroom_images[0], showroom_images[1]]),
        'image_url': '/dealers/showroom4.webp'
    },
    {
        'id': 2,
        'showroom_images': json.dumps([showroom_images[2], showroom_images[3]]),
        'image_url': '/dealers/showroom1.jfif'
    },
    {
        'id': 3,
        'showroom_images': json.dumps(showroom_images),
        'image_url': '/dealers/showroom2.jfif'
    },
    {
        'id': 4,
        'showroom_images': json.dumps([showroom_images[0], showroom_images[3]]),
        'image_url': '/dealers/showroom3.jfif'
    }
]

for update in updates:
    cursor.execute('''
        UPDATE dealers 
        SET showroom_images = ?, image_url = ?
        WHERE id = ?
    ''', (update['showroom_images'], update['image_url'], update['id']))

conn.commit()
print(f"✅ Successfully updated image paths for {len(updates)} dealers!")

# Verify
cursor.execute('SELECT id, name, image_url FROM dealers')
for row in cursor.fetchall():
    print(f"  Dealer {row[0]}: {row[1]} - Image: {row[2]}")

conn.close()
