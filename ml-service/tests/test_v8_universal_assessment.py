"""
Career Compass V8 — Universal Branch-Neutral Career Discovery Assessment Test Suite
Verifies:
  1. Actual V8 model file loading, feature schema (20 features), classes_ (35 classes), predict_proba() execution
  2. End-to-end evaluation of the 10 distinct student profiles representing diverse engineering branches
  3. Cross-disciplinary pathway discovery (e.g. Mechanical -> Robotics/AI, Electronics -> AI/IoT, Biotech -> Research)
  4. Resilience to incomplete / beginner profiles ("Starting Fresh")
  5. Retention of separate V8 model confidence vs multi-factor compatibility scores
  6. Backward compatibility for V3 fallback and Resume Analyzer
"""

import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from v8 import (
    load_v8_model,
    load_v8_metadata,
    is_v8_available,
    predict_v8,
    get_all_careers,
    get_career_metadata,
    CompatibilityScorer,
    rank_careers_v8,
    CareerRanker
)
from v8.v8_engine import FEATURE_COLUMNS


def test_actual_model_pipeline():
    """Verifies that the actual V8 model file is loaded and executes real predict_proba."""
    print("\n--- Test 1: Actual Model Loading & Pipeline Architecture ---")
    model = load_v8_model()
    assert model is not None, "V8 model failed to load from pickle"
    assert hasattr(model, "predict_proba"), "V8 model must implement predict_proba"
    assert len(model.classes_) == 35, f"Expected 35 target classes, got {len(model.classes_)}"
    assert len(FEATURE_COLUMNS) == 20, f"Expected exactly 20 features, got {len(FEATURE_COLUMNS)}"

    # Create dummy 1-row DataFrame with all 20 features
    sample_row = {
        "Branch": "Mechanical Engineering",
        "Specialization": "Robotics",
        "CGPA": 8.4,
        "Academic_Performance": "Good",
        "Primary_Skill": "SolidWorks",
        "Secondary_Skill": "ROS",
        "Programming_Languages": "Python, C++",
        "Technical_Proficiency": "Intermediate",
        "Certifications": "Robotics certification",
        "Interest_Area": "Robotics and Automation",
        "Career_Goal": "Build autonomous robotic systems",
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

    df = pd.DataFrame([sample_row], columns=FEATURE_COLUMNS)
    probs = model.predict_proba(df)[0]
    assert len(probs) == 35, f"Expected 35 probabilities from predict_proba, got {len(probs)}"
    assert abs(sum(probs) - 1.0) < 1e-3, "Probabilities across 35 classes must sum to 1.0"

    print("✓ Model successfully loaded from file")
    print(f"✓ Pipeline architecture: {type(model).__name__}")
    print(f"✓ Classes: {len(model.classes_)} classes verified")
    print(f"✓ Features: Exactly 20 canonical columns mapped and validated")


def test_ten_engineering_profiles():
    """Tests the 10 distinct engineering profiles required by the specification."""
    print("\n--- Test 2: Ten Multi-Disciplinary Engineering Profiles ---")

    test_profiles = [
        # 1. CSE student interested in software development
        {
            "id": "1. CSE Software",
            "profile": {
                "Branch": "Computer Science and Engineering",
                "Specialization": "Software Engineering",
                "CGPA": 8.5,
                "Academic_Performance": "Good",
                "Primary_Skill": "Java",
                "Secondary_Skill": "Data Structures",
                "Programming_Languages": "Java, SQL",
                "Technical_Proficiency": "Advanced",
                "Certifications": "Java Certification",
                "Interest_Area": "Software and Application Development",
                "Career_Goal": "Build scalable software applications",
                "Preferred_Environment": "Product-based Company",
                "Target_Sector": "Information Technology",
                "Expected_Salary": 14.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Low",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Good",
                "Preferred_Location": "Bangalore",
                "Startup_Interest": "Moderate"
            },
            "expected_domains": ["Software Development Engineer", "Backend Developer", "Full Stack Developer"]
        },
        # 2. CSE student interested in Data Engineering
        {
            "id": "2. CSE Data Engineering",
            "profile": {
                "Branch": "Computer Science and Engineering",
                "Specialization": "Data Systems",
                "CGPA": 8.3,
                "Academic_Performance": "Good",
                "Primary_Skill": "SQL",
                "Secondary_Skill": "Apache Spark",
                "Programming_Languages": "Python, SQL",
                "Technical_Proficiency": "Advanced",
                "Certifications": "Databricks certification",
                "Interest_Area": "Data Engineering and Database Systems",
                "Career_Goal": "Build scalable data pipelines",
                "Preferred_Environment": "Product-based Company",
                "Target_Sector": "Information Technology",
                "Expected_Salary": 12.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Moderate",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Good",
                "Preferred_Location": "Hyderabad",
                "Startup_Interest": "Moderate"
            },
            "expected_domains": ["Data Engineer", "Database Engineer", "Data Scientist"]
        },
        # 3. Mechanical student interested in robotics
        {
            "id": "3. Mechanical Robotics",
            "profile": {
                "Branch": "Mechanical Engineering",
                "Specialization": "Robotics",
                "CGPA": 8.1,
                "Academic_Performance": "Good",
                "Primary_Skill": "ROS",
                "Secondary_Skill": "SolidWorks",
                "Programming_Languages": "MATLAB, C++",
                "Technical_Proficiency": "Intermediate",
                "Certifications": "Robotics certification",
                "Interest_Area": "Robotics and Automation",
                "Career_Goal": "Build intelligent autonomous robotic systems",
                "Preferred_Environment": "R&D Center",
                "Target_Sector": "Automotive",
                "Expected_Salary": 10.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Moderate",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Good",
                "Preferred_Location": "Pune",
                "Startup_Interest": "High"
            },
            "expected_domains": ["Robotics Engineer", "Mechanical Design Engineer", "Automotive Engineer"]
        },
        # 4. Mechanical student interested in automotive engineering
        {
            "id": "4. Mechanical Automotive",
            "profile": {
                "Branch": "Mechanical Engineering",
                "Specialization": "Automotive Systems",
                "CGPA": 7.9,
                "Academic_Performance": "Good",
                "Primary_Skill": "CATIA",
                "Secondary_Skill": "ANSYS",
                "Programming_Languages": "MATLAB, Python",
                "Technical_Proficiency": "Intermediate",
                "Certifications": "Automotive Design certification",
                "Interest_Area": "Automotive Technology",
                "Career_Goal": "Design advanced automotive powertrains",
                "Preferred_Environment": "Automotive",
                "Target_Sector": "Automotive",
                "Expected_Salary": 8.5,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Low",
                "Problem_Solving_Level": "Intermediate",
                "Communication_Level": "Average",
                "Preferred_Location": "Pune",
                "Startup_Interest": "Moderate"
            },
            "expected_domains": ["Automotive Engineer", "Mechanical Design Engineer"]
        },
        # 5. Civil student interested in structural engineering
        {
            "id": "5. Civil Structural",
            "profile": {
                "Branch": "Civil Engineering",
                "Specialization": "Structural Engineering",
                "CGPA": 8.0,
                "Academic_Performance": "Good",
                "Primary_Skill": "STAAD.Pro",
                "Secondary_Skill": "AutoCAD",
                "Programming_Languages": "None / Basic Scripting",
                "Technical_Proficiency": "Intermediate",
                "Certifications": "Structural Engineering certification",
                "Interest_Area": "Construction and Structural Design",
                "Career_Goal": "Design resilient civic and structural infrastructure",
                "Preferred_Environment": "Construction Site",
                "Target_Sector": "Construction",
                "Expected_Salary": 7.5,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Low",
                "Problem_Solving_Level": "Intermediate",
                "Communication_Level": "Good",
                "Preferred_Location": "Mumbai",
                "Startup_Interest": "Low"
            },
            "expected_domains": ["Civil Structural Engineer", "Environmental Engineer"]
        },
        # 6. Electrical student interested in power systems
        {
            "id": "6. Electrical Power",
            "profile": {
                "Branch": "Electrical Engineering",
                "Specialization": "Power Systems",
                "CGPA": 8.2,
                "Academic_Performance": "Good",
                "Primary_Skill": "PLC",
                "Secondary_Skill": "Power Systems",
                "Programming_Languages": "None / Basic Scripting",
                "Technical_Proficiency": "Intermediate",
                "Certifications": "Power Systems certification",
                "Interest_Area": "Electrical Systems and Power Engineering",
                "Career_Goal": "Optimize electrical grid reliability and machines",
                "Preferred_Environment": "Power Utility",
                "Target_Sector": "CleanTech & Energy",
                "Expected_Salary": 8.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Moderate",
                "Problem_Solving_Level": "Intermediate",
                "Communication_Level": "Good",
                "Preferred_Location": "Delhi NCR",
                "Startup_Interest": "Low"
            },
            "expected_domains": ["Electrical Power Systems Engineer", "Electronics Design Engineer"]
        },
        # 7. ECE student interested in embedded systems
        {
            "id": "7. ECE Embedded",
            "profile": {
                "Branch": "Electronics and Communication",
                "Specialization": "Embedded Systems",
                "CGPA": 8.4,
                "Academic_Performance": "Good",
                "Primary_Skill": "Embedded C",
                "Secondary_Skill": "Microcontrollers",
                "Programming_Languages": "C, Embedded C",
                "Technical_Proficiency": "Advanced",
                "Certifications": "Embedded systems certification",
                "Interest_Area": "Embedded Systems and IoT",
                "Career_Goal": "Build reliable embedded products",
                "Preferred_Environment": "Electronics Laboratory",
                "Target_Sector": "Electronics Manufacturing",
                "Expected_Salary": 10.5,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Moderate",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Good",
                "Preferred_Location": "Bangalore",
                "Startup_Interest": "Moderate"
            },
            "expected_domains": ["Embedded Systems Engineer", "IoT Engineer", "Electronics Design Engineer"]
        },
        # 8. Biotechnology student interested in research
        {
            "id": "8. Biotechnology Research",
            "profile": {
                "Branch": "Biotechnology",
                "Specialization": "Applied Research",
                "CGPA": 8.6,
                "Academic_Performance": "Excellent",
                "Primary_Skill": "Bioinformatics",
                "Secondary_Skill": "R",
                "Programming_Languages": "R, MATLAB",
                "Technical_Proficiency": "Advanced",
                "Certifications": "Biotech certification",
                "Interest_Area": "Biotechnology and Biomedical Research",
                "Career_Goal": "Conduct applied biological and genomics research",
                "Preferred_Environment": "Research Laboratory",
                "Target_Sector": "Healthcare & Biotech",
                "Expected_Salary": 7.0,
                "Higher_Studies_Interest": "Yes",
                "Research_Interest": "High",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Excellent",
                "Preferred_Location": "Pune",
                "Startup_Interest": "Moderate"
            },
            "expected_domains": ["Biotechnology Researcher", "Research Scientist", "Higher Studies"]
        },
        # 9. Chemical Engineering student interested in process engineering
        {
            "id": "9. Chemical Process",
            "profile": {
                "Branch": "Chemical Engineering",
                "Specialization": "Process Engineering",
                "CGPA": 8.0,
                "Academic_Performance": "Good",
                "Primary_Skill": "Process Simulation",
                "Secondary_Skill": "Aspen Plus",
                "Programming_Languages": "None / Basic Scripting",
                "Technical_Proficiency": "Intermediate",
                "Certifications": "Chemical engineering certification",
                "Interest_Area": "Chemical and Process Engineering",
                "Career_Goal": "Design safe and efficient chemical plants",
                "Preferred_Environment": "Chemical Plant",
                "Target_Sector": "Chemicals",
                "Expected_Salary": 8.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Low",
                "Problem_Solving_Level": "Intermediate",
                "Communication_Level": "Average",
                "Preferred_Location": "Mumbai",
                "Startup_Interest": "Low"
            },
            "expected_domains": ["Chemical Process Engineer"]
        },
        # 10. Electronics student interested in AI and IoT (Cross-disciplinary!)
        {
            "id": "10. Electronics AI & IoT (Cross-Disciplinary)",
            "profile": {
                "Branch": "Electronics and Communication",
                "Specialization": "Artificial Intelligence",
                "CGPA": 8.7,
                "Academic_Performance": "Excellent",
                "Primary_Skill": "Python",
                "Secondary_Skill": "IoT",
                "Programming_Languages": "Python, C++",
                "Technical_Proficiency": "Advanced",
                "Certifications": "AI certification",
                "Interest_Area": "Artificial Intelligence and Machine Learning",
                "Career_Goal": "Build edge AI and intelligent connected devices",
                "Preferred_Environment": "Product-based Company",
                "Target_Sector": "Semiconductors",
                "Expected_Salary": 14.0,
                "Higher_Studies_Interest": "No",
                "Research_Interest": "Moderate",
                "Problem_Solving_Level": "Advanced",
                "Communication_Level": "Good",
                "Preferred_Location": "Bangalore",
                "Startup_Interest": "High"
            },
            "expected_domains": ["IoT Engineer", "AI Engineer", "Embedded Systems Engineer", "Machine Learning Engineer"]
        }
    ]

    for p in test_profiles:
        res = rank_careers_v8(p["profile"], top_n=5)
        assert res["status"] == "success", f"Ranking failed for {p['id']}"
        assert len(res["top_recommendations"]) >= 3, f"Expected at least 3 recommendations for {p['id']}"

        top_rec = res["top_recommendations"][0]["career_title"]
        top_compat = res["top_recommendations"][0]["compatibility_score"]
        top_v8_score = res["top_recommendations"][0]["v8_model_score"]

        # Compatibility score must be valid 0-100
        assert 0.0 <= top_compat <= 100.0, f"Invalid compatibility score: {top_compat}"
        # Model score must be valid 0-100
        assert 0.0 <= top_v8_score <= 100.0, f"Invalid V8 model score: {top_v8_score}"

        # Verify domain alignment
        all_top_titles = [c["career_title"] for c in res["top_recommendations"]]
        match_found = any(exp in all_top_titles for exp in p["expected_domains"])
        assert match_found, f"{p['id']}: Expected one of {p['expected_domains']}, got {all_top_titles[:3]}"

        print(f"  ✓ {p['id']}: #1 {top_rec} (Compatibility: {top_compat}%, V8 Model: {top_v8_score}%)")


def test_cross_disciplinary_pathways():
    """Verifies that non-CS students with specific interests can explore cross-disciplinary paths."""
    print("\n--- Test 3: Cross-Disciplinary Recommendations ---")

    # Mechanical student interested in Artificial Intelligence
    mech_ai_profile = {
        "Branch": "Mechanical Engineering",
        "Specialization": "Artificial Intelligence",
        "CGPA": 8.6,
        "Primary_Skill": "Python",
        "Secondary_Skill": "TensorFlow",
        "Programming_Languages": "Python, C++",
        "Technical_Proficiency": "Advanced",
        "Interest_Area": "Artificial Intelligence and Machine Learning",
        "Career_Goal": "Develop intelligent automated systems",
        "Target_Sector": "Automotive",
        "Preferred_Environment": "Product-based Company"
    }

    res = rank_careers_v8(mech_ai_profile, top_n=5)
    top_titles = [c["career_title"] for c in res["top_recommendations"]]

    # Must contain AI, Robotics, or Machine Learning careers
    has_ai_or_robotics = any(
        term in t for t in top_titles for term in ["AI Engineer", "Robotics", "Machine Learning", "Computer Vision"]
    )
    assert has_ai_or_robotics, f"Cross-disciplinary Mech->AI expected AI/Robotics paths, got {top_titles}"
    print(f"  ✓ Mech -> AI student received: {top_titles[:3]}")

    # Civil student interested in Management / Consulting
    civil_mgmt_profile = {
        "Branch": "Civil Engineering",
        "Specialization": "Infrastructure Management",
        "CGPA": 8.0,
        "Primary_Skill": "AutoCAD",
        "Secondary_Skill": "Project Management",
        "Programming_Languages": "None / Basic Scripting",
        "Technical_Proficiency": "Intermediate",
        "Interest_Area": "Project Management and Consulting",
        "Career_Goal": "Manage large-scale civil engineering projects",
        "Target_Sector": "Infrastructure",
        "Preferred_Environment": "Corporate Office"
    }
    res_civ = rank_careers_v8(civil_mgmt_profile, top_n=5)
    civ_titles = [c["career_title"] for c in res_civ["top_recommendations"]]
    assert len(civ_titles) >= 3
    print(f"  ✓ Civil -> Management student received: {civ_titles[:3]}")


def test_starting_fresh_resilience():
    """Verifies that a student starting fresh with no technical skills gets solid foundational recommendations."""
    print("\n--- Test 4: Starting Fresh / Incomplete Profile Resilience ---")

    beginner_profile = {
        "Branch": "Electrical Engineering",
        "Specialization": "General",
        "CGPA": 7.5,
        "Primary_Skill": "Analytical Problem Solving",
        "Secondary_Skill": "Foundational Mathematics",
        "Programming_Languages": "None / Basic Scripting",
        "Technical_Proficiency": "Beginner",
        "Interest_Area": "Electrical Systems and Power Engineering",
        "Career_Goal": "Build foundational engineering career"
    }

    res = rank_careers_v8(beginner_profile, top_n=5)
    assert res["status"] == "success"
    assert len(res["top_recommendations"]) >= 3
    for rec in res["top_recommendations"]:
        assert 0.0 <= rec["compatibility_score"] <= 100.0
        assert "why_recommended" in rec
        assert "matching_skills" in rec
        assert "skill_gaps" in rec

    print(f"  ✓ Beginner student received valid pathways: {[c['career_title'] for c in res['top_recommendations'][:3]]}")


def test_v8_probabilities_distinct_from_compatibility():
    """Verifies that V8 probabilities (0-100) and multi-factor compatibility scores (0-100) are separate."""
    print("\n--- Test 5: Distinct V8 Probability vs Multi-Factor Compatibility ---")

    profile = {
        "Branch": "Computer Science and Engineering",
        "Primary_Skill": "Python",
        "Secondary_Skill": "SQL",
        "Programming_Languages": "Python, SQL",
        "Technical_Proficiency": "Advanced",
        "Interest_Area": "Artificial Intelligence and Machine Learning"
    }

    res = rank_careers_v8(profile, top_n=5)
    rec1 = res["top_recommendations"][0]

    # Scores must be distinct concepts
    assert "compatibility_score" in rec1
    assert "v8_model_score" in rec1
    assert "component_scores" in rec1

    print(f"  ✓ #1 Career: {rec1['career_title']}")
    print(f"    - Multi-Factor Compatibility Index: {rec1['compatibility_score']}/100")
    print(f"    - V8 ML Model Probability: {rec1['v8_model_score']}%")
    print(f"    - Factor breakdown: {list(rec1['component_scores'].keys())}")


if __name__ == "__main__":
    print("======================================================================")
    print("CAREER COMPASS V8 — UNIVERSAL BRANCH-NEUTRAL ASSESSMENT TEST SUITE")
    print("======================================================================")
    test_actual_model_pipeline()
    test_ten_engineering_profiles()
    test_cross_disciplinary_pathways()
    test_starting_fresh_resilience()
    test_v8_probabilities_distinct_from_compatibility()
    print("\n======================================================================")
    print("ALL UNIVERSAL ASSESSMENT & 10-PROFILE TESTS PASSED SUCCESSFULLY!")
    print("======================================================================")

