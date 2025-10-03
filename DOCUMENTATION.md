# 📚 Seat Booking System - Complete Documentation

## 📖 Table of Contents
1. [Overview](#overview)
2. [What is This App?](#what-is-this-app)
3. [Key Features](#key-features)
4. [User Roles](#user-roles)
5. [Getting Started](#getting-started)
6. [User Guide](#user-guide)
7. [Admin Guide](#admin-guide)
8. [Advanced Features](#advanced-features)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Technical Details](#technical-details)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The **Seat Booking System** is a modern, web-based application designed to manage office seat reservations on a **weekday basis**. Instead of booking seats for specific dates, users book seats for specific days of the week (e.g., "every Monday"), making it perfect for hybrid work environments where employees have regular office days.

### Why This App?

In modern hybrid workplaces:
- Employees work from office on specific weekdays
- Hot-desking requires seat coordination
- Teams need visibility into who's in the office when
- Admins need approval workflows for seat assignments

This app solves all these problems with an intuitive, visual interface.

---

## 🏢 What is This App?

### Purpose
A **weekday-based seat booking system** where:
- Users select a day of the week (Monday-Sunday)
- Users choose their preferred seat from a visual floor plan
- Bookings are **indefinite** - once approved, the seat is yours every week on that day
- Admins approve or reject booking requests
- One user can book **one seat per weekday** (max 7 seats total)

### Use Cases
1. **Hybrid Office Management**: Employees book their regular office days
2. **Hot-Desking**: Coordinate shared workspace usage
3. **Team Planning**: See who's in the office on which days
4. **Space Optimization**: Track seat utilization by weekday
5. **Flexible Workspaces**: Manage rotating desk assignments

---

## ✨ Key Features

### 🪑 Visual Seat Selection
- **Interactive Canvas**: Click seats on a visual floor plan
- **Custom Floor Plans**: Upload your office layout as background
- **Color-Coded Status**: 
  - 🟢 Green = Available
  - 🔴 Red = Booked
  - 🔵 Blue Border = Your Selection
- **Hover Tooltips**: See seat details on hover
- **Zoom & Pan**: Navigate large floor plans easily

### 📅 Weekday-Based Booking
- Select any day of the week (Monday-Sunday)
- Book indefinitely for that weekday
- One seat per weekday limit
- Switch between weekdays with arrow keys

### ✅ Approval Workflow
- All bookings require admin approval
- Three states: Pending, Approved, Rejected
- Admins can filter by weekday
- Users can cancel pending bookings

### 👥 User Management
- Two roles: User and SuperAdmin
- Admins can create/delete users
- Password reset functionality
- Role-based access control

### 🎨 Modern UI/UX
- Dark navy blue theme
- Fixed sidebar navigation
- Responsive design (mobile-friendly)
- Toast notifications
- Smooth animations

### 🔍 Advanced Features
- **Search**: Find seats by label
- **Bulk Selection**: Select multiple seats with Shift+Click
- **Undo/Redo**: Full history in edit mode
- **Export/Import**: Backup and restore layouts
- **Keyboard Shortcuts**: Power user features

---

## 👤 User Roles

### Regular User
**Can:**
- View seat map
- Book seats for any weekday
- View their bookings
- Cancel pending bookings
- Search for seats
- Select multiple seats

**Cannot:**
- Edit seat layout
- Approve bookings
- Manage users
- Access admin panel

### SuperAdmin
**Can do everything Users can, plus:**
- Edit seat layout (add/remove seats)
- Upload floor plan images
- Approve/reject bookings
- View all bookings
- Create/delete users
- Reset user passwords
- Export/import layouts
- Adjust seat sizes

---

## 🚀 Getting Started

### Installation

#### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on `http://localhost:8000`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` or `http://localhost:5174`

### First Login
**Default SuperAdmin Credentials:**
- Email: `superadmin@seat.com`
- Password: `superadmin123`

⚠️ **Important**: Change this password after first login!

---

## 📖 User Guide

### How to Book a Seat

#### Step 1: Select a Weekday
1. Navigate to **Book Seat** from the sidebar
2. Choose your desired weekday (Monday-Sunday)
3. Use arrow keys (← →) to switch between weekdays

#### Step 2: Choose Your Seat
1. View the seat map canvas
2. Green seats are available, red seats are booked
3. Hover over seats to see details
4. Click on a green seat to select it
5. Click again to deselect

**Tips:**
- Hold **Shift** and click to select multiple seats
- Click **"Select All Available"** to select all green seats
- Use the **search bar** to find specific seats (e.g., "A1")

#### Step 3: Confirm Booking
1. Review your selection in the sidebar
2. Click **"Continue to Book"**
3. Fill in optional details:
   - Booked For: Name of person using the seat
   - Email: Contact email
   - Notes: Special requirements
4. Click **"Confirm Booking"** or press **Enter**

#### Step 4: Wait for Approval
- Your booking status will be **Pending**
- Admin will review and approve/reject
- Check **My Bookings** to see status

### Managing Your Bookings

#### View Bookings
1. Go to **My Bookings** from sidebar
2. Bookings are grouped by weekday
3. See status badges:
   - 🟡 **PENDING** - Awaiting approval
   - 🟢 **APPROVED** - Confirmed
   - 🔴 **REJECTED** - Denied

#### Cancel a Booking
1. Find the booking in **My Bookings**
2. Click **"✕ Cancel"** button
3. Confirm cancellation
4. Booking is removed immediately

---

## 🔧 Admin Guide

### Setting Up the Seat Layout

#### Step 1: Enter Edit Mode
1. Go to **Book Seat** page
2. Click **"✏️ Edit Layout"** button (top-right)
3. Canvas enters edit mode

#### Step 2: Upload Floor Plan (Optional)
1. In the sidebar, find **"Floor Plan Image"**
2. Click **"Choose File"**
3. Select your office floor plan image (max 5MB)
4. Image appears as canvas background

#### Step 3: Add Seats
1. **Set Seat Prefix**: Enter letter prefix (e.g., "A", "B")
2. **Adjust Seat Size**: Use slider (5px-30px)
3. **Click on canvas** to add seats
4. Seats auto-number (A1, A2, A3...)

**Tips:**
- Zoom in for precise placement
- Pan by clicking and dragging empty space
- Use **Undo** (Ctrl+Z) if you make a mistake

#### Step 4: Remove Seats
1. Click on existing seats to select for deletion
2. Selected seats turn red
3. Click **"Delete X Seat(s)"** button
4. Or use **"Clear All Seats"** to start over

#### Step 5: Save Layout
1. Click **"💾 Save Layout"**
2. Layout is saved to database
3. All users see the updated layout

### Managing Bookings

#### View All Bookings
1. Go to **Approvals** from sidebar
2. See stats dashboard:
   - Pending count
   - Approved count
   - Rejected count

#### Filter by Weekday
1. Click weekday buttons to filter
2. Click **"All Days"** to see everything
3. Badge shows booking count per day

#### Approve a Booking
1. Find pending booking
2. Review details (user, seat, weekday)
3. Click **"✓ Approve"**
4. User is notified

#### Reject a Booking
1. Find pending booking
2. Click **"✕ Reject"**
3. User can see rejection in their bookings

### Managing Users

#### Create a User
1. Go to **Users** from sidebar
2. Click **"➕ Create User"**
3. Fill in details:
   - Name
   - Email
   - Password
   - Role (User or SuperAdmin)
4. Click **"Create User"**

#### Reset User Password
1. Find user in table
2. Click **"🔑 Reset"**
3. Enter new password
4. Click **"Reset Password"**

#### Delete a User
1. Find user in table
2. Click **"🗑️ Delete"**
3. Confirm deletion
4. User and their bookings are removed

### Advanced Admin Features

#### Export Layout
1. In edit mode, scroll to **"IMPORT/EXPORT"**
2. Click **"📤 Export Layout"**
3. JSON file downloads automatically
4. Save as backup

#### Import Layout
1. Click **"📥 Import Layout"**
2. Select previously exported JSON file
3. Layout is restored
4. Overwrites current layout

#### Undo/Redo
- **Undo**: Ctrl+Z or click **"↶ Undo"**
- **Redo**: Ctrl+Y or click **"↷ Redo"**
- Full history of seat additions/deletions

---

## 🎯 Advanced Features

### Zoom & Pan

#### Zoom Controls
- **Zoom In**: Click **🔍+** button
- **Zoom Out**: Click **🔍-** button
- **Reset View**: Click **↺** button
- **Zoom Range**: 50% to 300%

#### Pan Controls
- **Click & Drag**: Click empty space and drag
- **Ctrl+Click**: Hold Ctrl and drag anywhere
- **Middle Mouse**: Click middle button and drag

### Search & Filter

#### Search Seats
1. Type in search box above weekday selector
2. Enter seat label (e.g., "A1", "B2")
3. Canvas shows only matching seats
4. Clear search to see all

#### Filter by Availability
- Green seats are available
- Red seats are booked
- Use search to find specific seats

### Bulk Operations

#### Select Multiple Seats
1. Select a weekday
2. Hold **Shift** key
3. Click seats one by one
4. All clicked seats are selected

#### Select All Available
1. Select a weekday
2. Click **"Select All Available"**
3. All green seats are selected
4. Review in sidebar before booking

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Esc` | Close dialog | Any dialog open |
| `Enter` | Confirm booking | Booking dialog |
| `Ctrl+Z` | Undo | Edit mode |
| `Ctrl+Y` | Redo | Edit mode |
| `←` | Previous weekday | Weekday selected |
| `→` | Next weekday | Weekday selected |
| `Shift+Click` | Multi-select | Seat selection |
| `Ctrl+Click` | Pan canvas | Canvas |

### Mobile Features

#### Responsive Design
- Sidebar collapses to hamburger menu
- Touch-friendly buttons (44px minimum)
- Canvas scales to screen size
- Single column layout on mobile

#### Touch Gestures
- **Tap**: Select seat
- **Tap & Hold**: See seat info
- **Drag**: Pan canvas
- **Pinch**: Zoom (browser native)

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- **Esc** - Close any open dialog
- **Enter** - Confirm action in dialog

### Navigation Shortcuts
- **← (Left Arrow)** - Previous weekday
- **→ (Right Arrow)** - Next weekday

### Edit Mode Shortcuts
- **Ctrl+Z** - Undo last action
- **Ctrl+Y** - Redo action
- **Ctrl+Click** - Pan canvas

### Selection Shortcuts
- **Shift+Click** - Add to selection
- **Click** - Toggle selection

---

## 🔧 Technical Details

### Technology Stack

#### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin support

#### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Canvas API** - Seat map rendering
- **React Router** - Navigation
- **CSS Variables** - Theming

### Database Schema

#### Users Table
```sql
id              INTEGER PRIMARY KEY
email           TEXT UNIQUE
name            TEXT
hashed_password TEXT
role            TEXT (user/superadmin)
created_at      TIMESTAMP
```

#### Seats Table
```sql
id     INTEGER PRIMARY KEY
label  TEXT
x      FLOAT (0-100, percentage)
y      FLOAT (0-100, percentage)
```

#### Bookings Table
```sql
id               INTEGER PRIMARY KEY
seat_id          INTEGER (FK to seats)
user_id          INTEGER (FK to users)
weekday          INTEGER (0-6, Mon-Sun)
booked_for_name  TEXT (optional)
booked_for_email TEXT (optional)
notes            TEXT (optional)
status           TEXT (pending/approved/rejected)
created_at       TIMESTAMP

UNIQUE(user_id, weekday)
```

#### Seat Layout Table
```sql
id               INTEGER PRIMARY KEY
background_image TEXT (base64 data URL)
updated_at       TIMESTAMP
```

### API Endpoints

#### Authentication
- `POST /auth/login` - Login with email/password
- `GET /users/me` - Get current user info
- `POST /auth/reset-password` - Reset own password
- `POST /auth/admin-reset-password` - Admin reset user password

#### Users (SuperAdmin Only)
- `GET /users` - List all users
- `POST /users` - Create new user
- `DELETE /users/{id}` - Delete user

#### Layout (SuperAdmin Only)
- `GET /layout` - Get seat layout and background
- `POST /layout` - Save seat layout and background

#### Bookings
- `GET /seats/booked?weekday={0-6}` - Get booked seats for weekday
- `POST /bookings` - Create booking(s)
- `GET /bookings` - List user's bookings (or all if admin)
- `DELETE /bookings/{id}` - Cancel booking
- `PATCH /bookings/{id}/approve` - Approve booking (SuperAdmin)
- `PATCH /bookings/{id}/reject` - Reject booking (SuperAdmin)

### Security Features

#### Authentication
- JWT tokens with expiration
- Secure password hashing (Bcrypt)
- Role-based access control
- Protected routes

#### Validation
- Input validation on frontend and backend
- SQL injection prevention (SQLAlchemy ORM)
- File upload size limits (5MB)
- File type validation (images only)

#### Best Practices
- HTTPS recommended for production
- Environment variables for secrets
- CORS configuration
- Rate limiting (recommended)

---

## 🐛 Troubleshooting

### Common Issues

#### Cannot Login
**Problem**: "Invalid credentials" error

**Solutions:**
1. Check email and password spelling
2. Use default credentials: `superadmin@seat.com` / `superadmin123`
3. Check if backend is running on port 8000
4. Clear browser cache and cookies

#### Seats Not Showing
**Problem**: Canvas is blank or seats missing

**Solutions:**
1. Check if layout has been created (Admin only)
2. Refresh the page
3. Check browser console for errors
4. Verify backend is running

#### Cannot Book Seat
**Problem**: Booking fails or button disabled

**Solutions:**
1. Select a weekday first
2. Select at least one green (available) seat
3. Check if you already have a booking for that weekday
4. Verify you're not selecting a red (booked) seat

#### Zoom/Pan Not Working
**Problem**: Canvas doesn't zoom or pan

**Solutions:**
1. Use zoom buttons (+ / -)
2. Click and drag empty space to pan
3. Try Ctrl+Click to pan
4. Click reset button (↺) to reset view

#### Image Upload Fails
**Problem**: Floor plan won't upload

**Solutions:**
1. Check file size (max 5MB)
2. Use image formats: JPG, PNG, GIF
3. Try a smaller image
4. Check browser console for errors

#### Mobile Menu Not Working
**Problem**: Sidebar doesn't open on mobile

**Solutions:**
1. Look for hamburger menu (☰) in top-left
2. Tap the menu icon
3. Refresh the page
4. Try landscape orientation

### Error Messages

#### "Please select a weekday first"
- You must select a weekday before choosing seats
- Click one of the weekday buttons (Monday-Sunday)

#### "Seat booked by [name]"
- This seat is already booked by another user
- Choose a different seat (green ones)

#### "You already have a booking for this weekday"
- You can only book one seat per weekday
- Cancel existing booking first, or choose different weekday

#### "Image too large (max 5MB)"
- Your floor plan image exceeds size limit
- Compress the image or use a smaller one

#### "Invalid layout file"
- The imported JSON file is corrupted or wrong format
- Use a file exported from this app

### Performance Issues

#### Slow Canvas Rendering
**Solutions:**
1. Reduce number of seats
2. Use smaller background image
3. Reduce zoom level
4. Close other browser tabs

#### Slow Page Load
**Solutions:**
1. Check internet connection
2. Clear browser cache
3. Restart backend server
4. Check backend logs for errors

---

## 📞 Support

### Getting Help

#### Documentation
- Read this documentation thoroughly
- Check README.md for quick start
- Review QUICK_START.md for setup

#### Troubleshooting
- Check the troubleshooting section above
- Look for error messages in browser console (F12)
- Check backend logs in terminal

#### Common Questions

**Q: Can I book multiple seats for one weekday?**
A: No, each user can book only one seat per weekday.

**Q: How long does a booking last?**
A: Bookings are indefinite - once approved, the seat is yours every week on that day until you cancel.

**Q: Can I change my booking?**
A: Yes, cancel your current booking and create a new one.

**Q: What happens if I'm on vacation?**
A: Your booking remains active. Consider canceling if you'll be away for extended periods.

**Q: Can I book for someone else?**
A: Yes, use the "Booked For" field when creating a booking.

**Q: How do I become a SuperAdmin?**
A: Only existing SuperAdmins can create new SuperAdmin accounts.

---

## 🎉 Best Practices

### For Users
1. **Book Early**: Reserve your preferred seats as soon as possible
2. **Cancel Unused**: Cancel bookings if your schedule changes
3. **Use Notes**: Add notes for special requirements
4. **Check Status**: Regularly check My Bookings for approval status

### For Admins
1. **Backup Layout**: Export layout regularly as backup
2. **Review Promptly**: Approve/reject bookings quickly
3. **Communicate**: Add notes when rejecting bookings
4. **Monitor Usage**: Check stats to optimize space
5. **Update Layout**: Keep floor plan current with office changes

### For Teams
1. **Coordinate**: Discuss team office days
2. **Sit Together**: Book nearby seats for collaboration
3. **Be Flexible**: Have backup seat preferences
4. **Respect Bookings**: Don't use others' approved seats

---

## 📈 Future Enhancements

### Planned Features
- Email notifications for booking status
- Calendar integration
- Booking analytics and reports
- Team/department grouping
- Recurring patterns (e.g., every other week)
- Seat preferences and favorites
- Mobile app (iOS/Android)
- Slack/Teams integration

### Feedback
We welcome feedback and feature requests! Contact your system administrator to suggest improvements.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for an excellent user experience.

**Happy Booking! 🪑✨**

---

*Last Updated: January 2025*
*Version: 2.0*
