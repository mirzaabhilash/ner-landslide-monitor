from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# =====================================================
# LOAD TRAINED ML MODEL
# =====================================================

MODEL_PATH = "landslide_model.joblib"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        "landslide_model.joblib not found. "
        "Please train the model first."
    )

model = joblib.load(MODEL_PATH)

print("========================================")
print("Landslide ML model loaded successfully!")
print("========================================")


# =====================================================
# HEALTH CHECK
# =====================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "Northeast India Landslide ML API is running",
        "model": "Random Forest",
        "model_file": MODEL_PATH
    })


# =====================================================
# PREDICTION API
# =====================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        required_features = [
            "Curvature",
            "Slope",
            "Aspect",
            "Elevation",
            "NDVI",
            "Precipitation",
            "LULC"
        ]

        # Check required inputs
        missing = [
            feature
            for feature in required_features
            if feature not in data
        ]

        if missing:
            return jsonify({
                "error": "Missing required features",
                "missing": missing
            }), 400

        # Create dataframe
        input_data = pd.DataFrame([{
            feature: float(data[feature])
            for feature in required_features
        }])

        # ML prediction
        prediction = model.predict(input_data)[0]

        # Prediction probability
        probabilities = model.predict_proba(input_data)[0]

        classes = model.classes_

        probability_data = {
            str(cls): round(float(prob) * 100, 2)
            for cls, prob in zip(classes, probabilities)
        }

        # Convert class to risk label
        risk_labels = {
            1: "LOW",
            2: "MODERATE",
            3: "HIGH"
        }

        risk = risk_labels.get(
            int(prediction),
            "UNKNOWN"
        )

        return jsonify({
            "success": True,
            "prediction": int(prediction),
            "risk": risk,
            "probabilities": probability_data
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    print("\nStarting Flask server...")
    print("API: http://127.0.0.1:5000")
    print("Press CTRL+C to stop the server.\n")

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )