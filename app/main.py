from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, gold_rates, investments, redemptions, predictions, admin
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GoldSave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/receipts", exist_ok=True)

app.include_router(auth.router)
app.include_router(gold_rates.router)
app.include_router(investments.router)
app.include_router(redemptions.router)
app.include_router(predictions.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "GoldSave API is running"}