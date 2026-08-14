import joblib
import json

with open("model_meta.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

print("Features count:", len(meta["features"]))
try:
    encoders = joblib.load("label_encoders.pkl")
    print("Type of encoders:", type(encoders))
    if isinstance(encoders, dict):
        print("Encoder keys:", list(encoders.keys()))
        first_key = list(encoders.keys())[0]
        if hasattr(encoders[first_key], 'classes_'):
            print(f"Sample classes for {first_key}:", encoders[first_key].classes_[:5])
except Exception as e:
    print("Error loading encoders:", e)

try:
    model = joblib.load("career_model.pkl")
    print("Model type:", type(model))
except Exception as e:
    print("Error loading model:", e)
