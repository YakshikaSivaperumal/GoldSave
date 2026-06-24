from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import date, timedelta

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/forecast")
def get_forecast(
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    # Get last 30 days of gold rates from DB
    rates = db.query(models.GoldRate).order_by(
        models.GoldRate.date.asc()
    ).all()

    if len(rates) < 7:
        return {"error": "Not enough data for prediction"}

    # Prepare data for linear regression
    df = pd.DataFrame([{
        "date": r.date,
        "rate": r.rate_per_gram
    } for r in rates])

    # Convert dates to numbers (day index)
    df["day_index"] = range(len(df))

    X = df[["day_index"]].values
    y = df["rate"].values

    # Train linear regression model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next 7 days
    last_index = len(df)
    last_date = df["date"].iloc[-1]

    forecast = []
    for i in range(1, 8):
        predicted_price = model.predict([[last_index + i]])[0]
        predicted_date = last_date + timedelta(days=i)

        # Save to predictions table
        existing = db.query(models.Prediction).filter(
            models.Prediction.prediction_date == predicted_date
        ).first()

        if existing:
            existing.predicted_price = round(predicted_price, 2)
            db.commit()
        else:
            new_pred = models.Prediction(
                predicted_price=round(predicted_price, 2),
                prediction_date=predicted_date
            )
            db.add(new_pred)
            db.commit()

        forecast.append({
            "date": str(predicted_date),
            "predicted_price": round(predicted_price, 2)
        })

    # Also return historical data for the chart
    historical = [{"date": str(r.date), "rate": r.rate_per_gram} for r in rates]

    return {
        "historical": historical,
        "forecast": forecast
    }