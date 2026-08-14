import joblib
import json
import numpy as np
import traceback

with open("model_meta_v3.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

encoders = joblib.load("label_encoders_v3.pkl")
model = joblib.load("career_model_v3.pkl")

# Generate dummy features
try:
    feature_values = []
    for f in meta['features']:
        if f in encoders:
            enc = encoders[f]
            default_val = enc.classes_[0]
            encoded_val = enc.transform([default_val])[0]
        else:
            # numeric feature
            encoded_val = 0.0
        feature_values.append(encoded_val)

    input_array = np.array([feature_values])
    pred = model.predict(input_array)[0]

    print("Prediction type:", type(pred))
    print("Prediction:", pred)

    if isinstance(pred, (int, np.integer)) and pred < len(meta['career_classes']):
        print("Mapped prediction:", meta['career_classes'][pred])
except Exception as e:
    print("Error during inference")
    traceback.print_exc()
