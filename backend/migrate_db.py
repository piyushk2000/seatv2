"""
Database migration script to add booking_group_id column
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('seats.db')
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(bookings)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'booking_group_id' not in columns:
            print("Adding booking_group_id column...")
            cursor.execute("ALTER TABLE bookings ADD COLUMN booking_group_id TEXT")
            conn.commit()
            print("✓ Column added successfully!")
        else:
            print("✓ Column already exists")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
