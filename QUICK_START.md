# Quick Start Guide 🚀

## Setup & Run

### 1. Start Backend
```bash
cd backend
python main.py
```
Backend runs on: `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Login
**SuperAdmin Credentials:**
- Email: `superadmin@seat.com`
- Password: `superadmin123`

---

## How to Use

### For Regular Users

#### Book a Seat
1. Go to **Seat Map** page
2. **Select a weekday** (Monday-Sunday)
3. Click on a **green seat** (available)
4. Fill optional details (booked for, notes)
5. Click **Confirm Booking**
6. Wait for admin approval

#### View Your Bookings
1. Go to **My Bookings** page
2. See all your bookings grouped by weekday
3. Cancel bookings if needed

### For SuperAdmin

#### Create Seat Layout
1. Go to **Seat Map**
2. Click **Edit Mode**
3. **Upload floor plan** image (optional)
4. **Click on canvas** to add seats
5. Change **seat prefix** (A, B, C, etc.)
6. Click **Save Layout**

#### Approve Bookings
1. Go to **Admin Panel**
2. See stats: pending, approved, rejected
3. **Filter by weekday** (optional)
4. Click **✓ Approve** or **✕ Reject** for each booking

#### Manage Users
1. Go to **User Management**
2. Click **Create User**
3. Fill email, name, password, role
4. Click **Create**
5. Reset passwords or delete users as needed

---

## Key Features

### Weekday Booking System
- ✅ Select weekday first, then seat
- ✅ One seat per weekday per user
- ✅ Indefinite bookings (no end date)
- ✅ Real-time availability

### Visual Seat Map
- 🟢 Green = Available
- 🔴 Red = Booked
- 🔵 Blue border = Selected

### Status Flow
1. **Pending** (yellow) - Waiting for approval
2. **Approved** (green) - Confirmed booking
3. **Rejected** (red) - Denied by admin

---

## Tips

### For Users
- You can only book **1 seat per weekday**
- Bookings are **indefinite** (every week on that day)
- You can **cancel** your own bookings anytime
- Check **My Bookings** to see status

### For Admins
- Use **weekday filter** to focus on specific days
- **Stats dashboard** shows overview at a glance
- You can **approve/reject** individually
- **Edit mode** lets you redesign the layout anytime

---

## Troubleshooting

### Seat already booked?
- Someone else booked it for that weekday
- Try a different seat or weekday

### Can't book multiple seats?
- System allows **1 seat per weekday** only
- Book different weekdays if you need multiple days

### Booking not showing?
- Refresh the page
- Check **My Bookings** page
- Wait for admin approval

### Backend not starting?
- Check if port 8000 is available
- Install dependencies: `pip install -r requirements.txt`

### Frontend not starting?
- Check if port 5173 is available
- Install dependencies: `npm install`

---

## Database Reset

If you need to clear all bookings:
```bash
cd backend
python migrate_to_weekday_only.py
```

This will:
- Drop old bookings table
- Create fresh bookings table
- Keep users and seats intact

---

## Default Credentials

**SuperAdmin:**
- Email: `superadmin@seat.com`
- Password: `superadmin123`

**Create more users** via User Management page!

---

## Support

For issues or questions:
1. Check the error message
2. Review this guide
3. Check `WEEKDAY_BOOKING_REFACTOR_COMPLETE.md` for details

---

**Happy Booking! 🪑✨**
