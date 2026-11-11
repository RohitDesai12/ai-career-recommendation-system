"""
Career Compass — Hugging Face Private Resume Analyzer Integration Test Suite
Validates:
1. Authenticated Hugging Face connection and repository artifact presence.
2. Download / resolution of all 3 resume artifacts (resume_model.pkl, resume_encoders.pkl, resume_model_meta.json).
3. Artifact loading, unpickling, and structural integrity verification.
4. In-memory caching and sub-50ms rapid singleton retrieval.
5. Missing artifact error handling and zero token leakage verification.
6. Health and model-status endpoint telemetry reporting.
7. Functional inference on Resume Analyzer (ML pipeline and resume analysis endpoint).
8. Regression verification of V8 Recommendation Engine (100% unaffected).
"""

import os
import sys
import time
import json
import io
import tempfile
import asyncio
from pathlib import Path
from unittest.mock import patch

# Ensure ml-service root is in sys.path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from model_manager import (
    load_v8_model,
    load_v8_metadata,
    ensure_v8_files,
    get_v8_status,
    is_v8_available,
    ensure_resume_analyzer_files,
    load_resume_analyzer_artifacts,
    get_resume_model_status,
    is_resume_model_available,
    reset_resume_cache,
    download_hf_artifact,
    HF_REPO_ID,
    HF_TOKEN,
    HF_MODEL_FILENAME,
    HF_METADATA_FILENAME,
    HF_RESUME_MODEL_FILENAME,
    HF_RESUME_ENCODERS_FILENAME,
    HF_RESUME_META_FILENAME,
    is_local_v8_mode
)

from main import (
    read_root,
    health_check,
    get_model_status,
    recommend_career_v8,
    analyze_resume
)

from starlette.datastructures import UploadFile


def create_sample_pdf_bytes(text: str) -> bytes:
    """Creates a syntactically valid PDF binary containing the specified text."""
    escaped_text = text.replace("(", "").replace(")", "").replace("\r", "")
    lines = escaped_text.split("\n")
    content_stream = "BT\n/F1 12 Tf\n50 700 Td\n"
    for line in lines:
        content_stream += f"({line}) Tj T*\n"
    content_stream += "ET\n"
    stream_bytes = content_stream.encode('latin1')

    pdf_template = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length " + str(len(stream_bytes)).encode('ascii') + b" >>\n"
        b"stream\n" + stream_bytes + b"\nendstream\nendobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000244 00000 n \n"
        b"0000000350 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\n"
        b"startxref\n425\n%%EOF"
    )
    return pdf_template


