"""
Career Compass V8 — Comprehensive Automated Test Suite
Verifies:
  1. Model loading & pipeline architecture
  2. Knowledge base completeness (35 careers)
  3. Compatibility scoring & dynamic weight renormalization
  4. Multi-profile recommendation diversity
  5. Missing info & unknown skill resilience
  6. API endpoint compatibility (V8 and V3)
"""

import os
import sys
from pathlib import Path

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
from main import read_root, health_check, recommend_career, recommend_career_v8


def test_v8_model_loading():
    """Verifies that the V8 model loads from reliable relative path and has 35 classes."""
    model = load_v8_model()
    assert model is not None, "V8 model failed to load"
    assert len(model.classes_) == 35, f"Expected 35 classes, got {len(model.classes_)}"
    assert hasattr(model, "predict_proba"), "Model must have predict_proba"
    assert is_v8_available() is True


def test_knowledge_base_coverage():
    """Verifies that all 35 classes exist in the knowledge base with complete attributes."""
    careers = get_all_careers()
    assert len(careers) == 35, f"Expected 35 careers in KB, found {len(careers)}"

    required_keys = [
        "career_name",
        "career_description",
        "required_technical_skills",
        "recommended_programming_languages",
        "relevant_interest_areas",
        "relevant_academic_backgrounds",
        "relevant_specializations",
        "useful_certifications",
        "beginner_learning_requirements",
        "related_alternative_careers",
        "career_development_opportunities"
    ]

    for c_name in careers:
        meta = get_career_metadata(c_name)
        assert meta is not None, f"Missing metadata for career: {c_name}"
        for key in required_keys:
            assert key in meta, f"Key '{key}' missing for career: {c_name}"
            assert len(meta[key]) > 0, f"Attribute '{key}' cannot be empty for: {c_name}"


def test_scorer_weights_and_normalization():
    """Verifies that the 6 component weights sum to 100% and dynamic renormalization works."""
    scorer = CompatibilityScorer()
    total_weight = sum(scorer.weights.values())
    assert abs(total_weight - 1.0) < 1e-4, f"Weights must sum to 1.0, got {total_weight}"

    # Test with partial profile (missing academic and preference fields)
    partial_profile = {
        "Primary_Skill": "Python",
        "Secondary_Skill": "PyTorch",
        "Interest_Area": "Artificial Intelligence"
    }
    result = scorer.score_career_compatibility("AI Engineer", partial_profile, ml_prediction_prob=65.0)

    # Active weights must sum to 1.0
    active_weights_sum = sum(result["active_weights"].values())
    assert abs(active_weights_sum - 1.0) < 1e-3, f"Active weights must renormalize to 1.0, got {active_weights_sum}"
    assert 0.0 <= result["final_compatibility_score"] <= 100.0
    assert "technical_skills" in result["component_scores"]
    assert "ml_prediction" in result["component_scores"]


