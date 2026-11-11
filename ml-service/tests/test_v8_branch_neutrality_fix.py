"""
Career Compass V8 — Verification & Regression Suite for Universal Branch Neutrality Fix
Tests the 10 critical profiles across engineering disciplines and verifies:
  1. Mechatronics student interested in Robotics & Automation -> #1 Robotics Engineer
  2. Mechatronics student interested in Mechanical Design -> #1 Mechanical Design Engineer
  3. Mechatronics student interested in Embedded Systems -> #1 Embedded Systems Engineer
  4. Mechatronics student interested in AI & Robotics -> #1 AI / Vision / Robotics pathways
  5. Mechatronics student interested in Software Development -> #1 Software Development Engineer
  6. Mechanical student interested in Automotive -> #1 Automotive Engineer
  7. Civil student interested in Structural -> #1 Civil Structural Engineer
  8. Electrical student interested in Power Systems -> #1 Electrical Power Systems Engineer
  9. ECE student interested in VLSI & Embedded -> #1 VLSI / Embedded Systems Engineer
  10. Biotechnology student interested in Research -> #1 Biotechnology Researcher / Research Scientist
"""

import os
import sys
from pathlib import Path

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from v8 import predict_v8, rank_careers_v8

TEST_PROFILES = [
    {
        "id": "1. Mechatronics Robotics & Automation",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Robotics and Automation",
            "CGPA": 8.2,
            "Academic_Performance": "Good",
            "Primary_Skill": "Robotics",
            "Secondary_Skill": "Automation",
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
            "Startup_Interest": "Moderate"
        },
        "expected_top": "Robotics Engineer"
    },
    {
        "id": "2. Mechatronics Mechanical Design",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Mechanical Design",
            "CGPA": 8.0,
            "Academic_Performance": "Good",
            "Primary_Skill": "SolidWorks",
            "Secondary_Skill": "CATIA",
            "Programming_Languages": "MATLAB, Python",
            "Technical_Proficiency": "Intermediate",
            "Certifications": "CAD certification",
            "Interest_Area": "Mechanical Design and Manufacturing",
            "Career_Goal": "Design precision mechanical and robotic assemblies",
            "Preferred_Environment": "Core Manufacturing",
            "Target_Sector": "Core Manufacturing",
            "Expected_Salary": 8.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Intermediate",
            "Communication_Level": "Average",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Moderate"
        },
        "expected_top": "Mechanical Design Engineer"
    },
    {
        "id": "3. Mechatronics Embedded Systems",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Embedded Systems",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "Embedded C",
            "Secondary_Skill": "Microcontrollers",
            "Programming_Languages": "C, Embedded C",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Embedded systems certification",
            "Interest_Area": "Embedded Systems and IoT",
            "Career_Goal": "Build high-reliability microcontroller firmware",
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
        "expected_top": "Embedded Systems Engineer"
    },
    {
        "id": "4. Mechatronics AI & Robotics",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Artificial Intelligence",
            "CGPA": 8.6,
            "Academic_Performance": "Excellent",
            "Primary_Skill": "Python",
            "Secondary_Skill": "ROS",
            "Programming_Languages": "Python, C++",
            "Technical_Proficiency": "Advanced",
            "Certifications": "AI certification",
            "Interest_Area": "Artificial Intelligence and Machine Learning",
            "Career_Goal": "Develop AI perception and autonomous robotics",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Automotive",
            "Expected_Salary": 14.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "High"
        },
        "expected_one_of": ["Computer Vision Engineer", "Robotics Engineer", "Machine Learning Engineer", "IoT Engineer"]
    },
    {
        "id": "5. Mechatronics Software Development",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Software Systems",
            "CGPA": 8.5,
            "Academic_Performance": "Good",
            "Primary_Skill": "Java",
            "Secondary_Skill": "Data Structures",
            "Programming_Languages": "Java, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Java certification",
            "Interest_Area": "Software and Application Development",
            "Career_Goal": "Build high-throughput scalable web services",
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
        "expected_top": "Software Development Engineer"
    },
    {
        "id": "6. Mechanical Automotive",
        "profile": {
            "Branch": "Mechanical Engineering",
            "Specialization": "Automotive Systems",
            "CGPA": 8.1,
            "Academic_Performance": "Good",
            "Primary_Skill": "Automotive Dynamics",
            "Secondary_Skill": "CATIA",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Intermediate",
            "Certifications": "Automotive design certification",
            "Interest_Area": "Automotive Technology",
            "Career_Goal": "Design high-efficiency automotive powertrain systems",
            "Preferred_Environment": "Automotive",
            "Target_Sector": "Automotive",
            "Expected_Salary": 9.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Intermediate",
            "Communication_Level": "Good",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Moderate"
        },
        "expected_top": "Automotive Engineer"
    },
    {
        "id": "7. Civil Structural",
        "profile": {
            "Branch": "Civil Engineering",
            "Specialization": "Structural Engineering",
            "CGPA": 8.2,
            "Academic_Performance": "Good",
            "Primary_Skill": "STAAD.Pro",
            "Secondary_Skill": "AutoCAD",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Intermediate",
            "Certifications": "Structural design certification",
            "Interest_Area": "Construction and Structural Design",
            "Career_Goal": "Design seismic-resilient commercial infrastructure",
            "Preferred_Environment": "Construction Site",
            "Target_Sector": "Construction",
            "Expected_Salary": 8.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Intermediate",
            "Communication_Level": "Good",
            "Preferred_Location": "Mumbai",
            "Startup_Interest": "Low"
        },
        "expected_top": "Civil Structural Engineer"
    },
    {
        "id": "8. Electrical Power Systems",
        "profile": {
            "Branch": "Electrical Engineering",
            "Specialization": "Power Systems",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "PLC",
            "Secondary_Skill": "Power Systems",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Intermediate",
            "Certifications": "Power Systems certification",
            "Interest_Area": "Electrical Systems and Power Engineering",
            "Career_Goal": "Design resilient electrical distribution networks",
            "Preferred_Environment": "Power Utility",
            "Target_Sector": "CleanTech & Energy",
            "Expected_Salary": 8.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Intermediate",
            "Communication_Level": "Good",
            "Preferred_Location": "Delhi NCR",
            "Startup_Interest": "Low"
        },
        "expected_top": "Electrical Power Systems Engineer"
    },
    {
        "id": "9. ECE VLSI & Embedded",
        "profile": {
            "Branch": "Electronics and Communication",
            "Specialization": "VLSI Design",
            "CGPA": 8.5,
            "Academic_Performance": "Good",
            "Primary_Skill": "Verilog",
            "Secondary_Skill": "SystemVerilog",
            "Programming_Languages": "C, Embedded C",
            "Technical_Proficiency": "Advanced",
            "Certifications": "VLSI design certification",
            "Interest_Area": "Electronics and Circuit Design",
            "Career_Goal": "Design high-frequency silicon and microelectronics",
            "Preferred_Environment": "Electronics Laboratory",
            "Target_Sector": "Semiconductors",
            "Expected_Salary": 14.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "Moderate"
        },
        "expected_one_of": ["VLSI Design Engineer", "Embedded Systems Engineer", "Electronics Design Engineer"]
    },
    {
        "id": "10. Biotechnology Research",
        "profile": {
            "Branch": "Biotechnology",
            "Specialization": "Applied Research",
            "CGPA": 8.6,
            "Academic_Performance": "Excellent",
            "Primary_Skill": "Bioinformatics",
            "Secondary_Skill": "Molecular Biology",
            "Programming_Languages": "R, MATLAB",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Genomics certification",
            "Interest_Area": "Biotechnology and Biomedical Research",
            "Career_Goal": "Conduct applied pharmaceutical and bioinformatics research",
            "Preferred_Environment": "Research Laboratory",
            "Target_Sector": "Healthcare & Biotech",
            "Expected_Salary": 7.5,
            "Higher_Studies_Interest": "Yes",
            "Research_Interest": "High",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Excellent",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Moderate"
        },
        "expected_one_of": ["Biotechnology Researcher", "Research Scientist"]
    }
]


