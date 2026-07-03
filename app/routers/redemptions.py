from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/redemptions", tags=["Redemptions"])

# Customer — request a redemption
@router.post("/", response_model=schemas.RedemptionOut)
def create_redemption(
    data: schemas.RedemptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    # Check how much gold the customer actually owns
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id,
        models.Investment.payment_status == "completed"
    ).all()
    total_gold = sum(i.gold_grams for i in investments)

    # Check existing pending redemptions
    pending = db.query(models.Redemption).filter(
        models.Redemption.user_id == current_user.id,
        models.Redemption.status == "pending"
    ).all()
    pending_grams = sum(r.grams_requested for r in pending)

    available = total_gold - pending_grams

    if data.grams_requested > available:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough gold. Available: {available:.4f}g"
        )

    # Get current rate to calculate LKR value
    rate = db.query(models.GoldRate).order_by(
        models.GoldRate.date.desc()
    ).first()
    amount_value = data.grams_requested * rate.rate_per_gram if rate else 0

    redemption = models.Redemption(
        user_id=current_user.id,
        grams_requested=data.grams_requested,
        amount_value=round(amount_value, 2),
        status="pending"
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)
    return redemption

# Customer — view their redemptions
@router.get("/", response_model=list[schemas.RedemptionOut])
def get_my_redemptions(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    return db.query(models.Redemption).filter(
        models.Redemption.user_id == current_user.id
    ).all()

# Admin — view all redemptions
@router.get("/all", response_model=list[schemas.RedemptionOut])
def get_all_redemptions(
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    return db.query(models.Redemption).all()

from app.notifications import (
    sms_redemption_approved,
    sms_redemption_rejected
)

@router.patch("/{redemption_id}/approve", response_model=schemas.RedemptionOut)
async def approve_redemption(
    redemption_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    redemption = db.query(models.Redemption).filter(
        models.Redemption.id == redemption_id
    ).first()
    if not redemption:
        raise HTTPException(status_code=404, detail="Redemption not found")
    if redemption.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    redemption.status = "approved"
    db.commit()
    db.refresh(redemption)

    user = db.query(models.User).filter(
        models.User.id == redemption.user_id
    ).first()
    if user and user.phone:
        sms_redemption_approved(
            user.phone, user.name,
            redemption.grams_requested, redemption.amount_value
        )
    return redemption

@router.patch("/{redemption_id}/reject", response_model=schemas.RedemptionOut)
async def reject_redemption(
    redemption_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    redemption = db.query(models.Redemption).filter(
        models.Redemption.id == redemption_id
    ).first()
    if not redemption:
        raise HTTPException(status_code=404, detail="Redemption not found")
    if redemption.status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    redemption.status = "rejected"
    db.commit()
    db.refresh(redemption)

    user = db.query(models.User).filter(
        models.User.id == redemption.user_id
    ).first()
    if user and user.phone:
        sms_redemption_rejected(
            user.phone, user.name,
            redemption.grams_requested
        )
    return redemption