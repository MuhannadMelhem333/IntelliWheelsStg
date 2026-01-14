import sqlite3
import json

conn = sqlite3.connect('intelliwheels.db')
cursor = conn.cursor()

# Get a sample car with its image data
cursor.execute('SELECT id, make, model, image, imageUrls, image_urls, galleryImages, gallery_images FROM cars LIMIT 1')
row = cursor.fetchone()

if row:
    print('Sample car data:')
    print(f'ID: {row[0]}')
    print(f'Make: {row[1]}')
    print(f'Model: {row[2]}')
    print(f'image: {row[3]}')
    print(f'imageUrls: {row[4]}')
    print(f'image_urls: {row[5]}')
    print(f'galleryImages: {row[6]}')
    print(f'gallery_images: {row[7]}')
    
    # Check which fields actually exist
    cursor.execute('PRAGMA table_info(cars)')
    print('\nAll image-related columns in cars table:')
    for col in cursor.fetchall():
        col_name = col[1]
        if 'image' in col_name.lower() or 'gallery' in col_name.lower():
            print(f'  {col_name} ({col[2]})')

conn.close()
