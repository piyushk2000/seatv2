"""
Migration: Convert to weekday-only booking system
- Remove date ranges
- Keep only weekday (0-6 for Mon-Sun)
- Each user can book 1 seat per weekday
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('seats.db')
    cursor = conn.cursor()
    
    # Drop the old bookings table
    print("Dropping old bookings table...")
    cursor.execute("DROP TABLE IF EXISTS bookings")
    
    # Create new simplified bookings table
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
            UNIQUE(user_id, weekday)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✓ Migration complete! Database cleared and ready for weekday-only bookings.")

if __name__ == "__main__":
    migrate()
