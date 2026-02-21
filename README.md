# 🦟 DengueGuard — Outbreak Risk Prediction System

> An AI-powered dengue outbreak risk prediction platform for Sri Lanka, combining a Random Forest ML model with an interactive web interface and explainable AI (SHAP) insights.

---

## 📌 Overview

**DengueGuard** predicts the likelihood of a dengue outbreak in a given Sri Lankan district and month using historical case data (2019–2021). The system uses lag features (case counts from the previous 1–2 months) to drive predictions and provides SHAP-based explanations for every result.

**Key Features:**

- 🤖 Random Forest classifier trained on Sri Lanka Epidemiology Unit data (2019–2021)
- 📊 SHAP-powered explainability — understand _why_ the model predicted a given risk level
- 🎯 Risk gauge and probability bar for intuitive results
- ⚡ REST API backend with Flask
- 💻 Modern dark-themed Next.js frontend

---

## 🏗️ Project Structure

```
dengue-project/
├── backend/                    # Python ML backend (Flask API)
│   ├── app.py                  # Flask REST API (predict + explain endpoints)
│   ├── train_model.py          # Model training script
│   ├── explain_model.py        # Standalone SHAP summary plot generator
│   ├── model.pkl               # Trained Random Forest model (generated)
│   ├── feature_columns.pkl     # Saved feature column names (generated)
│   ├── dengue_2019.csv         # Historical dengue data — 2019
│   ├── dengue_2020.csv         # Historical dengue data — 2020
│   └── dengue_2021.csv         # Historical dengue data — 2021
│
└── frontend/                   # Next.js 16 web application
    ├── app/
    │   ├── layout.tsx          # Root layout
    │   └── page.tsx            # Main prediction UI
    ├── components/
    │   ├── ShapChart.tsx       # SHAP feature importance bar chart
    │   ├── RiskGauge.tsx       # Circular risk probability gauge
    │   └── ui/                 # shadcn/ui components
    ├── lib/
    │   └── api.ts              # API client (predictRisk, explainRisk)
    └── .env.local              # Environment variables
```

---

## ⚙️ Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| ML Model       | Python, scikit-learn (Random Forest) |
| Explainability | SHAP (TreeExplainer)                 |
| Backend        | Flask, Flask-CORS, joblib, pandas    |
| Frontend       | Next.js 16, React 19, TypeScript     |
| UI             | Tailwind CSS v4, shadcn/ui, Radix UI |
| Charts         | Custom SVG components                |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- pip & npm

---

### 🐍 Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install flask flask-cors scikit-learn pandas shap joblib numpy

# (Optional) Re-train the model from source data
python3 train_model.py

# Start the Flask API server
python3 app.py
```

The backend will be running at **http://localhost:5000**

---

### 💻 Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create the environment file (already included)
# Ensure .env.local contains:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

The frontend will be running at **http://localhost:3000**

---

## 🔌 API Endpoints

### `GET /`

Health check.

**Response:** `"Dengue Risk Prediction API Running"`

---

### `POST /predict`

Predict dengue outbreak risk for a given district and month.

**Request Body (JSON):**

```json
{
  "Lag_1": 120,
  "Lag_2": 95,
  "District_Colombo": 1,
  "Month_June": 1
}
```

**Response:**

```json
{
  "prediction": 1,
  "risk_probability": 0.87
}
```

| Field              | Description                                     |
| ------------------ | ----------------------------------------------- |
| `prediction`       | `1` = High Risk, `0` = Low Risk                 |
| `risk_probability` | Probability of a high-risk outbreak (0.0 – 1.0) |

---

### `POST /explain`

Get SHAP feature importances for a prediction (top 10 features).

**Request Body:** Same as `/predict`

**Response:**

```json
{
  "importances": [
    { "feature": "Lag_1", "value": 0.42 },
    { "feature": "District_Colombo", "value": 0.18 },
    ...
  ]
}
```

---

## 🤖 Model Details

The model is trained using the following pipeline:

1. **Load & Merge** — combines dengue_2019.csv, dengue_2020.csv, dengue_2021.csv
2. **Reshape** — converts wide-format monthly data to long format (melt)
3. **Lag Features** — creates `Lag_1` and `Lag_2` (cases from 1 and 2 months prior)
4. **Target Variable** — `High_Risk = 1` if cases exceed the 75th percentile
5. **Encoding** — one-hot encodes `District` and `Month`
6. **Train/Test Split** — 80/20 split with `random_state=42`
7. **Random Forest** — 200 estimators, max depth 10
8. **Evaluation** — classification report, confusion matrix, ROC-AUC score
9. **Export** — saves `model.pkl` and `feature_columns.pkl` via joblib

---

## 🗺️ Supported Districts

The model supports all 26 Sri Lankan districts:

Ampara, Anuradhapura, Badulla, Batticaloa, Colombo, Galle, Gampaha, Hambantota, Jaffna, Kalmunai, Kalutara, Kandy, Kegalle, Kilinochchi, Kurunegala, Mannar, Matale, Matara, Moneragala, Mulativu, Nuwara Eliya, Polonnaruwa, Puttalam, Ratnapura, Trincomalee, Vavuniya

---

## 📊 Using the Frontend

1. Open **http://localhost:3000**
2. Select a **District** from the dropdown
3. Select the **Prediction Month**
4. Enter the **case count from last month** (Lag 1)
5. Enter the **case count from 2 months ago** (Lag 2)
6. Click **Predict Outbreak Risk**

Results display:

- ✅ **Risk badge** — High Risk or Low Risk
- 📈 **Risk gauge** — visual probability indicator
- 📊 **SHAP chart** — top 10 features driving the prediction
- 💡 **Interpretation** — plain-language explanation with recommended actions

---

## 📁 Data Sources

Historical dengue case data sourced from the **Sri Lanka Epidemiology Unit** for the years 2019, 2020, and 2021. Data is provided per district per month.

---

## 📄 License

This project is for academic and research purposes.
