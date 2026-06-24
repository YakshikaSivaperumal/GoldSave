from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/gold-rates", tags=["Gold Rates"])

# Admin only — set a new gold rate
@router.post("/", response_model=schemas.GoldRateOut)
def create_rate(
    rate_data: schemas.GoldRateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    new_rate = models.GoldRate(
        rate_per_gram=rate_data.rate_per_gram,
        date=rate_data.date
    )
    db.add(new_rate)
    db.commit()
    db.refresh(new_rate)
    return new_rate

# Anyone logged in — get the latest rate
@router.get("/latest", response_model=schemas.GoldRateOut)
def get_latest_rate(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    rate = db.query(models.GoldRate).order_by(
        models.GoldRate.date.desc()
    ).first()
    if not rate:
        raise HTTPException(status_code=404, detail="No gold rate found")
    return rate

# Anyone logged in — get all historical rates
@router.get("/", response_model=list[schemas.GoldRateOut])
def get_all_rates(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    return db.query(models.GoldRate).order_by(
        models.GoldRate.date.desc()
    ).all()