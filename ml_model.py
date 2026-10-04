import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# =====================================================
# 1. LOAD DATASET
# =====================================================

DATA_PATH = (
    "data/"
    "Dataset for Landslide Susceptibility Prediction/"
    "RaigadLandslideDataset4ANN.csv"
)

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", list(df.columns))


# =====================================================
# 2. FEATURES AND TARGET
# =====================================================

features = [
    "Curvature",
    "Slope",
    "Aspect",
    "Elevation",
    "NDVI",
    "Precipitation",
    "LULC"
]

target = "Landslide"

X = df[features]
y = df[target]


# =====================================================
# 3. SHOW CLASS DISTRIBUTION
# =====================================================

print("\nLandslide class distribution:")
print(y.value_counts().sort_index())


# =====================================================
# 4. CREATE RANDOM FOREST MODEL
# =====================================================

model = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "random_forest",
        RandomForestClassifier(
            n_estimators=300,
            random_state=42,
            class_weight="balanced",
            max_depth=8
        )
    )
])


# =====================================================
# 5. TRAIN MODEL
# =====================================================

print("\nTraining Random Forest model...")

model.fit(X, y)

print("Model training completed!")


# =====================================================
# 6. TRAINING PREDICTION CHECK
# =====================================================

predictions = model.predict(X)

training_accuracy = (predictions == y).mean()

print(
    f"\nTraining accuracy: "
    f"{training_accuracy * 100:.2f}%"
)


# =====================================================
# 7. FEATURE IMPORTANCE
# =====================================================

rf = model.named_steps["random_forest"]

importance = pd.Series(
    rf.feature_importances_,
    index=features
).sort_values(ascending=False)

print("\nFeature importance:")
print(importance)


# =====================================================
# 8. SAVE MODEL
# =====================================================

MODEL_PATH = "landslide_model.joblib"

joblib.dump(model, MODEL_PATH)

print("\n========================================")
print("MODEL SAVED SUCCESSFULLY!")
print("File:", MODEL_PATH)
print("========================================\n")