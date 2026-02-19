from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load model and feature columns
model = joblib.load("model.pkl")
feature_columns = joblib.load("feature_columns.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    
    # Convert input to DataFrame
    input_df = pd.DataFrame([data])
    
    # Ensure all required columns exist
    for col in feature_columns:
        if col not in input_df:
            input_df[col] = 0

    input_df = input_df[feature_columns]

    prediction = model.predict(input_df)[0]

    return jsonify({
        "prediction": int(prediction)
    })

if __name__ == "__main__":
    app.run(debug=True)
