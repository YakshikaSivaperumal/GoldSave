from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    total_users = db.query(models.User).filter(
        models.User.role == "customer"
    ).count()

    # Count ALL investments not just completed
    total_investments = db.query(models.Investment).count()

    total_gold = db.query(models.Investment).filter(
        models.Investment.payment_status == "completed"
    ).all()
    total_gold_grams = sum(i.gold_grams for i in total_gold)

    total_redemptions = db.query(models.Redemption).filter(
        models.Redemption.status == "pending"
    ).count()

    return {
        "total_customers": total_users,
        "total_investments": total_investments,
        "total_gold_grams": round(total_gold_grams, 4),
        "pending_redemptions": total_redemptions
    }

@router.get("/customers")
def get_customers(
    db: Session = Depends(get_db),
    current_user=Depends(auth.require_admin)
):
    users = db.query(models.User).filter(
        models.User.role == "customer"
    ).all()
    return [{"id": u.id, "name": u.name, "email": u.email, 
             "phone": u.phone, "created_at": str(u.created_at)} 
            for u in users]