from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import shap
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and feature columns
model = joblib.load("model.pkl")
feature_columns = joblib.load("feature_columns.pkl")

# Build SHAP explainer once at startup
explainer = shap.TreeExplainer(model)

@app.route("/")
def home():
    return "Dengue Risk Prediction API Running"

def build_input_df(data):
    """Build and align the input dataframe from request JSON."""
    input_df = pd.DataFrame([data])
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0
    return input_df[feature_columns]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        input_df = build_input_df(data)

        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]

        return jsonify({
            "prediction": int(prediction),
            "risk_probability": float(probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/explain", methods=["POST"])
def explain():
    try:
        data = request.json
        input_df = build_input_df(data)

        # Compute SHAP values for this single row
        shap_values = explainer.shap_values(input_df)

        # shap_values can be a list (older API) or 3D ndarray (newer API)
        if isinstance(shap_values, list):
            # older: list[class] → each element is (samples, features)
            row_shap = shap_values[1][0]
        else:
            # newer: (samples, features, classes)
            row_shap = shap_values[0, :, 1]

        feature_names = list(feature_columns)

        # Build list of {feature, value} sorted by absolute importance
        importances = [
            {"feature": name, "value": float(val)}
            for name, val in zip(feature_names, row_shap)
        ]
        importances.sort(key=lambda x: abs(x["value"]), reverse=True)

        # Return top 10 most impactful features
        return jsonify({"importances": importances[:10]})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
