from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "models" / "car_price_model.pkl"

app = FastAPI(
    title="Car Price Prediction API",
    description="Predicts used-car resale prices using a Random Forest model.",
    version="1.0.0",
)


class CarInput(BaseModel):
    make: str
    model: str
    year: int = Field(ge=1987, le=2026)
    kilometer: float = Field(ge=0, le=1_000_000)
    fuel_type: str
    transmission: str
    location: str
    color: str
    owner: str
    seller_type: str
    engine: str
    max_power: str
    max_torque: str
    drivetrain: str | None = None
    length: float | None = None
    width: float | None = None
    height: float | None = None
    seating_capacity: float | None = None
    fuel_tank_capacity: float | None = None

    def to_model_row(self) -> dict:
        return {
            "Make": self.make,
            "Model": self.model,
            "Year": self.year,
            "Kilometer": self.kilometer,
            "Fuel Type": self.fuel_type,
            "Transmission": self.transmission,
            "Location": self.location,
            "Color": self.color,
            "Owner": self.owner,
            "Seller Type": self.seller_type,
            "Engine": self.engine,
            "Max Power": self.max_power,
            "Max Torque": self.max_torque,
            "Drivetrain": self.drivetrain,
            "Length": self.length,
            "Width": self.width,
            "Height": self.height,
            "Seating Capacity": self.seating_capacity,
            "Fuel Tank Capacity": self.fuel_tank_capacity,
        }


@lru_cache
def get_model():
    return joblib.load(MODEL_PATH)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": MODEL_PATH.exists(),
    }


@app.post("/predict")
def predict_price(car: CarInput):
    car_frame = pd.DataFrame([car.to_model_row()])
    prediction = float(get_model().predict(car_frame)[0])

    return {
        "predicted_price": round(prediction, 2),
        "currency": "INR",
    }