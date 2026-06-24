from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
import os
import shutil
import uuid

router = APIRouter(prefix="/investments", tags=["Investments"])

UPLOAD_DIR = "uploads/receipts"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Customer — create investment with bank transfer details
@router.post("/", response_model=schemas.InvestmentOut)
async def create_investment(
    amount_lkr: float = Form(...),
    bank_reference: str = Form(...),
    receipt: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    # Get latest gold rate
    rate = db.query(models.GoldRate).order_by(
        models.GoldRate.date.desc()
    ).first()
    if not rate:
        raise HTTPException(status_code=400, detail="No gold rate available")

    gold_grams = amount_lkr / rate.rate_per_gram

    # Save receipt file
    ext = receipt.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(receipt.file, f)

    investment = models.Investment(
        user_id=current_user.id,
        amount_lkr=amount_lkr,
        gold_grams=round(gold_grams, 4),
        payment_status="pending",
        bank_reference=bank_reference,
        receipt_path=filepath
    )
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment

# Customer — list their own investments
@router.get("/", response_model=list[schemas.InvestmentOut])
def get_my_investments(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    return db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()

# Admin — list all investments
@router.get("/all", response_model=list[schemas.InvestmentOut])
def get_all_investments(
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    return db.query(models.Investment).all()

# Admin — approve investment (gold gets added)
@router.patch("/{investment_id}/approve", response_model=schemas.InvestmentOut)
def approve_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id
    ).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    if investment.payment_status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")
    investment.payment_status = "completed"
    db.commit()
    db.refresh(investment)
    return investment

# Admin — reject investment
@router.patch("/{investment_id}/reject", response_model=schemas.InvestmentOut)
def reject_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id
    ).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    if investment.payment_status != "pending":
        raise HTTPException(status_code=400, detail="Already processed")
    investment.payment_status = "failed"
    db.commit()
    db.refresh(investment)
    return investment

# Serve receipt image
@router.get("/receipt/{investment_id}")
def get_receipt(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id
    ).first()
    if not investment or not investment.receipt_path:
        raise HTTPException(status_code=404, detail="Receipt not found")
    from fastapi.responses import FileResponse
    return FileResponse(investment.receipt_path)