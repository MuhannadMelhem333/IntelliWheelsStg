import sqlite3

conn = sqlite3.connect('intelliwheels.db')
cursor = conn.cursor()

# Get cars table schema
cursor.execute('PRAGMA table_info(cars)')
print('Cars table schema:')
for row in cursor.fetchall():
    print(f"  {row[1]} ({row[2]})")

# Get a sample car to see what fields exist
cursor.execute('SELECT * FROM cars LIMIT 1')
sample = cursor.fetchone()
if sample:
    print('\nSample car columns:')
    cursor.execute('PRAGMA table_info(cars)')
    cols = [row[1] for row in cursor.fetchall()]
    for i, col in enumerate(cols):
        if sample[i]:
            print(f"  {col}: {str(sample[i])[:100]}")

conn.close()
