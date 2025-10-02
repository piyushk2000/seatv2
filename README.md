# Seat Booking System - Weekday Edition 🪑

A modern, intuitive seat booking system where users book seats for specific weekdays indefinitely.

## 🎯 Key Features

- **Weekday-Based Booking** - Select a day of the week, book a seat forever for that day
- **One Seat Per Weekday** - Each user can book one seat per weekday
- **Visual Seat Map** - Interactive canvas with floor plan support
- **Approval Workflow** - Admin approval for all bookings
- **Modern UI** - Beautiful gradients, smooth animations, responsive design
- **Role-Based Access** - User and SuperAdmin roles

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on `http://localhost:8000`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Default Login
- **Email:** `superadmin@seat.com`
- **Password:** `superadmin123`

---

## 📖 How It Works

### For Users
1. **Select a Weekday** - Choose Monday through Sunday
2. **Pick a Seat** - Click on an available (green) seat
3. **Submit Booking** - Add optional details and confirm
4. **Wait for Approval** - Admin will approve or reject
5. **View Bookings** - Check status in "My Bookings"

### For Admins
1. **Create Layout** - Upload floor plan and add seats
2. **Manage Bookings** - Approve or reject requests
3. **Manage Users** - Create, delete, reset passwords
4. **View Stats** - Dashboard with pending/approved/rejected counts

---

## 🗂️ Project Structure

```
.
├── backend/
│   ├── main.py                          # FastAPI application
│   ├── migrate_to_weekday_only.py       # Database migration
│   ├── requirements.txt                 # Python dependencies
│   └── seats.db                         # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts                   # API client
│   │   ├── components/
│   │   │   ├── Layout.tsx               # Main layout
│   │   │   └── ProtectedRoute.tsx       # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Auth state
│   │   ├── pages/
│   │   │   ├── Login.tsx                # Login page
│   │   │   ├── Dashboard.tsx            # Dashboard
│   │   │   ├── SeatMap.tsx              # Seat booking
│   │   │   ├── MyBookings.tsx           # User bookings
│   │   │   ├── AdminPanel.tsx           # Admin approvals
│   │   │   └── UserManagement.tsx       # User CRUD
│   │   └── App.tsx                      # Root component
│   ├── package.json
│   └── vite.config.ts
│
├── QUICK_START.md                       # Quick start guide
├── WEEKDAY_BOOKING_REFACTOR_COMPLETE.md # Technical details
├── UI_IMPROVEMENTS.md                   # UI documentation
├── DEPLOYMENT_CHECKLIST.md              # Deployment guide
└── README.md                            # This file
```

---

## 🎨 UI Highlights

### Modern Design
- **Gradient Cards** - Beautiful color transitions
- **Smooth Animations** - Hover effects and transitions
- **Status Badges** - Color-coded pending/approved/rejected
- **Responsive Layout** - Works on mobile, tablet, desktop

### Color Scheme
- **Blue** - Primary actions, headers
- **Green** - Success, approved bookings
- **Yellow** - Pending, warnings
- **Red** - Danger, rejected bookings

### Key Pages
1. **Seat Map** - Interactive canvas with weekday selector
2. **My Bookings** - Grouped by weekday with status
3. **Admin Panel** - Stats dashboard with filters
4. **User Management** - Create and manage users

---

## 🔐 Security

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - User vs SuperAdmin permissions
- **Input Validation** - Frontend and backend validation
- **SQL Injection Prevention** - SQLAlchemy ORM
- **Password Hashing** - Bcrypt encryption

---

## 📊 Database Schema

### Users Table
```sql
id, email, name, hashed_password, role, created_at
```

### Seats Table
```sql
id, label, x, y
```

### Bookings Table
```sql
id, seat_id, user_id, weekday, 
booked_for_name, booked_for_email, notes,
status, created_at
UNIQUE(user_id, weekday)
```

### Seat Layout Table
```sql
id, background_image, updated_at
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin support

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Canvas API** - Seat map rendering

---

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `GET /users/me` - Get current user
- `POST /auth/reset-password` - Reset own password
- `POST /auth/admin-reset-password` - Admin reset password

### Users (SuperAdmin)
- `GET /users` - List all users
- `POST /users` - Create user
- `DELETE /users/{id}` - Delete user

### Layout (SuperAdmin)
- `GET /layout` - Get seat layout
- `POST /layout` - Save seat layout

### Bookings
- `GET /seats/booked?weekday={0-6}` - Get booked seats
- `POST /bookings` - Create booking
- `GET /bookings` - List bookings
- `DELETE /bookings/{id}` - Cancel booking
- `PATCH /bookings/{id}/approve` - Approve (SuperAdmin)
- `PATCH /bookings/{id}/reject` - Reject (SuperAdmin)

---

## 🧪 Testing

### Build Test
```bash
cd frontend
npm run build
```
Expected: ✅ No errors, bundle < 300KB

### Backend Test
```bash
cd backend
python -c "import main; print('OK')"
```
Expected: ✅ No import errors

### Manual Testing
1. Login as superadmin
2. Create seat layout
3. Create a regular user
4. Login as user
5. Book a seat for Monday
6. Try booking another seat for Monday (should fail)
7. Login as superadmin
8. Approve the booking
9. Check My Bookings page

---

## 🐛 Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend won't start
- Check Node version (16+)
- Install dependencies: `npm install`
- Check port 5173 is available

### Can't book seat
- Check if weekday is selected
- Check if seat is available (green)
- Check if you already have a booking for that weekday

### Database issues
- Run migration: `python migrate_to_weekday_only.py`
- This will clear all bookings but keep users and seats

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started quickly
- **[WEEKDAY_BOOKING_REFACTOR_COMPLETE.md](WEEKDAY_BOOKING_REFACTOR_COMPLETE.md)** - Technical details
- **[UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md)** - UI/UX documentation
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Deployment guide

---

## 🎯 Roadmap

### Current Version (v1.0)
- ✅ Weekday-based booking
- ✅ Visual seat map
- ✅ Approval workflow
- ✅ User management
- ✅ Modern UI

### Future Enhancements
- [ ] Email notifications
- [ ] Booking history/analytics
- [ ] Export to CSV
- [ ] Mobile app
- [ ] Calendar integration
- [ ] Recurring booking patterns
- [ ] Seat preferences
- [ ] Team/department grouping

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For issues or questions:
1. Check the documentation
2. Review troubleshooting guide
3. Open an issue on GitHub

---

## 🎉 Acknowledgments

Built with modern web technologies and best practices for a delightful user experience.

**Happy Booking! 🪑✨**
#   s e a t v 2  
 