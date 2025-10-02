"""
Migration: Allow multiple seats per weekday
- Remove UNIQUE constraint on (user_id, weekday)
- Add UNIQUE constraint on (user_id, weekday, seat_id)
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('seats.db')
    cursor = conn.cursor()
    
    # Get existing bookings
    print("Backing up existing bookings...")
    cursor.execute("SELECT * FROM bookings")
    existing_bookings = cursor.fetchall()
    
    # Drop the old bookings table
    print("Dropping old bookings table...")
    cursor.execute("DROP TABLE IF EXISTS bookings")
    
    # Create new bookings table with updated constraint
    print("Creating new bookings table...")
    cursor.execute("""
        CREATE TABLE bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seat_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            weekday INTEGER NOT NULL,
            booked_for_name TEXT,
            booked_for_email TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, weekday, seat_id)
        )
    """)
    
    # Restore bookings if any
    if existing_bookings:
        print(f"Restoring {len(existing_bookings)} bookings...")
        for booking in existing_bookings:
            try:
                cursor.execute("""
                    INSERT INTO bookings (id, seat_id, user_id, weekday, booked_for_name, 
                                        booked_for_email, notes, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, booking)
            except Exception as e:
                print(f"Warning: Could not restore booking {booking[0]}: {e}")
    
    conn.commit()
    conn.close()
    print("✓ Migration complete! Users can now book multiple seats per weekday.")

if __name__ == "__main__":
    migrate()
