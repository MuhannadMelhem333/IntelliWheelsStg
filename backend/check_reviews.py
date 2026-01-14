import sqlite3

conn = sqlite3.connect('intelliwheels.db')
cursor = conn.cursor()

# Check if reviews table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'")
result = cursor.fetchone()
print('Reviews table exists:', result is not None)

if result:
    # Get table schema
    cursor.execute('PRAGMA table_info(reviews)')
    print('\nReviews table schema:')
    for row in cursor.fetchall():
        print(f"  {row[1]} ({row[2]})")
    
    # Count reviews
    cursor.execute('SELECT COUNT(*) FROM reviews')
    count = cursor.fetchone()[0]
    print(f'\nTotal reviews in database: {count}')

conn.close()
