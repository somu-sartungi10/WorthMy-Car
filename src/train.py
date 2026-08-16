from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline

from .data_preprocessing import (
    load_and_clean_data,
    stratified_split,
)
from .pipeline import build_pipeline




PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_ROOT / "data" / "raw" / "cardata.csv"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "models"


def main():

    df = load_and_clean_data(DATA_PATH)

    train_set, test_set = stratified_split(df)

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train_set.to_csv(
        PROCESSED_DIR / "train.csv",
        index=False,
    )

    test_set.to_csv(
        PROCESSED_DIR / "test.csv",
        index=False,
    )

    x_train = train_set.drop(
        columns="Price"
    )

    y_train = train_set["Price"]

    x_test = test_set.drop(
        columns="Price"
    )

    y_test = test_set["Price"]


    # =====================================================
    # 2. Build final tuned model
    # =====================================================

    model_pipeline = Pipeline([
        (
            "preprocessing",
            build_pipeline(),
        ),

        (
            "model",
            RandomForestRegressor(
                # Tuned parameters
                n_estimators=200,
                min_samples_split=2,
                min_samples_leaf=1,
                max_features=1.0,
                max_depth=None,

                # Reproducibility + performance
                random_state=42,
                n_jobs=-1,
            ),
        ),
    ])


   


    # =====================================================
    # 4. Train final model
    # =====================================================

    print("\nTraining final model...")

    model_pipeline.fit(
        x_train,
        y_train,
    )


    # =====================================================
    # 5. Feature importance
    # =====================================================

    preprocessor = (
        model_pipeline
        .named_steps["preprocessing"]
    )

    forest = (
        model_pipeline
        .named_steps["model"]
    )

    feature_names = (
        preprocessor
        .named_steps["preprocess"]
        .get_feature_names_out()
    )

    importances = forest.feature_importances_

    feature_importance = pd.DataFrame({
        "feature": feature_names,
        "importance": importances,
    }).sort_values(
        "importance",
        ascending=False,
    )

    print("\nTop 20 encoded features")
    print("=" * 50)

    print(
        feature_importance.head(20).to_string(
            index=False
        )
    )


    # =====================================================
    # 6. Evaluate on unseen test data
    # =====================================================

    predictions = model_pipeline.predict(
        x_test
    )

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions,
        )
    )

    r2 = r2_score(
        y_test,
        predictions,
    )


    print("\nFinal Test Metrics")
    print("=" * 50)

    print(f"MAE:  ₹{mae:,.2f}")
    print(f"RMSE: ₹{rmse:,.2f}")
    print(f"R²:   {r2:.4f}")


    # =====================================================
    # 7. Save model
    # =====================================================

    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_path = (
        MODELS_DIR /
        "car_price_model.pkl"
    )

    joblib.dump(
        model_pipeline,
        model_path,
    )


    # =====================================================
    # 8. Save metrics + model information
    # =====================================================

    metrics = {
        "test_metrics": {
            "MAE": round(float(mae), 2),
            "RMSE": round(float(rmse), 2),
            "R2": round(float(r2), 4),
        },

        "model": {
            "algorithm": "RandomForestRegressor",

            "hyperparameters": {
                "n_estimators": 200,
                "min_samples_split": 2,
                "min_samples_leaf": 1,
                "max_features": 1.0,
                "max_depth": None,
                "random_state": 42,
            },
        },
    }

    with open(
        MODELS_DIR / "metrics.json",
        "w",
    ) as file:

        json.dump(
            metrics,
            file,
            indent=4,
        )


    # =====================================================
    # 9. Finished
    # =====================================================

    print("\nModel training completed successfully.")
    print(
        f"Saved model: {model_path}"
    )


if __name__ == "__main__":
    main()