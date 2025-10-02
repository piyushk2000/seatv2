from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Enum, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import enum

# Database setup
DATABASE_URL = "sqlite:///./seats.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Enums
class UserRole(str, enum.Enum):
    USER = "user"
    SUPERADMIN = "superadmin"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Removed BookingType - only weekday bookings now

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)

class Seat(Base):
    __tablename__ = "seats"
    id = Column(String, primary_key=True)
    label = Column(String, unique=True)
    x = Column(Float)
    y = Column(Float)

class SeatLayout(Base):
    __tablename__ = "seat_layout"
    id = Column(Integer, primary_key=True)
    background_image = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(String, nullable=False)
    user_id = Column(Integer, nullable=False, index=True)
    weekday = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    booked_for_name = Column(String, nullable=True)
    booked_for_email = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PasswordReset(BaseModel):
    old_password: str
    new_password: str

class SuperAdminPasswordReset(BaseModel):
    user_id: int
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SeatData(BaseModel):
    id: str
    label: str
    x: float
    y: float

class Layout(BaseModel):
    seats: List[SeatData]
    background_image: Optional[str] = None

class LayoutResponse(BaseModel):
    seats: List[SeatData]
    background_image: Optional[str] = None

class BookingCreate(BaseModel):
    seat_ids: List[str]  # Multiple seats allowed
    weekday: int  # 0=Monday, 6=Sunday
    booked_for_name: Optional[str] = None
    booked_for_email: Optional[EmailStr] = None
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    seat_id: str
    seat_label: Optional[str] = None
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    booked_for_name: Optional[str]
    booked_for_email: Optional[str]
    notes: Optional[str]
    status: str
    weekday: int  # 0=Monday, 6=Sunday
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingUpdate(BaseModel):
    status: str

class BulkApprove(BaseModel):
    booking_ids: List[int]

# Removed BulkApproveGroup - no more group bookings

