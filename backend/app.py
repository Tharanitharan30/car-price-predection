"""
Car Price Prediction - Flask Backend API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ─── Load Artifacts ───────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)

model    = joblib.load(os.path.join(BASE, "model.pkl"))
encoders = joblib.load(os.path.join(BASE, "encoders.pkl"))
features = joblib.load(os.path.join(BASE, "feature_names.pkl"))

with open(os.path.join(BASE, "model_meta.json")) as f:
    meta = json.load(f)

print("✅ Model and artifacts loaded.")


# ─── Helper ───────────────────────────────────────────────────────────────────
def encode_field(col, value):
    le = encoders[col]
    if value not in le.classes_:
        # Default to most common class
        value = le.classes_[0]
    return int(le.transform([value])[0])


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/meta", methods=["GET"])
def get_meta():
    """Return dropdown options and model metrics."""
    return jsonify({
        "brands":       sorted(meta["brands"]),
        "fuel_types":   meta["fuel_types"],
        "seller_types": meta["seller_types"],
        "transmissions": meta["transmission_types"],
        "owner_types":  meta["owner_types"],
        "metrics":      meta["metrics"],
        "price_stats":  meta["price_stats"],
        "feature_importance": meta["feature_importance"],
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Expected JSON body:
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
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required = ["brand", "year", "km_driven", "fuel", "seller_type",
                "transmission", "owner", "mileage", "engine", "max_power", "seats"]
    missing = [r for r in required if r not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        car_age = 2024 - int(data["year"])

        row = {
            "km_driven":          float(data["km_driven"]),
            "fuel":               encode_field("fuel", data["fuel"]),
            "seller_type":        encode_field("seller_type", data["seller_type"]),
            "transmission":       encode_field("transmission", data["transmission"]),
            "owner":              encode_field("owner", data["owner"]),
            "mileage(km/ltr/kg)": float(data["mileage"]),
            "engine":             float(data["engine"]),
            "max_power":          float(data["max_power"]),
            "seats":              float(data["seats"]),
            "car_age":            car_age,
            "brand":              encode_field("brand", data["brand"]),
        }

        X = np.array([[row[f] for f in features]])
        price = model.predict(X)[0]

        # Confidence range: ±MAE
        mae = meta["metrics"]["RandomForest"]["MAE"]
        low  = max(0, price - mae)
        high = price + mae

        return jsonify({
            "predicted_price": round(float(price)),
            "price_low":       round(float(low)),
            "price_high":      round(float(high)),
            "formatted_price": f"₹{price:,.0f}",
            "car_age":         car_age,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": meta["best_model"]})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
