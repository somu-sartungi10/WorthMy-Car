from pathlib import Path
import json

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline

from .load_data import load_and_clean_data, stratified_split
from .pipeline import build_pipeline


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "data" / "raw" / "cardata.csv"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "models"


def main():
    # 1. Load and split data
    df = load_and_clean_data(DATA_PATH)
    train_set, test_set = stratified_split(df)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    train_set.to_csv(PROCESSED_DIR / "train.csv", index=False)
    test_set.to_csv(PROCESSED_DIR / "test.csv", index=False)

    x_train = train_set.drop(columns="Price")
    y_train = train_set["Price"]
    x_test = test_set.drop(columns="Price")
    y_test = test_set["Price"]

    # 2. Combine preprocessing and model to prevent data leakage
    model_pipeline = Pipeline([
        ("preprocessing", build_pipeline()),
        ("model", RandomForestRegressor(
            n_estimators=400,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )),
    ])

    # 3. Cross-validation on raw training data
    cv_scores = cross_val_score(
        model_pipeline,
        x_train,
        y_train,
        scoring="neg_root_mean_squared_error",
        cv=5,
        n_jobs=-1,
    )
    print(f"Cross-validation RMSE: {-cv_scores.mean():,.0f} ± {cv_scores.std():,.0f}")

    # 4. Train, evaluate on held-out test data, and save
    model_pipeline.fit(x_train, y_train)
    predictions = model_pipeline.predict(x_test)

    metrics = {
        "mae": round(mean_absolute_error(y_test, predictions), 2),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 2),
        "r2": round(r2_score(y_test, predictions), 4),
    }

    print("\nTest metrics")
    for name, value in metrics.items():
        print(f"{name.upper()}: {value:,.2f}")

    MODELS_DIR.mkdir(exist_ok=True)
    joblib.dump(model_pipeline, MODELS_DIR / "car_price_model.pkl")

    with open(MODELS_DIR / "metrics.json", "w") as file:
        json.dump(metrics, file, indent=2)

    print("\nSaved model to models/car_price_model.pkl")


if __name__ == "__main__":
    main()