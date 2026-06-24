from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    nic: Optional[str] = None

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