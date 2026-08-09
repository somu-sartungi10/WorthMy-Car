# 🚗 CarPredict

An end-to-end used-car resale price prediction application built with machine learning, FastAPI, and Streamlit.

## Live Demo

- **Web App:** https://carpredict-bhadilthudnjznvfsbpbyr.streamlit.app/
- **API Documentation:** https://carpredict-kcjf.onrender.com/docs
- **API Health Check:** https://carpredict-kcjf.onrender.com/health

## Project Overview

CarPredict estimates a used car’s resale price from details such as brand, model, manufacturing year, kilometres driven, fuel type, transmission, engine specifications, and vehicle dimensions.

The project includes:

- A scikit-learn machine-learning pipeline
- A Random Forest regression model
- A FastAPI backend for serving predictions
- A Streamlit frontend for user input
- Cloud deployment using Render and Streamlit Community Cloud

## Model Performance

| Metric | Result |
|---|---:|
| R² Score | 0.8859 |
| Mean Absolute Error | ₹259,069 |
| Root Mean Squared Error | ₹722,302 |
| 5-Fold Cross-Validation RMSE | ₹1,023,925 ± ₹217,440 |

The model explains approximately **88.6%** of the variation in used-car prices on the unseen test data.

## Architecture

```text
Streamlit Frontend
        ↓
FastAPI Backend
        ↓
Scikit-learn Pipeline + Random Forest Model
        ↓
Predicted Used-Car Price
```

## Features

- Selectable car make, model, fuel type, transmission, location, and ownership details
- Input validation through FastAPI and Pydantic
- Automated preprocessing for missing values and categorical data
- Engine, power, and torque extraction from text values
- Public REST API documentation through Swagger UI
- Deployed prediction API and web interface

## Tech Stack

- Python
- Pandas and NumPy
- Scikit-learn
- FastAPI
- Uvicorn
- Streamlit
- Joblib
- Render
- Streamlit Community Cloud

## Project Structure

```text
CarPredict/
├── app.py                  # Streamlit frontend
├── data/
│   ├── raw/                # Original dataset
│   └── processed/          # Train and test datasets
├── models/
│   └── car_price_model.pkl # Saved ML pipeline and model
├── notebooks/
│   ├── eda.ipynb
│   └── model_traininig.ipynb
├── src/
│   ├── api.py              # FastAPI prediction API
│   ├── train.py            # Model training script
│   ├── evaluate.py         # Test-set evaluation
│   ├── pipeline.py         # Preprocessing pipeline
│   └── load_data.py        # Data loading and splitting
├── requirements.txt
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/somu-sartungi10/CarPredict.git
cd CarPredict
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the FastAPI backend

```bash
uvicorn src.api:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Start the Streamlit frontend

Open a second terminal and run:

```bash
streamlit run app.py
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Confirms the API and model are available |
| POST | `/predict` | Returns a predicted resale price |
| GET | `/docs` | Interactive Swagger API documentation |

## Retrain the Model

```bash
python -m src.train
```

## Future Improvements

- Compare Random Forest with CatBoost, XGBoost, and Gradient Boosting
- Add SHAP-based model explainability
- Add automated tests for API endpoints and preprocessing
- Add model monitoring and prediction logging
- Improve the UI with price ranges and feature explanations

## Author

Somu Sartungi