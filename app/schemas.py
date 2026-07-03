from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    nic: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name must contain only letters')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        cleaned = v.replace(' ', '')
        patterns = [
            r'^07[0-9]{8}$',
            r'^\+947[0-9]{8}$',
            r'^00947[0-9]{8}$'
        ]
        if not any(re.match(p, cleaned) for p in patterns):
            raise ValueError('Enter a valid Sri Lanka phone number (e.g. 0771234567)')
        return v

    @field_validator('nic')
    @classmethod
    def validate_nic(cls, v):
        if v is None:
            return v
        if not (re.match(r'^[0-9]{9}[VXvx]$', v) or re.match(r'^[0-9]{12}$', v)):
            raise ValueError('Enter valid NIC (e.g. 123456789V or 200012345678)')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


# ── Gold Rate ──────────────────────────────────────
from datetime import date

class GoldRateCreate(BaseModel):
    rate_per_gram: float
    date: date

class GoldRateOut(BaseModel):
    id: int
    rate_per_gram: float
    date: date

    class Config:
        from_attributes = True

# ── Investment ─────────────────────────────────────
class InvestmentCreate(BaseModel):
    amount_lkr: float

class InvestmentOut(BaseModel):
    id: int
    user_id: int
    amount_lkr: float
    gold_grams: float
    payment_status: str
    transaction_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ── Redemption ─────────────────────────────────────
class RedemptionCreate(BaseModel):
    grams_requested: float

class RedemptionOut(BaseModel):
    id: int
    user_id: int
    grams_requested: float
    amount_value: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── PayHere Webhook ────────────────────────────────
class PayHereWebhook(BaseModel):
    merchant_id: str
    order_id: str
    payment_id: str
    payhere_amount: str
    payhere_currency: str
    status_code: str
    md5sig: str

class InvestmentCreate(BaseModel):
    amount_lkr: float

class InvestmentOut(BaseModel):
    id: int
    user_id: int
    amount_lkr: float
    gold_grams: float
    payment_status: str
    transaction_id: Optional[str]
    receipt_path: Optional[str]
    bank_reference: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    phone: str

class VerifyResetOTP(BaseModel):
    phone: str
    otp: str

class ResetPassword(BaseModel):
    phone: str
    otp: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v