def test_multi_profile_diversity():
    """Verifies that different engineering profiles receive diverse, domain-appropriate recommendations."""
    profiles = {
        "CSE_AI": {
            "Branch": "Computer Science and Engineering",
            "Specialization": "Artificial Intelligence",
            "CGPA": 8.8,
            "Primary_Skill": "Python",
            "Secondary_Skill": "PyTorch",
            "Programming_Languages": "Python, SQL",
            "Technical_Proficiency": "Advanced",
            "Interest_Area": "Artificial Intelligence"
        },
        "MECH_CAD": {
            "Branch": "Mechanical Engineering",
            "Specialization": "Mechanical Design",
            "CGPA": 8.0,
            "Primary_Skill": "SolidWorks",
            "Secondary_Skill": "ANSYS",
            "Programming_Languages": "MATLAB",
            "Technical_Proficiency": "Intermediate",
            "Interest_Area": "Mechanical Design"
        },
        "ECE_VLSI": {
            "Branch": "Electronics and Communication",
            "Specialization": "VLSI Design",
            "CGPA": 8.5,
            "Primary_Skill": "Verilog",
            "Secondary_Skill": "SystemVerilog",
            "Programming_Languages": "C, Embedded C",
            "Technical_Proficiency": "Advanced",
            "Interest_Area": "Electronics"
        },
        "BIOTECH": {
            "Branch": "Biotechnology",
            "Specialization": "Applied Research",
            "CGPA": 8.4,
            "Primary_Skill": "R",
            "Secondary_Skill": "Bioinformatics",
            "Programming_Languages": "R, Python",
            "Technical_Proficiency": "Advanced",
            "Interest_Area": "Biotechnology & Genomics"
        },
        "CIVIL": {
            "Branch": "Civil Engineering",
            "Specialization": "Structural Engineering",
            "CGPA": 7.9,
            "Primary_Skill": "AutoCAD",
            "Secondary_Skill": "STAAD.Pro",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Intermediate",
            "Interest_Area": "Civil Infrastructure"
        }
    }

    top_recommendations = {}
    for p_name, profile in profiles.items():
        res = rank_careers_v8(profile, top_n=3)
        assert res["status"] == "success"
        assert len(res["top_recommendations"]) == 3
        top_rec = res["top_recommendations"][0]["career_title"]
        top_recommendations[p_name] = top_rec

    # Ensure recommendations are distinct across distinct disciplines
    unique_top = set(top_recommendations.values())
    assert len(unique_top) >= 4, f"Recommendations must be diverse across profiles, got: {top_recommendations}"

    # Verify domain alignment
    assert "Machine Learning" in top_recommendations["CSE_AI"] or "AI" in top_recommendations["CSE_AI"]
    assert "Mechanical" in top_recommendations["MECH_CAD"] or "Automotive" in top_recommendations["MECH_CAD"]
    assert any(term in top_recommendations["ECE_VLSI"] for term in ("Embedded", "VLSI", "Electronics"))
    assert "Bio" in top_recommendations["BIOTECH"] or "Research" in top_recommendations["BIOTECH"]
    assert "Civil" in top_recommendations["CIVIL"] or "Structural" in top_recommendations["CIVIL"]


def test_missing_and_unknown_inputs():
    """Verifies that empty profiles and unknown skills are handled gracefully without exceptions."""
    # 1. Empty profile
    empty_res = rank_careers_v8({}, top_n=3)
    assert empty_res["status"] == "success"
    assert len(empty_res["top_recommendations"]) == 3
    assert empty_res["recommendation"] is not None

    # 2. Unknown skills and branches
    unknown_profile = {
        "Branch": "Cosmological Exploration",
        "Primary_Skill": "Quantum Levitation",
        "Secondary_Skill": "Telekinesis",
        "Programming_Languages": "Brainfuck",
        "Interest_Area": "Intergalactic Commerce"
    }
    unknown_res = rank_careers_v8(unknown_profile, top_n=3)
    assert unknown_res["status"] == "success"
    assert len(unknown_res["top_recommendations"]) == 3
    assert 0.0 <= unknown_res["top_recommendations"][0]["compatibility_score"] <= 100.0


def test_api_endpoint_backward_compatibility():
    """Verifies API endpoints maintain backward compatibility for both V8 and V3 callers."""
    test_payload = {
        "Branch": "Computer Science and Engineering",
        "Primary_Skill": "Python",
        "Programming_Languages": "Python, SQL",
        "CGPA": 8.5
    }

    # Default call (V8)
    res_v8 = recommend_career(test_payload)
    assert "recommendation" in res_v8
    assert "confidence" in res_v8
    assert "alternatives" in res_v8
    assert res_v8.get("engine") == "v8"
    assert len(res_v8.get("top_recommendations", [])) > 0

    # Dedicated V8 route
    res_v8_direct = recommend_career_v8(test_payload)
    assert res_v8_direct["recommendation"] == res_v8["recommendation"]

    # Explicit V3 call
    v3_payload = test_payload.copy()
    v3_payload["engine"] = "v3"
    res_v3 = recommend_career(v3_payload)
    assert "recommendation" in res_v3
    assert "confidence" in res_v3


if __name__ == "__main__":
    print("Running Career Compass V8 Test Suite...")
    test_v8_model_loading()
    print("✓ test_v8_model_loading PASSED")
    test_knowledge_base_coverage()
    print("✓ test_knowledge_base_coverage PASSED")
    test_scorer_weights_and_normalization()
    print("✓ test_scorer_weights_and_normalization PASSED")
    test_multi_profile_diversity()
    print("✓ test_multi_profile_diversity PASSED")
    test_missing_and_unknown_inputs()
    print("✓ test_missing_and_unknown_inputs PASSED")
    test_api_endpoint_backward_compatibility()
    print("✓ test_api_endpoint_backward_compatibility PASSED")
    print("\nALL 6 TEST MODULES PASSED SUCCESSFULLY!")
