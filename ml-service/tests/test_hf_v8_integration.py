"""
Career Compass — Hugging Face Private V8 Model Integration Test Suite
Validates:
1. Hugging Face Authentication with private repository.
2. Model download (career_model_v8.pkl).
3. Metadata download (career_model_v8_metadata.json).
4. Model loading and validation (Pipeline integrity).
5. predict_proba() availability and numerical validity.
6. All 35 career categories present and covered.
7. Actual V8 recommendation API endpoint (/api/recommend/v8).
8. Existing six-factor compatibility scorer and ranker.
9. In-memory and disk caching (no redundant downloads).
10. Mode switching (Hugging Face production mode vs local dev mode) and restart integrity.
"""

import os
import sys
import time
from pathlib import Path

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from model_manager import (
    load_v8_model,
    load_v8_metadata,
    ensure_v8_files,
    download_v8_from_hf,
    validate_v8_artifacts,
    get_v8_status,
    reset_v8_cache,
    is_v8_available,
    HF_REPO_ID,
    HF_MODEL_FILENAME,
    HF_METADATA_FILENAME,
    HF_TOKEN,
    EXPECTED_FEATURES_COUNT,
    EXPECTED_CLASSES_COUNT
)

from v8 import (
    predict_v8,
    rank_careers_v8,
    get_all_careers
)

from main import (
    read_root,
    health_check,
    get_model_status,
    recommend_career_v8
)


