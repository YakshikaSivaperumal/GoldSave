from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    nic = Column(String(20))
    role = Column(Enum("customer", "admin"), default="customer")
    created_at = Column(DateTime, default=datetime.utcnow)

class GoldRate(Base):
    __tablename__ = "gold_rates"
    id = Column(Integer, primary_key=True, index=True)
    rate_per_gram = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

class Investment(Base):
    __tablename__ = "investments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount_lkr = Column(Float, nullable=False)
    gold_grams = Column(Float, nullable=False)
    payment_status = Column(Enum("pending", "completed", "failed"), default="pending")
    transaction_id = Column(String(100))
    receipt_path = Column(String(255))        # ← add this
    bank_reference = Column(String(100))      # ← add this
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

class Redemption(Base):
    __tablename__ = "redemptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    grams_requested = Column(Float, nullable=False)
    amount_value = Column(Float, nullable=False)
    status = Column(Enum("pending", "approved", "rejected"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    predicted_price = Column(Float, nullable=False)
    prediction_date = Column(Date, nullable=False)