def run_verification():
    print("=" * 80)
    print("CAREER COMPASS V8 — BRANCH NEUTRALITY VERIFICATION SUITE")
    print("=" * 80)

    for item in TEST_PROFILES:
        name = item["id"]
        profile = item["profile"]

        # 1. Inspect V8 Model raw predictions
        v8_out = predict_v8(profile)
        top5_v8 = v8_out.get("sorted_predictions", [])[:5]

        # 2. Inspect Final Ranker recommendations
        rank_out = rank_careers_v8(profile, top_n=5)
        top_recs = rank_out.get("top_recommendations", [])

        print(f"\n>>> TEST: {name}")
        print(f"  Input: Branch='{profile['Branch']}', Skill='{profile['Primary_Skill']}', Interest='{profile['Interest_Area']}'")
        print("  V8 Raw Predictions:")
        for pred in top5_v8[:3]:
            print(f"    - {pred['career']}: {pred['model_score']}%")

        print("  Final Ranked Recommendations:")
        for r in top_recs[:3]:
            cs = r["component_scores"]
            print(f"    - #{r['rank']} {r['career_title']} (Compat: {r['compatibility_score']}%, V8 ML: {r['v8_model_score']}%)")
            print(f"        [Tech: {cs.get('technical_skills')}%, Interest: {cs.get('interest')}%, Acad: {cs.get('academic')}%, Pref: {cs.get('career_preference')}%, Readiness: {cs.get('career_readiness')}%]")

        # Verification assertion
        top_title = top_recs[0]["career_title"]
        if "expected_top" in item:
            assert top_title == item["expected_top"], f"FAILED {name}: Expected #1 {item['expected_top']}, got {top_title}"
            print(f"  ✓ PASSED: Matches expected top pathway ({item['expected_top']})")
        elif "expected_one_of" in item:
            assert top_title in item["expected_one_of"], f"FAILED {name}: Expected one of {item['expected_one_of']}, got {top_title}"
            print(f"  ✓ PASSED: Matches expected domain pathway ({top_title} in {item['expected_one_of']})")

    print("\n" + "=" * 80)
    print("ALL 10 ENGINEERING BRANCH PROFILES PASSED VERIFICATION WITH ACCURATE PATHWAYS!")
    print("=" * 80)


if __name__ == "__main__":
    run_verification()

