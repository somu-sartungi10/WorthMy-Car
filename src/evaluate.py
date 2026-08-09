from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEST_DATA_PATH = PROJECT_ROOT / "data" / "processed" / "test.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "car_price_model.pkl"


def main():
    test_set = pd.read_csv(TEST_DATA_PATH)

    x_test = test_set.drop(columns="Price")
    y_test = test_set["Price"]

    model = joblib.load(MODEL_PATH)
    predictions = model.predict(x_test)

    print("Final test metrics")
    print(f"MAE:  {mean_absolute_error(y_test, predictions):,.2f}")
    print(f"RMSE: {mean_squared_error(y_test, predictions) ** 0.5:,.2f}")
    print(f"R²:   {r2_score(y_test, predictions):.4f}")


if __name__ == "__main__":
    main()