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
│   ├── vercel.json             # Rewrites client-side routes to index.html
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

---

## 🌍 Deployment

### Deploy the React app on Vercel

A production build points at the deployed Render API by default
(`DEPLOYED_API_URL` in `frontend/src/lib/api.ts`), so importing the repo is enough:

1. Push this repository to GitHub (`frontend/`, `data/raw/cardata.csv` and
   `models/metrics.json` must be committed — the build script reads the CSV).
2. On [vercel.com/new](https://vercel.com/new), **import the repository**.
3. Set **Root Directory** to `frontend` (Settings → General). Vercel auto-detects
   Vite; the build command `npm run build` and output directory `dist` are picked
   up automatically.
4. Deploy. The committed `frontend/vercel.json` rewrites client-side routes to
   `index.html`, so `/predict` and `/deal` also work on refresh.
5. Paste your URL into the **Live Demo** table at the top of this file.

**Pointing at a different backend** — add this in Settings → Environment Variables:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://your-api-host.example.com` |

Vite inlines the variable **at build time**, so you must **redeploy** after changing
it — editing the variable alone does not update existing deployments. An empty value
is treated as “not set” and the deployed default is used.

### Deploy the API on Render

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn src.api:app --host 0.0.0.0 --port $PORT`
- Or deploy the included `Dockerfile.api`, which already honours `$PORT`
- CORS defaults to `*`; restrict it with the `CORS_ORIGINS` env var
  (comma-separated origins), e.g. your Vercel URL

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot reach the FastAPI backend at http://127.0.0.1:8000` | The deployed bundle was built without an API URL and fell back to local uvicorn. | Redeploy the frontend — current builds default to the Render API. If you set `VITE_API_URL`, redeploy after changing it (build-time variable). |
| `404` when refreshing `/predict` or `/deal` | Missing SPA fallback. | `frontend/vercel.json` provides it; make sure it is committed and Vercel's Root Directory is `frontend`. |
| CORS error in the browser console | `CORS_ORIGINS` on Render excludes the frontend origin. | Unset it (defaults to `*`) or set it to your Vercel URL. |
| First prediction takes 30–60 s, or times out | Free hosting tiers sleep after inactivity. | Retry once to wake the service; the frontend waits up to 90 s. |
| `Prediction failed (422)` | A field failed Pydantic validation (e.g. year outside 1987–2026). | Check the flagged inputs. |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API + model availability check |
| `POST` | `/predict` | Predicted price in INR **with explanation** |
| `POST` | `/download-report` | PDF report of the estimate (A4, ReportLab) |
| `GET` | `/docs` | Interactive Swagger documentation |

**`POST /predict` — example**

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda", "model": "City", "year": 2019, "kilometer": 50000,
    "fuel_type": "Petrol", "transmission": "Manual", "location": "Mumbai",
    "color": "Black", "owner": "First Owner", "seller_type": "Dealer",
    "engine": "1493 cc", "max_power": "70 bhp", "max_torque": "195 Nm",
    "drivetrain": "FWD", "length": 3995, "width": 1745, "height": 1880,
    "seating_capacity": 5, "fuel_tank_capacity": 45
  }'
```

```json
{
  "predicted_price": 823019.86,
  "currency": "INR",
  "explanation": {
    "base_value": 1722833.02,
    "contributions": [
      { "feature": "Max power (bhp)",      "contribution": -1137194.07 },
      { "feature": "Year",                 "contribution": 164706.81 },
      { "feature": "Width",                "contribution": 52006.04 },
      { "feature": "Engine capacity (cc)", "contribution": 49843.31 }
    ]
  }
}
```

`base_value + sum(contributions) == predicted_price` — verified to within the
2-decimal rounding of the returned figures.

---

## 🔁 Retrain the Model

```bash
python -m src.train
```

This re-splits the data, trains a fresh Random Forest, prints test metrics and
overwrites `models/car_price_model.pkl` + `models/metrics.json`. Re-run
`npm run build` in `frontend/` afterwards so the UI picks up new metrics.

---

## 🗺️ Roadmap

- [x] Per-prediction feature contributions (explainability)
- [x] React + shadcn/ui frontend
- [x] Vercel + Render deployment
- [ ] Confidence intervals around each estimate (MAE-based fair-price band)
- [ ] Nearest comparable listings from the dataset ("similar cars" evidence)
- [ ] Model bake-off: XGBoost / CatBoost vs Random Forest
- [ ] Automated tests (`pytest` for the API, Vitest for the UI)
- [ ] Bulk CSV pricing for dealers

---

## 📄 License

No license file has been chosen yet — all rights reserved by default. Feel free to
open an issue if you'd like to use or contribute to the project.

## 👤 Author

**Somu Sartungi** — [github.com/somu-sartungi10](https://github.com/somu-sartungi10)