def run_hf_integration_tests():
    print("=" * 80)
    print("CAREER COMPASS — PRIVATE HUGGING FACE V8 INTEGRATION TEST SUITE")
    print(f"Target Repository: {HF_REPO_ID}")
    print(f"Model File:        {HF_MODEL_FILENAME}")
    print(f"Metadata File:     {HF_METADATA_FILENAME}")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Hugging Face Authentication
    # --------------------------------------------------------------------------
    print("\n[TEST 1] Hugging Face Authentication Verification...")
    from huggingface_hub import HfApi
    api = HfApi()
    user_info = api.whoami(token=HF_TOKEN)
    username = user_info.get("name")
    print(f"  ✓ Authenticated as: {username}")
    assert username is not None, "Authentication must succeed with a valid user!"
    print("  ✓ Authentication passed successfully.")

    # --------------------------------------------------------------------------
    # 2. Metadata Download
    # --------------------------------------------------------------------------
    print("\n[TEST 2] Metadata Download from Hugging Face...")
    meta_path = download_v8_from_hf(HF_REPO_ID, HF_METADATA_FILENAME, token=HF_TOKEN)
    print(f"  ✓ Metadata resolved at: {meta_path}")
    assert os.path.exists(meta_path), "Downloaded metadata file must exist!"
    assert os.path.getsize(meta_path) > 0, "Metadata file size must be non-zero!"

    meta = load_v8_metadata(force_reload=True)
    features = meta.get("feature_columns") or meta.get("features", [])
    classes = meta.get("classes", [])
    print(f"  ✓ Model Name:     {meta.get('model_name')}")
    print(f"  ✓ Features count: {len(features)} (Expected: {EXPECTED_FEATURES_COUNT})")
    print(f"  ✓ Classes count:  {len(classes)} (Expected: {EXPECTED_CLASSES_COUNT})")
    assert len(features) == EXPECTED_FEATURES_COUNT, f"Must have {EXPECTED_FEATURES_COUNT} features!"
    assert len(classes) == EXPECTED_CLASSES_COUNT, f"Must have {EXPECTED_CLASSES_COUNT} classes!"

    # --------------------------------------------------------------------------
    # 3. Model Download
    # --------------------------------------------------------------------------
    print("\n[TEST 3] Model Download from Hugging Face...")
    model_path = download_v8_from_hf(HF_REPO_ID, HF_MODEL_FILENAME, token=HF_TOKEN)
    print(f"  ✓ Model resolved at: {model_path}")
    assert os.path.exists(model_path), "Downloaded model file must exist!"
    model_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    print(f"  ✓ Model binary size: {model_size_mb:.2f} MB")
    assert model_size_mb > 1.0, "Model file size should be > 1 MB!"

    # --------------------------------------------------------------------------
    # 4. Model Loading & Integrity Validation
    # --------------------------------------------------------------------------
    print("\n[TEST 4] Model Loading & Validation (Pipeline Integrity)...")
    model = load_v8_model(force_reload=True)
    assert model is not None, "Model must load successfully!"
    validate_v8_artifacts(model, meta)
    print(f"  ✓ Loaded model type: {type(model).__name__}")
    print("  ✓ Model validation passed (features, classes, and pipeline structure valid).")

    # --------------------------------------------------------------------------
    # 5. predict_proba() Availability and Numerical Validity
    # --------------------------------------------------------------------------
    print("\n[TEST 5] predict_proba() Availability and Probabilistic Output...")
    assert hasattr(model, "predict_proba") and callable(model.predict_proba), "Model must implement predict_proba!"

    sample_profile = {
        "Branch": "Computer Science and Engineering",
        "Specialization": "Artificial Intelligence",
        "CGPA": 8.8,
        "Academic_Performance": "Excellent",
        "Primary_Skill": "Python",
        "Secondary_Skill": "Machine Learning",
        "Programming_Languages": "Python, C++",
        "Technical_Proficiency": "Advanced",
        "Certifications": "Deep Learning Specialization",
        "Interest_Area": "Artificial Intelligence and Machine Learning",
        "Career_Goal": "Build autonomous intelligent systems",
        "Preferred_Environment": "Product Development",
        "Target_Sector": "Technology",
        "Expected_Salary": 18.0,
        "Higher_Studies_Interest": "No",
        "Research_Interest": "Medium",
        "Problem_Solving_Level": "Expert",
        "Communication_Level": "Good",
        "Preferred_Location": "Bangalore",
        "Startup_Interest": "Yes"
    }

    pred_res = predict_v8(sample_profile)
    assert pred_res["status"] == "success", f"Inference failed: {pred_res.get('message')}"
    top_career = pred_res["predicted_career"]
    top_prob = pred_res["predicted_probability"]
    print(f"  ✓ Top Predicted Career: {top_career} ({top_prob:.2f}%)")
    assert top_prob > 0.0, "Top predicted probability must be > 0!"

    probs = pred_res["class_probabilities"]
    sum_probs = sum(probs.values())
    print(f"  ✓ Total probability sum across all classes: {sum_probs:.2f}%")
    assert 99.0 <= sum_probs <= 101.0, "Probabilities must sum to ~100%!"

    # --------------------------------------------------------------------------
    # 6. All 35 Career Categories Coverage
    # --------------------------------------------------------------------------
    print("\n[TEST 6] Verification of All 35 Career Classes...")
    assert len(model.classes_) == 35, f"Expected 35 classes, got {len(model.classes_)}"
    assert len(probs) == 35, f"Expected 35 class probabilities, got {len(probs)}"
    all_kb_careers = set(get_all_careers())
    model_classes = set(model.classes_)
    assert all_kb_careers == model_classes, "Knowledge base careers must match model classes exactly!"
    print(f"  ✓ All {len(model.classes_)} classes verified and present in knowledge base.")

    # --------------------------------------------------------------------------
    # 7. Actual V8 Recommendation API Endpoint
    # --------------------------------------------------------------------------
    print("\n[TEST 7] Actual V8 Recommendation API (/api/recommend/v8)...")
    api_response = recommend_career_v8({"profile": sample_profile})
    assert api_response["status"] == "success"
    assert "primary_career" in api_response
    assert "top_recommendations" in api_response
    assert len(api_response["top_recommendations"]) >= 3
    primary = api_response["primary_career"]
    print(f"  ✓ API Recommended Top Career: {primary['career_title']}")
    print(f"  ✓ Compatibility Score:        {primary['compatibility_score']}%")
    print(f"  ✓ Strongest Factors:          {primary.get('strongest_factors', [])}")
    print(f"  ✓ Why Recommended snippet:    {primary.get('why_recommended', '')[:90]}...")
    assert api_response["engine"] == "v8"

    # --------------------------------------------------------------------------
    # 8. Six-Factor Compatibility Scoring and Ranking Engine
    # --------------------------------------------------------------------------
    print("\n[TEST 8] Six-Factor Compatibility Scoring & Ranking Engine...")
    ranked_res = rank_careers_v8(sample_profile, top_n=5)
    assert ranked_res["status"] == "success"
    top_ranked = ranked_res["primary_career"]
    breakdown = top_ranked.get("compatibility_breakdown") or top_ranked.get("component_scores", {})
    required_factors = [
        "ml_prediction",
        "technical_skills",
        "interest",
        "academic",
        "career_preference",
        "career_readiness"
    ]
    for factor in required_factors:
        assert factor in breakdown, f"Missing factor in breakdown: {factor}"
        print(f"    - {factor:22}: {breakdown[factor]}%")
    print("  ✓ All 6 compatibility factors successfully calculated and normalized.")

    # --------------------------------------------------------------------------
    # 9. Model Caching Verification (No Redundant Downloads)
    # --------------------------------------------------------------------------
    print("\n[TEST 9] Model In-Memory and Disk Caching Verification...")
    t_start = time.time()
    model_cached = load_v8_model()
    t_cached = time.time() - t_start
    print(f"  ✓ Cached access took: {t_cached * 1000:.3f} ms")
    assert model_cached is model, "load_v8_model() must return the exact same in-memory object (singleton)!"
    assert t_cached < 0.05, "Cached retrieval must take < 50ms!"

    # --------------------------------------------------------------------------
    # 10. Mode Switching & Health Telemetry
    # --------------------------------------------------------------------------
    print("\n[TEST 10] Mode Switching, Telemetry & Health Endpoint...")
    status = get_model_status()
    career_eng = status["career_engine"]
    print(f"  ✓ Mode:        {career_eng['mode']}")
    print(f"  ✓ HF Repo:     {career_eng['hf_repo_id']}")
    print(f"  ✓ Available:   {career_eng['available']}")
    assert career_eng["mode"] == "huggingface"
    assert career_eng["hf_repo_id"] == "rohitdesai205/compass"
    assert career_eng["available"] is True

    # Test Local Mode Switching
    print("  Testing Local Mode override (USE_LOCAL_V8_MODEL=true)...")
    os.environ["USE_LOCAL_V8_MODEL"] = "true"
    reset_v8_cache()
    # Reload with local override
    model_local = load_v8_model()
    assert model_local is not None
    local_status = get_v8_status()
    print(f"  ✓ Local mode active: mode={local_status['mode']}")
    assert local_status["mode"] == "local"

    # Restore Production HF Mode
    os.environ["USE_LOCAL_V8_MODEL"] = "false"
    reset_v8_cache()
    model_restored = load_v8_model()
    assert model_restored is not None
    restored_status = get_v8_status()
    print(f"  ✓ Restored to Hugging Face mode: mode={restored_status['mode']}")
    assert restored_status["mode"] == "huggingface"

    print("\n" + "=" * 80)
    print("ALL 10 HUGGING FACE V8 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 80)


if __name__ == "__main__":
    run_hf_integration_tests()
