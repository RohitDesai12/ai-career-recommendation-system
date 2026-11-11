"""
Career Compass — End-to-End V8 Recommendation Scoring Verification Script
Logs:
1. Assessment ID
2. Exact 20-feature input profile
3. Raw V8 prediction probabilities (top classes and target class)
4. All six factor scores
5. Effective weights after normalization
6. Individual weighted contributions
7. Final compatibility score
Verifies:
Final compatibility score == round(sum(weighted_contributions.values()), 2)
"""

import sys
import json
from pathlib import Path

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from main import recommend_career_v8, app
from v8 import predict_v8


def run_verification():
    print("=" * 80)
    print("CAREER COMPASS V8 — SIX-FACTOR COMPATIBILITY SCORING VERIFICATION")
    print("=" * 80)

    # 1. Assessment ID
    assessment_id = "asmt_test_verification_2026_01"

    # 2. Exact 20-Feature Student Input Profile
    student_profile = {
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

    payload = {
        "assessment_id": assessment_id,
        "profile": student_profile,
        "top_n": 5
    }

    # 3. Raw V8 ML Model Prediction Probabilities
    raw_v8 = predict_v8(student_profile)
    raw_probs = raw_v8["class_probabilities"]

    # Execute actual recommendation via endpoint
    response = recommend_career_v8(payload)
    primary = response["primary_career"]
    top_career = primary["career_title"]

    component_scores = primary["component_scores"]
    active_weights = primary["active_weights"]
    weighted_contributions = primary["weighted_contributions"]
    final_score = primary["compatibility_score"]

    print(f"\n1. ASSESSMENT ID: {response.get('assessment_id')}")

    print("\n2. EXACT 20-FEATURE INPUT PROFILE:")
    for idx, (k, v) in enumerate(student_profile.items(), 1):
        print(f"   {idx:2d}. {k:25}: {v}")

    print("\n3. RAW V8 PREDICTION PROBABILITIES (Top 5 Classes):")
    sorted_probs = sorted(raw_probs.items(), key=lambda x: x[1], reverse=True)[:5]
    for c, p in sorted_probs:
        marker = " (Top Recommendation)" if c == top_career else ""
        print(f"   - {c:32}: {p:8.4f}%{marker}")
    print(f"   Raw Model Probability for '{top_career}': {raw_probs.get(top_career, 0.0):.4f}%")

    print(f"\n4. ALL SIX FACTOR SCORES (Out of 100) for '{top_career}':")
    factor_names = [
        ("ml_prediction", "ML Model Prediction", 0.15),
        ("technical_skills", "Technical Skill Alignment", 0.30),
        ("interest", "Domain Interest Alignment", 0.25),
        ("academic", "Academic Background Alignment", 0.10),
        ("career_preference", "Career Goals & Preference Fit", 0.15),
        ("career_readiness", "Execution & Problem-Solving Readiness", 0.05)
    ]
    for key, label, _ in factor_names:
        print(f"   - {label:40} ({key:18}): {component_scores[key]:8.4f}%")

    print(f"\n5. EFFECTIVE WEIGHTS AFTER NORMALIZATION (Sum = 1.0000):")
    for key, label, default_w in factor_names:
        print(f"   - {label:40} ({key:18}): {active_weights[key]:.4f} (Base weight: {default_w:.2f})")
    total_weights = sum(active_weights.values())
    print(f"   Total Normalized Weight Sum: {total_weights:.4f}")
    assert abs(total_weights - 1.0) < 1e-4, "Normalized weights must sum to 1.0000!"

    print(f"\n6. INDIVIDUAL WEIGHTED CONTRIBUTIONS:")
    for key, label, _ in factor_names:
        raw_val = component_scores[key]
        eff_w = active_weights[key]
        cont = weighted_contributions[key]
        print(f"   - {label:40}: {raw_val:8.4f}% * {eff_w:.4f} = {cont:7.4f}%")

    calculated_sum = sum(weighted_contributions.values())
    rounded_sum = round(calculated_sum, 2)
    print(f"\n   Sum of Weighted Contributions: {calculated_sum:.4f}%")
    print(f"   Rounded Sum (to 2 decimal places): {rounded_sum:.2f}%")

    print(f"\n7. FINAL COMPATIBILITY SCORE:")
    print(f"   Reported Final Compatibility Score: {final_score:.2f}%")

    # Verification Assertion
    print("\n" + "-" * 80)
    print("VERIFICATION CHECK:")
    print(f"   Calculated Sum ({rounded_sum:.2f}%) == Reported Score ({final_score:.2f}%)")
    assert rounded_sum == final_score, (
        f"Mismatch: sum of weighted contributions ({rounded_sum}) does not match final compatibility score ({final_score})"
    )
    print("   [PASSED] Final compatibility score EXACTLY EQUALS the sum of weighted contributions!")
    print("-" * 80)


if __name__ == "__main__":
    run_verification()

