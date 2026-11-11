"""
Test all FastAPI endpoints in ml-service/main.py after complete V3 cleanup and V8 consolidation.
"""

import sys
import os
from pathlib import Path

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from main import (
    read_root,
    health_check,
    get_model_status,
    recommend_career,
    recommend_career_v8,
    assess_aptitude,
    MODEL_STATUS
)


def run_endpoint_tests():
    print("Testing ML Service endpoints after V3 removal...")

    # 1. Root
    root = read_root()
    print("GET / ->", root)
    assert root["active_recommendation_engine"] == "v8", "Active engine must be v8!"
    assert root["v8_available"] is True, "V8 must be available!"
    assert root["classes_count"] == 35, "V8 must have 35 classes!"
    assert root["features_count"] == 20, "V8 must have 20 features!"

    # 2. Health
    health = health_check()
    print("GET /health ->", health)
    assert health["status"] == "healthy"
    assert health["active_engine"] == "v8"
    assert health["models"]["career_engine"]["available"] is True
    assert health["models"]["career_engine"]["classes_count"] == 35

    # 3. Model Status
    status = get_model_status()
    assert status["career_engine"]["engine"] == "v8"
    assert status["resume_model"]["loaded"] is True, "Resume model must remain loaded!"

    # 4. POST /api/recommend/v8
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
    print("POST /api/recommend/v8 -> Top Career:", rec_v8["primary_career"]["career_title"], f"({rec_v8['primary_career']['compatibility_score']}%)")
    assert rec_v8["status"] == "success"
    assert rec_v8["primary_career"]["career_title"] == "Robotics Engineer"
    assert len(rec_v8["top_recommendations"]) == 5

    # 5. POST /api/recommend (Consolidated to V8)
    rec_std = recommend_career(test_v8_profile)
    print("POST /api/recommend -> Top Career:", rec_std["recommendation"], f"({rec_std['confidence']}%)")
    assert rec_std["status"] == "success"
    assert rec_std["recommendation"] == "Robotics Engineer"
    assert rec_std["model_status"] == "v8_trained_pipeline"
    assert len(rec_std["top_recommendations"]) == 5

    # 6. Legacy payload to POST /api/recommend
    legacy_profile = {
        "Branch": "Computer Science and Engineering",
        "Specialization": "Software Systems",
        "CGPA": 8.0,
        "Primary_Skill": "Java",
        "Secondary_Skill": "SQL",
        "Programming_Languages": "Java, SQL",
        "Technical_Proficiency": "Intermediate",
        "Career_Goal": "Build scalable software systems"
    }
    rec_legacy = recommend_career(legacy_profile)
    print("POST /api/recommend (legacy payload) ->", rec_legacy["recommendation"])
    assert rec_legacy["recommendation"] in ["Software Development Engineer", "Backend Developer", "Full Stack Developer"]

    # 7. POST /api/assess
    assess = assess_aptitude({})
    assert assess["score"] == 85

    print("\nALL MAIN API ENDPOINT TESTS PASSED SUCCESSFULLY!")
    return 0


if __name__ == "__main__":
    sys.exit(run_endpoint_tests())
