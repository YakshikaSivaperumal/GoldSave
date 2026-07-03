from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check email
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check phone
    if user_data.phone:
        if db.query(models.User).filter(models.User.phone == user_data.phone).first():
            raise HTTPException(status_code=400, detail="Phone number already registered")

    # Check NIC
    if user_data.nic:
        if db.query(models.User).filter(models.User.nic == user_data.nic).first():
            raise HTTPException(status_code=400, detail="NIC already registered")

    hashed_pw = auth.hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_pw,
        phone=user_data.phone,
        nic=user_data.nic,
        role="customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token({"user_id": user.id, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(auth.get_current_user)):
    return current_user


from app.notifications import (
    send_otp_sms, verify_otp,
    email_registration_success,
    sms_registration_success
)

# Send OTP to phone number
@router.post("/send-otp")
def send_otp(phone: str, db: Session = Depends(get_db)):
    # Check phone not already registered
    existing = db.query(models.User).filter(
        models.User.phone == phone
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )
    success = send_otp_sms(phone)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP. Check phone number."
        )
    return {"message": "OTP sent successfully"}

# Verify OTP
@router.post("/verify-otp")
def verify_otp_endpoint(phone: str, otp: str):
    if not verify_otp(phone, otp):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )
    return {"message": "Phone verified successfully", "verified": True}

# Update register endpoint to send notifications
@router.post("/register", response_model=schemas.UserOut)
async def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check duplicates
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if user_data.phone:
        if db.query(models.User).filter(models.User.phone == user_data.phone).first():
            raise HTTPException(status_code=400, detail="Phone number already registered")
    if user_data.nic:
        if db.query(models.User).filter(models.User.nic == user_data.nic).first():
            raise HTTPException(status_code=400, detail="NIC already registered")

    hashed_pw = auth.hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_pw,
        phone=user_data.phone,
        nic=user_data.nic,
        role="customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send notifications
    await email_registration_success(new_user.email, new_user.name)
    if new_user.phone:
        sms_registration_success(new_user.phone, new_user.name)

    return new_user

from app.notifications import send_password_reset_otp

@router.post("/forgot-password")
def forgot_password(
    data: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    # Check phone exists
    user = db.query(models.User).filter(
        models.User.phone == data.phone
    ).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this phone number"
        )
    success = send_password_reset_otp(data.phone)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP"
        )
    return {"message": "OTP sent to your phone number"}

@router.post("/reset-password")
def reset_password(
    data: schemas.ResetPassword,
    db: Session = Depends(get_db)
):
    # Verify OTP
    if not verify_otp(data.phone, data.otp):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    # Find user
    user = db.query(models.User).filter(
        models.User.phone == data.phone
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update password
    user.password = auth.hash_password(data.new_password)
    db.commit()

    return {"message": "Password reset successfully"}