# FastAPI app
app = FastAPI(title="Seat Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_superadmin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(status_code=403, detail="SuperAdmin access required")
    return current_user

# Routes
@app.on_event("startup")
def startup():
    db = SessionLocal()
    superadmin = db.query(User).filter(User.email == "superadmin@seat.com").first()
    if not superadmin:
        superadmin = User(
            email="superadmin@seat.com",
            name="Super Admin",
            hashed_password=pwd_context.hash("superadmin123"),
            role=UserRole.SUPERADMIN
        )
        db.add(superadmin)
        db.commit()
        print("✓ SuperAdmin created: superadmin@seat.com / superadmin123")
    db.close()

@app.get("/")
def root():
    return {"message": "Seat Management API", "superadmin": "superadmin@seat.com / superadmin123"}

# Auth routes
@app.post("/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@app.get("/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# User management (SuperAdmin only)
@app.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"Email {user_data.email} is already registered")
    
    try:
        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=pwd_context.hash(user_data.password),
            role=UserRole(user_data.role)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    users = db.query(User).all()
    return users

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

# Password management
@app.post("/auth/reset-password")
def reset_password(
    data: PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not pwd_context.verify(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    current_user.hashed_password = pwd_context.hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.post("/auth/admin-reset-password")
def admin_reset_password(
    data: SuperAdminPasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = pwd_context.hash(data.new_password)
    db.commit()
    return {"message": f"Password reset for {user.email}"}

# Layout management
@app.get("/layout", response_model=LayoutResponse)
def get_layout(db: Session = Depends(get_db)):
    seats = db.query(Seat).all()
    layout = db.query(SeatLayout).first()
    
    return LayoutResponse(
        seats=[SeatData(
            id=s.id,
            label=s.label,
            x=s.x,
            y=s.y
        ) for s in seats],
        background_image=layout.background_image if layout else None
    )

@app.get("/seats/booked")
def get_booked_seats(
    weekday: int,
    db: Session = Depends(get_db)
):
    """Get list of seat IDs that are booked (pending or approved) for the given weekday"""
    bookings = db.query(Booking).filter(
        Booking.weekday == weekday,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
    ).all()
    
    # Return seat IDs with user info for display
    booked_seats = {}
    for b in bookings:
        user = db.query(User).filter(User.id == b.user_id).first()
        booked_seats[b.seat_id] = {
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else None,
            "status": b.status.value
        }
    
    return {"booked_seats": booked_seats}

@app.post("/layout", response_model=LayoutResponse)
def save_layout(
    data: Layout,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    # Delete all existing seats
    db.query(Seat).delete()
    
    # Add new seats
    for seat_data in data.seats:
        seat = Seat(
            id=seat_data.id,
            label=seat_data.label,
            x=seat_data.x,
            y=seat_data.y
        )
        db.add(seat)
    
    # Save or update background image
    layout = db.query(SeatLayout).first()
    if layout:
        layout.background_image = data.background_image
        layout.updated_at = datetime.utcnow()
    else:
        layout = SeatLayout(background_image=data.background_image)
        db.add(layout)
    
    db.commit()
    
    return LayoutResponse(
        seats=data.seats,
        background_image=data.background_image
    )

# Booking management
@app.post("/bookings", response_model=List[BookingResponse])
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate weekday
    if data.weekday < 0 or data.weekday > 6:
        raise HTTPException(status_code=400, detail="Weekday must be between 0 (Monday) and 6 (Sunday)")
    
    if not data.seat_ids or len(data.seat_ids) == 0:
        raise HTTPException(status_code=400, detail="At least one seat must be selected")
    
    bookings = []
    
    for seat_id in data.seat_ids:
        # Check if seat exists
        seat = db.query(Seat).filter(Seat.id == seat_id).first()
        if not seat:
            raise HTTPException(status_code=404, detail=f"Seat {seat_id} not found")
        
        # Check if user already has this specific seat booked for this weekday
        existing_booking = db.query(Booking).filter(
            Booking.user_id == current_user.id,
            Booking.seat_id == seat_id,
            Booking.weekday == data.weekday,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
        ).first()
        
        if existing_booking:
            raise HTTPException(
                status_code=400, 
                detail=f"You already have Seat {seat.label} booked for this weekday"
            )
        
        # Check if seat is already booked by someone else for this weekday
        seat_booking = db.query(Booking).filter(
            Booking.seat_id == seat_id,
            Booking.weekday == data.weekday,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
        ).first()
        
        if seat_booking:
            raise HTTPException(status_code=400, detail=f"Seat {seat.label} is already booked for this weekday")
        
        # Create booking
        booking = Booking(
            seat_id=seat_id,
            user_id=current_user.id,
            weekday=data.weekday,
            booked_for_name=data.booked_for_name,
            booked_for_email=data.booked_for_email,
            notes=data.notes,
            status=BookingStatus.PENDING
        )
        db.add(booking)
        bookings.append(booking)
    
    db.commit()
    
    # Prepare response
    response = []
    for booking in bookings:
        db.refresh(booking)
        seat = db.query(Seat).filter(Seat.id == booking.seat_id).first()
        response.append(BookingResponse(
            id=booking.id,
            seat_id=booking.seat_id,
            seat_label=seat.label if seat else booking.seat_id,
            user_id=booking.user_id,
            user_name=current_user.name,
            user_email=current_user.email,
            booked_for_name=booking.booked_for_name,
            booked_for_email=booking.booked_for_email,
            notes=booking.notes,
            status=booking.status.value,
            weekday=booking.weekday,
            created_at=booking.created_at
        ))
    
    return response

@app.get("/bookings", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.SUPERADMIN:
        bookings = db.query(Booking).all()
    else:
        bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    
    response = []
    for b in bookings:
        seat = db.query(Seat).filter(Seat.id == b.seat_id).first()
        user = db.query(User).filter(User.id == b.user_id).first()
        
        response.append(BookingResponse(
            id=b.id,
            seat_id=b.seat_id,
            seat_label=seat.label if seat else b.seat_id,
            user_id=b.user_id,
            user_name=user.name if user else "Unknown",
            user_email=user.email if user else None,
            booked_for_name=b.booked_for_name,
            booked_for_email=b.booked_for_email,
            notes=b.notes,
            status=b.status.value,
            weekday=b.weekday,
            created_at=b.created_at
        ))
    
    return response

@app.patch("/bookings/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus(data.status)
    db.commit()
    db.refresh(booking)
    return booking

# Removed bulk/group operations - single seat bookings only

@app.delete("/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if current_user.role != UserRole.SUPERADMIN and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking cancelled"}

@app.patch("/bookings/{booking_id}/approve")
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.APPROVED
    db.commit()
    return {"message": "Booking approved"}

@app.patch("/bookings/{booking_id}/reject")
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.REJECTED
    db.commit()
    return {"message": "Booking rejected"}