def run_resume_hf_tests():
    print("=" * 80)
    print("CAREER COMPASS — PRIVATE HUGGING FACE RESUME ANALYZER INTEGRATION TEST SUITE")
    print(f"Target Repository:  {HF_REPO_ID}")
    print(f"Resume Model File:  {HF_RESUME_MODEL_FILENAME}")
    print(f"Resume Encoders:    {HF_RESUME_ENCODERS_FILENAME}")
    print(f"Resume Metadata:    {HF_RESUME_META_FILENAME}")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. Hugging Face Authentication & Repository Verification
    # --------------------------------------------------------------------------
    print("\n[TEST 1] Hugging Face Authentication & Repository Verification...")
    from huggingface_hub import HfApi
    api = HfApi()

    if HF_TOKEN:
        try:
            who = api.whoami(token=HF_TOKEN)
            username = who.get("name")
            print(f"  ✓ Authenticated as: {username}")
        except Exception as auth_err:
            print(f"  ℹ Note: Offline or auth check warning: {auth_err}")
    else:
        print("  ℹ No HF_TOKEN provided; proceeding with cached/public resolution.")

    try:
        repo_files = api.list_repo_files(repo_id=HF_REPO_ID, token=HF_TOKEN)
        print(f"  ✓ Files discovered in '{HF_REPO_ID}': {repo_files}")
        for req_file in [HF_RESUME_MODEL_FILENAME, HF_RESUME_ENCODERS_FILENAME, HF_RESUME_META_FILENAME]:
            assert req_file in repo_files, f"Repository missing required artifact: {req_file}"
        print("  ✓ All 3 resume artifacts verified in Hugging Face repository.")
    except Exception as e:
        # If offline or in isolated network sandbox, check that files are cached
        from huggingface_hub import try_to_load_from_cache
        c_model = try_to_load_from_cache(HF_REPO_ID, HF_RESUME_MODEL_FILENAME)
        c_enc = try_to_load_from_cache(HF_REPO_ID, HF_RESUME_ENCODERS_FILENAME)
        c_meta = try_to_load_from_cache(HF_REPO_ID, HF_RESUME_META_FILENAME)
        assert c_model and c_enc and c_meta, f"Artifacts must be cached if offline: {e}"
        print(f"  ✓ Network isolated sandbox: verified all 3 artifacts exist in local Hugging Face cache.")

    # --------------------------------------------------------------------------
    # 2. Artifact Resolution & Download Check
    # --------------------------------------------------------------------------
    print("\n[TEST 2] Artifact Resolution via Model Manager...")
    model_path, enc_path, meta_path, storage_mode = ensure_resume_analyzer_files()
    print(f"  ✓ Storage Mode:     {storage_mode}")
    print(f"  ✓ Model Path:       {model_path}")
    print(f"  ✓ Encoders Path:    {enc_path}")
    print(f"  ✓ Metadata Path:    {meta_path}")

    assert os.path.exists(model_path), "Resolved resume model file must exist!"
    assert os.path.exists(enc_path), "Resolved resume encoders file must exist!"
    assert os.path.exists(meta_path), "Resolved resume metadata file must exist!"

    model_size = os.path.getsize(model_path)
    enc_size = os.path.getsize(enc_path)
    meta_size = os.path.getsize(meta_path)

    print(f"  ✓ Model Size:       {model_size} bytes")
    print(f"  ✓ Encoders Size:    {enc_size} bytes")
    print(f"  ✓ Metadata Size:    {meta_size} bytes")

    assert model_size > 0, "Model file size must be non-zero!"
    assert enc_size > 0, "Encoders file size must be non-zero!"
    assert meta_size > 0, "Metadata file size must be non-zero!"
    print("  ✓ Artifact resolution and non-zero size checks passed.")

    # --------------------------------------------------------------------------
    # 3. Artifact Loading & Structural Integrity Check
    # --------------------------------------------------------------------------
    print("\n[TEST 3] Artifact Loading and Structural Integrity Check...")
    reset_resume_cache()
    model, encoders, metadata, source_info = load_resume_analyzer_artifacts(force_reload=True)

    assert model is not None, "Loaded resume model must not be None!"
    assert hasattr(model, "predict"), "Resume model must implement predict() method!"
    assert hasattr(model, "predict_proba"), "Resume model must implement predict_proba() method!"
    print(f"  ✓ Model Type:       {type(model).__name__}")

    assert isinstance(encoders, dict), "Resume encoders must be a dictionary!"
    expected_encoder_keys = {"Branch", "Target_Career", "Resume_Quality", "Top_Suggestion_Priority"}
    for k in expected_encoder_keys:
        assert k in encoders, f"Missing expected encoder key '{k}' in encoders dictionary!"
    print(f"  ✓ Encoders Keys:    {list(encoders.keys())}")

    assert isinstance(metadata, dict), "Resume metadata must be a dictionary!"
    assert "features" in metadata, "Metadata must contain 'features' list!"
    assert "career_keywords" in metadata, "Metadata must contain 'career_keywords' mapping!"

    features = metadata["features"]
    career_keywords = metadata["career_keywords"]
    print(f"  ✓ Feature count:    {len(features)} ({features[:5]}...)")
    print(f"  ✓ Career roles:     {len(career_keywords)} roles mapped")
    assert len(features) == 21, f"Expected 21 features in resume model, got {len(features)}"
    assert len(career_keywords) > 0, "Career keywords map must not be empty!"

    # --------------------------------------------------------------------------
    # 4. In-Memory Caching & Sub-50ms Fast Retrieval
    # --------------------------------------------------------------------------
    print("\n[TEST 4] In-Memory Caching & Performance Verification...")
    t0 = time.perf_counter()
    cached_model, cached_encoders, cached_meta, cached_info = load_resume_analyzer_artifacts()
    t1 = time.perf_counter()
    retrieval_ms = (t1 - t0) * 1000

    print(f"  ✓ Cached retrieval time: {retrieval_ms:.3f} ms (Must be < 50 ms)")
    assert retrieval_ms < 50.0, f"Cached retrieval too slow ({retrieval_ms:.2f} ms >= 50 ms)"
    assert cached_model is model, "Cached model must return the identical singleton instance!"
    assert cached_encoders is encoders, "Cached encoders must return the identical singleton instance!"
    assert cached_meta is metadata, "Cached metadata must return the identical singleton instance!"
    print("  ✓ In-memory singleton caching validated.")

    # --------------------------------------------------------------------------
    # 5. Missing Artifact Error Handling & Zero Token Leakage
    # --------------------------------------------------------------------------
    print("\n[TEST 5] Missing Artifact Error Handling & Token Sanitization...")
    bogus_filename = "non_existent_artifact_test_xyz123.pkl"
    try:
        download_hf_artifact(HF_REPO_ID, bogus_filename, token=HF_TOKEN)
        assert False, "Should have raised RuntimeError for non-existent file!"
    except RuntimeError as err:
        err_msg = str(err)
        print(f"  ✓ Clean error message raised: {err_msg}")
        if HF_TOKEN:
            assert HF_TOKEN not in err_msg, "CRITICAL: HF_TOKEN leaked into error message!"
        assert "not found" in err_msg.lower() or "failed" in err_msg.lower(), "Expected not found or failed message"
        print("  ✓ Error message properly sanitized (zero token leakage).")

    # --------------------------------------------------------------------------
    # 6. Health & Telemetry Endpoint Verification
    # --------------------------------------------------------------------------
    print("\n[TEST 6] Health & Model Status Telemetry Verification...")
    health = health_check()
    status = get_model_status()

    print(f"  ✓ Health Status:     {health.get('status')}")
    print(f"  ✓ Active Engine:     {health.get('active_engine')}")
    print(f"  ✓ Resume Telemetry:  {json.dumps(status.get('resume_model'), indent=4)}")

    assert health["status"] == "healthy", "Health check status must be healthy!"
    assert health["active_engine"] == "v8", "Active engine must be v8!"

    # Verify status["resume_model"] exact schema
    res_status = status.get("resume_model", {})
    assert res_status.get("loaded") is True, "'loaded' must be True!"
    assert res_status.get("file_present") is True, "'file_present' must be True!"
    assert res_status.get("file_size_bytes") > 0, "'file_size_bytes' must be > 0!"
    assert res_status.get("encoders_loaded") is True, "'encoders_loaded' must be True!"
    assert res_status.get("metadata_loaded") is True, "'metadata_loaded' must be True!"

    expected_storage = "local" if is_local_v8_mode() else "huggingface"
    assert res_status.get("storage") == expected_storage, f"Storage should be '{expected_storage}'"
    if expected_storage == "huggingface":
        assert res_status.get("repository") == HF_REPO_ID, f"Repository should be '{HF_REPO_ID}'"

    # Also verify health["resume_model"] contains the same telemetry
    assert health.get("resume_model", {}).get("loaded") is True
    print("  ✓ Telemetry schema and values verified successfully.")

    # --------------------------------------------------------------------------
    # 7. Functional Inference on Resume Analyzer
    # --------------------------------------------------------------------------
    print("\n[TEST 7] Functional Inference & Prediction on Resume Analyzer...")
    import numpy as np

    # Test ML Model prediction directly with a sample feature vector
    feat_dict = {
        "Branch": "CSE",
        "Year": 3,
        "CGPA": 8.5,
        "Word_Count": 420,
        "Has_Summary": 1,
        "Has_Skills": 1,
        "Has_Experience": 1,
        "Has_Education": 1,
        "Has_Projects": 1,
        "Has_Certifications": 1,
        "Has_Achievements": 0,
        "Sections_Count": 5,
        "Has_Internship": 1,
        "Internship_Months": 3,
        "Action_Verb_Count": 10,
        "Keywords_Matched": 6,
        "Keywords_Total": 8,
        "Keyword_Match_Score": 75,
        "Formatting_Score": 85,
        "ATS_Score": 82,
        "Resume_Quality": 2
    }

    f_vals = []
    for f in features:
        val = feat_dict.get(f, 0)
        if f in encoders:
            enc = encoders[f]
            val_str = str(val)
            if val_str in enc.classes_:
                val = enc.transform([val_str])[0]
            else:
                val = enc.transform([enc.classes_[0]])[0]
        f_vals.append(val)

    X_test = np.array([f_vals])
    prediction = model.predict(X_test)[0]
    probabilities = model.predict_proba(X_test)[0]

    print(f"  ✓ Direct Model Prediction: {prediction}")
    print(f"  ✓ Probabilities count:     {len(probabilities)}")
    print(f"  ✓ Probability sum:         {sum(probabilities):.4f}")
    assert len(probabilities) > 0, "Model predict_proba must return non-empty probabilities!"
    assert abs(sum(probabilities) - 1.0) < 1e-4, "Probabilities must sum to 1.0!"

    # Test analyze_resume endpoint function with a sample PDF
    resume_body = (
        "John Doe\n"
        "Software Engineer | email: john.doe@example.com | phone: 9876543210\n"
        "EDUCATION\n"
        "B.Tech in Computer Science and Engineering, 2025, CGPA: 8.5\n"
        "SKILLS\n"
        "Python, React, JavaScript, SQL, Git, Docker, FastAPI, REST APIs\n"
        "EXPERIENCE\n"
        "Full Stack Developer Intern at Tech Solutions (6 months)\n"
        "Developed web applications, optimized database queries, automated pipelines\n"
        "PROJECTS\n"
        "AI Career Recommendation System with Machine Learning and React\n"
        "CERTIFICATIONS\n"
        "AWS Certified Cloud Practitioner, Python for Data Science"
    )
    pdf_bytes = create_sample_pdf_bytes(resume_body)

    # Use SpooledTemporaryFile to simulate FastAPI file upload
    temp_file = tempfile.SpooledTemporaryFile()
    temp_file.write(pdf_bytes)
    temp_file.seek(0)
    upload_file = UploadFile(file=temp_file, filename="test_resume.pdf")

    # Mock requests.post to avoid remote LLM latency/offline block during unit test
    with patch("requests.post") as mock_post:
        mock_post.side_effect = Exception("LLM offline fallback test")
        res = asyncio.run(analyze_resume(
            branch="Computer Science and Engineering",
            jobRole="Software Development Engineer",
            file=upload_file
        ))

    print(f"  ✓ /api/analyze-resume Response Document Type: {res.get('document_type')}")
    print(f"  ✓ ATS Score:       {res.get('atsScore')}%")
    print(f"  ✓ Matched Keywords: {res.get('matchedKeywords')}")
    print(f"  ✓ Resume Strength: {res.get('resumeStrength')}")

    assert res.get("document_type") == "resume", "Uploaded document must be identified as resume!"
    assert res.get("atsScore", 0) > 50, "ATS Score for valid resume should exceed 50%!"
    assert len(res.get("matchedKeywords", [])) > 0, "Matched keywords should be detected!"
    assert "field_match" in res, "Response must include field_match data!"
    print("  ✓ Functional resume analysis endpoint test passed.")

    # --------------------------------------------------------------------------
    # 8. Regression Check on V8 Career Recommendations
    # --------------------------------------------------------------------------
    print("\n[TEST 8] Regression Check on V8 Career Recommendation Engine...")
    test_v8_profile = {
        "Branch": "Mechatronics Engineering",
        "Specialization": "Robotics and Automation",
        "CGPA": 8.5,
        "Academic_Performance": "Excellent",
        "Primary_Skill": "Robotics",
        "Secondary_Skill": "Automation",
        "Programming_Languages": "MATLAB, C++",
        "Technical_Proficiency": "Advanced",
        "Certifications": "Industrial Robotics",
        "Interest_Area": "Robotics & Automation",
        "Career_Goal": "Design autonomous robotic systems",
        "Preferred_Environment": "R&D Center",
        "Target_Sector": "Automotive",
        "Expected_Salary": 12.0,
        "Higher_Studies_Interest": "No",
        "Research_Interest": "Moderate",
        "Problem_Solving_Level": "Advanced",
        "Communication_Level": "Good",
        "Preferred_Location": "Pune",
        "Startup_Interest": "Moderate"
    }

    rec_v8 = recommend_career_v8(test_v8_profile)
    primary = rec_v8["primary_career"]
    print(f"  ✓ V8 Primary Career:        {primary['career_title']}")
    print(f"  ✓ Compatibility Score:      {primary['compatibility_score']}%")
    print(f"  ✓ Top Recommendations:      {len(rec_v8['top_recommendations'])} alternatives")

    assert rec_v8["status"] == "success", "V8 recommendation status must be success!"
    assert primary["career_title"] == "Robotics Engineer", "Expected Robotics Engineer for Mechatronics profile!"
    assert primary["compatibility_score"] > 80.0, "Compatibility score must be > 80%!"

    # Verify mathematical consistency of 6-factor scoring
    breakdown = primary.get("component_scores") or primary.get("compatibility_breakdown", {})
    weights = primary.get("active_weights", {})
    contributions = primary.get("weighted_contributions", {})
    calc_sum = round(sum(contributions.values()), 2)
    reported_score = primary["compatibility_score"]

    print(f"  ✓ Six factors:              {list(breakdown.keys())}")
    print(f"  ✓ Weighted contributions:   {contributions}")
    print(f"  ✓ Sum of contributions:     {calc_sum}% == {reported_score}%")
    assert abs(calc_sum - reported_score) <= 0.05, f"Sum of contributions {calc_sum} must equal {reported_score}"
    print("  ✓ V8 recommendation engine is 100% intact and mathematically verified.")

    print("\n" + "=" * 80)
    print("ALL 8 HUGGING FACE RESUME ANALYZER INTEGRATION TESTS PASSED!")
    print("=" * 80)


if __name__ == "__main__":
    run_resume_hf_tests()
