"""
Career Compass V8 — Machine Learning Prediction Engine
Loads the trained HistGradientBoosting pipeline and runs inference across all 35 career categories.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
import joblib

logger = logging.getLogger("v8.engine")

# Construct reliable absolute paths relative to this module
_MODULE_DIR = Path(__file__).resolve().parent
_ML_SERVICE_DIR = _MODULE_DIR.parent

V8_MODEL_PATH = _ML_SERVICE_DIR / "models" / "v8" / "career_model_v8.pkl"
V8_META_PATH = _ML_SERVICE_DIR / "models" / "v8" / "career_model_v8_metadata.json"

# In-memory singleton cache
_V8_MODEL = None
_V8_METADATA = None

FEATURE_COLUMNS = [
    "Branch",
    "Specialization",
    "CGPA",
    "Academic_Performance",
    "Primary_Skill",
    "Secondary_Skill",
    "Programming_Languages",
    "Technical_Proficiency",
    "Certifications",
    "Interest_Area",
    "Career_Goal",
    "Preferred_Environment",
    "Target_Sector",
    "Expected_Salary",
    "Higher_Studies_Interest",
    "Research_Interest",
    "Problem_Solving_Level",
    "Communication_Level",
    "Preferred_Location",
    "Startup_Interest"
]


def load_v8_metadata() -> Dict[str, Any]:
    """Loads and caches the V8 model metadata JSON."""
    global _V8_METADATA
    if _V8_METADATA is not None:
        return _V8_METADATA

    if not V8_META_PATH.exists():
        logger.warning(f"V8 metadata not found at: {V8_META_PATH}")
        return {}

    try:
        with open(V8_META_PATH, "r", encoding="utf-8") as f:
            _V8_METADATA = json.load(f)
        return _V8_METADATA
    except Exception as e:
        logger.error(f"Error loading V8 metadata: {e}")
        return {}


def load_v8_model():
    """Loads and caches the V8 scikit-learn Pipeline singleton."""
    global _V8_MODEL
    if _V8_MODEL is not None:
        return _V8_MODEL

    if not V8_MODEL_PATH.exists():
        logger.warning(f"V8 model pickle not found at: {V8_MODEL_PATH}")
        return None

    try:
        logger.info(f"Loading V8 model from: {V8_MODEL_PATH} ({V8_MODEL_PATH.stat().st_size} bytes)")
        _V8_MODEL = joblib.load(V8_MODEL_PATH)
        logger.info(f"Successfully loaded V8 model: {type(_V8_MODEL).__name__} with {len(_V8_MODEL.classes_)} classes.")
        return _V8_MODEL
    except Exception as e:
        logger.error(f"Failed to load V8 model pickle: {e}")
        return None


def is_v8_available() -> bool:
    """Checks whether the V8 model is available and loaded."""
    m = load_v8_model()
    return m is not None


def prepare_input_dataframe(student_profile: Dict[str, Any]) -> pd.DataFrame:
    """
    Sanitizes student profile input into a 1-row pandas DataFrame matching
    the exact 20 feature columns required by the V8 Pipeline.
    """
    row = {}
    for col in FEATURE_COLUMNS:
        val = student_profile.get(col)

        # Handle aliases or alternative casing
        if val is None:
            # Check lowercase or snake_case key variants
            snake = col.lower()
            val = student_profile.get(snake)

        # Numerical fields
        if col in ("CGPA", "Expected_Salary"):
            if val is not None and val != "":
                try:
                    row[col] = float(val)
                except (ValueError, TypeError):
                    row[col] = np.nan
            else:
                row[col] = np.nan
        else:
            # Categorical fields
            if val is not None and str(val).strip() != "":
                row[col] = str(val).strip()
            else:
                row[col] = np.nan

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def predict_v8(student_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs V8 model inference on the provided student profile.
    Returns:
        - predicted_career (top 1)
        - predicted_probability (0-100)
        - class_probabilities: { career_name: probability_pct } for all 35 classes
        - model_classes: list of all 35 classes
        - status: 'success' | 'error'
    """
    model = load_v8_model()
    if model is None:
        return {
            "status": "error",
            "message": "V8 model is not loaded or unavailable",
            "predicted_career": None,
            "predicted_probability": 0.0,
            "class_probabilities": {}
        }

    df = prepare_input_dataframe(student_profile)

    try:
        probs = model.predict_proba(df)[0]
        classes = list(model.classes_)

        class_probs = {}
        for cls_name, prob in zip(classes, probs):
            class_probs[cls_name] = round(float(prob) * 100.0, 4)

        # Sort descending
        sorted_probs = sorted(class_probs.items(), key=lambda item: item[1], reverse=True)
        top_career, top_prob = sorted_probs[0]

        return {
            "status": "success",
            "predicted_career": top_career,
            "predicted_probability": round(top_prob, 2),
            "class_probabilities": class_probs,
            "sorted_predictions": [{"career": c, "model_score": p} for c, p in sorted_probs],
            "model_classes": classes,
            "model_name": "Career Compass V8 - HistGradientBoosting"
        }
    except Exception as e:
        logger.error(f"Inference error in V8 model: {e}")
        return {
            "status": "error",
            "message": f"V8 inference error: {str(e)}",
            "predicted_career": None,
            "predicted_probability": 0.0,
            "class_probabilities": {}
        }

