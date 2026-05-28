# 🚗 AutoVal — Car Price Prediction ML Project

A full-stack machine learning project that predicts used car resale prices using the CarDekho dataset.

---

## 📁 Project Structure

```
car_price_project/
├── model/
│   └── train.py              # ML training script
├── backend/
│   ├── app.py                # Flask REST API
│   ├── requirements.txt      # Python dependencies
│   ├── model.pkl             # Trained Random Forest model
│   ├── encoders.pkl          # Label encoders for categoricals
│   ├── feature_names.pkl     # Feature column names
│   └── model_meta.json       # Model metadata & metrics
└── frontend/
    └── index.html            # Single-page web app (no build needed)
```

---

## 🧠 ML Pipeline

### Dataset
- **Source**: CarDekho (8,128 records)
- **Features**: name, year, km_driven, fuel, seller_type, transmission, owner, mileage, engine, max_power, seats
- **Target**: selling_price (₹)

### Feature Engineering
| Step | Detail |
|------|--------|
| Car Age | `2024 - year` |
| Brand Extraction | First word of car name |
| Null Handling | Median imputation for numeric cols |
| Label Encoding | Categorical → numeric (LabelEncoder) |

### Models Trained
| Model | MAE | RMSE | R² |
|-------|-----|------|----|
| HistGradientBoosting | ₹72,587 | ₹1,19,776 | 0.9794 |
| **Random Forest** ✅ | **₹60,515** | **₹1,05,084** | **0.9841** |

**Winner: Random Forest (R² = 98.41%)**

---

## 🚀 Setup & Run

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Train the Model
```bash
python model/train.py
```
This generates `model.pkl`, `encoders.pkl`, `feature_names.pkl`, `model_meta.json` in `backend/`.

### 3. Start the Flask API
```bash
python backend/app.py
```
API runs at `http://localhost:5000`

### 4. Open the Frontend
Simply open `frontend/index.html` in your browser.

> **Note**: The frontend has a demo fallback if the API is offline.

---

## 🌐 API Reference

### `GET /api/health`
```json
{ "status": "ok", "model": "RandomForest" }
```

### `GET /api/meta`
Returns dropdown options, model metrics, and feature importance.

### `POST /api/predict`
**Request Body:**
```json
{
  "brand": "Maruti",
  "year": 2018,
  "km_driven": 45000,
  "fuel": "Petrol",
  "seller_type": "Individual",
  "transmission": "Manual",
  "owner": "First Owner",
  "mileage": 18.5,
  "engine": 1197,
  "max_power": 82,
  "seats": 5
}
```

**Response:**
```json
{
  "predicted_price": 487000,
  "price_low": 426485,
  "price_high": 547515,
  "formatted_price": "₹4,87,000",
  "car_age": 6
}
```

---

## 📊 Feature Importance (Top Features)
1. **Max Power** — 43% importance
2. **Engine CC** — 18%
3. **Car Age** — 14%
4. **KM Driven** — 8%
5. **Brand** — 7%

---

## 🔧 Tech Stack
- **ML**: scikit-learn, pandas, numpy
- **API**: Flask, Flask-CORS
- **Frontend**: Vanilla HTML/CSS/JS (no framework needed)
- **Serialization**: joblib
