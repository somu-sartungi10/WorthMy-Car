# 🚗 WorthMy-Car — Used Car Resale Price Prediction

**Estimate what a used car is really worth — and see exactly why.**

WorthMy-Car (a.k.a. *CarPredict*) is a full-stack machine-learning application that
predicts the resale price of a used car in India from its details (brand, model, year,
kilometres driven, fuel type, transmission, engine specs and dimensions), then explains
the number with per-feature contributions that add up to the estimate.

Built with **scikit-learn + FastAPI** on the backend and **React + Vite + Tailwind +
shadcn/ui** on the frontend.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikitlearn&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## 🌐 Live Demo

| | Link |
|---|---|
| **Web App (React, Vercel)** | https://worth-my-car.vercel.app/ |
| **REST API (Render)** | https://carpredict-kcjf.onrender.com |
| **API docs (Swagger UI)** | https://carpredict-kcjf.onrender.com/docs |
| **API health check** | https://carpredict-kcjf.onrender.com/health |
| **Legacy Streamlit UI** | https://carpredict-bhadilthudnjznvfsbpbyr.streamlit.app/ |

---

## ✨ Features

**Predict Price**
- 6-section form covering vehicle identity, usage & ownership, configuration,
  location & colour, engine specs and dimensions — all dropdowns populated from the
  real dataset (no free-typing where it matters)
- Fair-price estimate returned in under a second from a 200-tree Random Forest

**Explainability (the interesting part)**
- Every estimate comes with a **"What drives this estimate"** breakdown: a base value
  plus signed, per-feature contributions (green pushes the price up, red pulls it down)
- The contributions are exact — `base value + Σ contributions = predicted price`, so
  the model's arithmetic is fully auditable
- One-hot encoded columns are folded back to human-readable names
  (`cat__Make_Audi` → `Make`, `engine_cc` → "Engine capacity (cc)")

**Deal Analysis**
- Compare an asking price against the model's estimated market price side by side,
  with an instant verdict (Excellent / Good / Fair / Overpriced)

**Reports & data**
- One-click **PDF report** download with the full vehicle summary and the estimate
- Dataset explorer: model metrics, training-set stats and a sample of the raw data,
  served from a generated `meta.json` (works even before the API is up)

**Engineering**
- Input validation via Pydantic, automated preprocessing (median imputation,
  standard scaling, one-hot encoding with `handle_unknown='ignore'`)
- Engine/power/torque parsed out of brochure strings like `"1493 cc"` / `"70 bhp"`
- CORS-enabled API, Swagger UI at `/docs`, Docker Compose for the whole stack

---

## 🏗️ Architecture

```text
React SPA (Vite + TypeScript + shadcn/ui)          deployed on Vercel
        │  fetch POST /predict, /download-report
        ▼
FastAPI backend                                    deployed on Render
        │  pandas DataFrame → sklearn Pipeline
        ▼
ColumnTransformer ──► RandomForestRegressor (200 trees)
        │
        ▼
Predicted price (₹) + explanation {base_value, contributions[]}
```

---

## 📊 Model Performance

Trained on **2,059 listings × 20 columns** (`data/raw/cardata.csv`) with a
stratified 80/20 train–test split.

| Metric | Result |
|---|---:|
| R² Score | **0.9058** |
| Mean Absolute Error | **₹2,47,174** |
| Root Mean Squared Error | **₹656,360** |

The model explains about **90.6%** of the variation in used-car prices on unseen
test data.

| Model details | |
|---|---|
| Algorithm | `RandomForestRegressor` |
| Trees / depth | 200 / unlimited |
| `min_samples_split` / `leaf` | 2 / 1 |
| `max_features` | 1.0 |
| `random_state` | 42 |

---

## 🗂️ Project Structure

```text
CarPredict/
├── frontend/                   # React + Vite + shadcn/ui app (deployed on Vercel)
│   ├── scripts/generate-meta.mjs  # Builds public/meta.json from the dataset + metrics
│   └── src/
│       ├── pages/              # Home, PredictPrice, DealAnalysis
│       ├── components/         # App shell, sections, shadcn/ui components
│       └── lib/                # API client, types, formatting, meta loader
├── src/
│   ├── api.py                  # FastAPI app (/predict, /download-report, /health)
│   ├── explain.py              # Per-prediction feature contributions
│   ├── train.py                # Training + evaluation + model export
│   ├── pipeline.py             # Preprocessing pipeline (impute/scale/one-hot)
│   ├── data_preprocessing.py   # Data loading, cleaning, stratified split
│   └── evaluate.py             # Test-set evaluation
├── data/
│   ├── raw/cardata.csv         # Original dataset (2,059 rows)
│   └── processed/              # Train/test splits
├── models/
│   ├── car_price_model.pkl     # Trained pipeline (loaded by the API)
│   └── metrics.json            # Test metrics (fed into the UI)
├── notebooks/                  # EDA and training experiments
├── app.py, pages/              # Legacy Streamlit UI (kept for reference)
├── pdf_report.py               # PDF report generation (ReportLab)
├── Dockerfile.api, Dockerfile.streamlit, docker-compose.yml
└── requirements.txt
```

---

## 🚀 Run Locally

### Prerequisites

- Python 3.14 (the version pinned in `.python-version`)
- Node.js 20 or newer (Vite 8 requires 20.19+ / 22.12+)

### 1. Clone

```bash
git clone https://github.com/somu-sartungi10/CarPredict.git
cd CarPredict
```

### 2. Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn src.api:app --reload
```

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

### 3. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173 (talks to `http://127.0.0.1:8000` by default;
  override with the `VITE_API_URL` env var)

> `npm run dev` and `npm run build` automatically regenerate
> `frontend/public/meta.json` from `data/raw/cardata.csv` + `models/metrics.json`,
> so the dropdowns and model metrics always match your data.

<details>
<summary>Legacy Streamlit UI</summary>

```bash
streamlit run app.py
```
</details>

<details>
<summary>Docker Compose (API + Streamlit)</summary>

```bash
docker compose up --build
```
</details>


## 📄 License

No license file has been chosen yet — all rights reserved by default. Feel free to
open an issue if you'd like to use or contribute to the project.

## 👤 Author

**Somu Sartungi** — [github.com/somu-sartungi10](https://github.com/somu-sartungi10)
