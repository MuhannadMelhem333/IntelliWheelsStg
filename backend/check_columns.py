import sqlite3

conn = sqlite3.connect('intelliwheels.db')
cursor = conn.cursor()

# Get all columns
cursor.execute('PRAGMA table_info(cars)')
print('All columns in cars table:')
for col in cursor.fetchall():
    print(f'  {col[1]} ({col[2]})')

# Get a sample car
cursor.execute('SELECT * FROM cars LIMIT 1')
row = cursor.fetchone()

if row:
    cursor.execute('PRAGMA table_info(cars)')
    cols = [col[1] for col in cursor.fetchall()]
    
    print('\nSample car data (non-null fields):')
    for i, col_name in enumerate(cols):
        if row[i]:
            value_str = str(row[i])[:100]
            print(f'  {col_name}: {value_str}')

conn.close()
