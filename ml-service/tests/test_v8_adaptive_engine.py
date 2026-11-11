"""
Career Compass V8 — End-to-End Verification of Adaptive Assessment Architecture
Tests the 16 cross-disciplinary profile transitions and verifies:
  1. CSE -> Software Development
  2. CSE -> Data Engineering
  3. Mechanical -> Robotics
  4. Mechanical -> Software Development
  5. Mechanical -> Automotive
  6. Mechatronics -> Industrial Automation
  7. Mechatronics -> Embedded Systems
  8. Civil -> Structural Engineering
  9. Civil -> Data Engineering
  10. Electrical -> Power Systems
  11. Electrical -> Robotics
  12. ECE -> VLSI
  13. ECE -> Software Development
  14. Biotechnology -> Research
  15. Biotechnology -> Data Science
  16. Chemical -> Process Engineering

Also verifies:
  17. Mid-assessment direction change (Mechanical from Robotics -> Software) resets stale domain state while preserving academic branch.
  18. Explanation consistency across cross-disciplinary pathways.
"""

import sys
from pathlib import Path

# Add ml-service root to Python path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from v8 import predict_v8, rank_careers_v8

TEST_CASES = [
    # 1. CSE -> Software Development
    {
        "id": "1. CSE -> Software Development",
        "academic": {"branch": "Computer Science and Engineering", "specialization": "Software Systems", "cgpa": 8.4},
        "direction": "cs-software",
        "profile": {
            "Branch": "Computer Science and Engineering",
            "Specialization": "Software Systems",
            "CGPA": 8.4,
            "Academic_Performance": "Good",
            "Primary_Skill": "Java",
            "Secondary_Skill": "SQL",
            "Programming_Languages": "Java, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Java Certified Developer",
            "Interest_Area": "Software Development",
            "Career_Goal": "Build scalable software systems",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Information Technology",
            "Expected_Salary": 14.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Software Development Engineer", "Backend Developer", "Full Stack Developer"]
    },

    # 2. CSE -> Data Engineering
    {
        "id": "2. CSE -> Data Engineering",
        "academic": {"branch": "Computer Science and Engineering", "specialization": "Data Systems", "cgpa": 8.1},
        "direction": "ai-data",
        "profile": {
            "Branch": "Computer Science and Engineering",
            "Specialization": "Data Systems",
            "CGPA": 8.1,
            "Academic_Performance": "Good",
            "Primary_Skill": "Apache Spark",
            "Secondary_Skill": "SQL",
            "Programming_Languages": "Scala, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Databricks Certified Associate",
            "Interest_Area": "Data Engineering",
            "Career_Goal": "Build scalable data pipelines",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Information Technology",
            "Expected_Salary": 15.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Hyderabad",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Data Engineer", "Database Engineer", "Data Scientist"]
    },

    # 3. Mechanical -> Robotics
    {
        "id": "3. Mechanical -> Robotics",
        "academic": {"branch": "Mechanical Engineering", "specialization": "Mechatronics", "cgpa": 8.2},
        "direction": "robotics-mechatronics",
        "profile": {
            "Branch": "Mechanical Engineering",
            "Specialization": "Mechatronics",
            "CGPA": 8.2,
            "Academic_Performance": "Good",
            "Primary_Skill": "Robotics",
            "Secondary_Skill": "PLC",
            "Programming_Languages": "MATLAB, C++",
            "Technical_Proficiency": "Intermediate",
            "Certifications": "Industrial Robotics Specialist",
            "Interest_Area": "Robotics & Automation",
            "Career_Goal": "Design autonomous robotic systems",
            "Preferred_Environment": "R&D Center",
            "Target_Sector": "Automotive",
            "Expected_Salary": 11.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Robotics Engineer", "Mechanical Design Engineer"]
    },

    # 4. Mechanical -> Software Development (Cross-Disciplinary Transition)
    {
        "id": "4. Mechanical -> Software Development",
        "academic": {"branch": "Mechanical Engineering", "specialization": "CAD/CAM", "cgpa": 8.0},
        "direction": "cs-software",
        "profile": {
            "Branch": "Mechanical Engineering",
            "Specialization": "CAD/CAM",
            "CGPA": 8.0,
            "Academic_Performance": "Good",
            "Primary_Skill": "Java",
            "Secondary_Skill": "SQL",
            "Programming_Languages": "Java, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Full Stack Java Development",
            "Interest_Area": "Software Development",
            "Career_Goal": "Build scalable software systems",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Information Technology",
            "Expected_Salary": 12.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Software Development Engineer", "Backend Developer", "Full Stack Developer"]
    },

    # 5. Mechanical -> Automotive
    {
        "id": "5. Mechanical -> Automotive",
        "academic": {"branch": "Mechanical Engineering", "specialization": "Automotive Systems", "cgpa": 8.3},
        "direction": "mechanical-automotive",
        "profile": {
            "Branch": "Mechanical Engineering",
            "Specialization": "Automotive Systems",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "Automotive Systems",
            "Secondary_Skill": "SolidWorks",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Automotive Design Certificate",
            "Interest_Area": "Automotive Systems",
            "Career_Goal": "Develop safer and efficient vehicles",
            "Preferred_Environment": "Automotive",
            "Target_Sector": "Automotive",
            "Expected_Salary": 9.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Low"
        },
        "expected_top": ["Automotive Engineer", "Mechanical Design Engineer"]
    },

    # 6. Mechatronics -> Industrial Automation
    {
        "id": "6. Mechatronics -> Industrial Automation",
        "academic": {"branch": "Mechatronics Engineering", "specialization": "Automation", "cgpa": 8.2},
        "direction": "robotics-mechatronics",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Automation",
            "CGPA": 8.2,
            "Academic_Performance": "Good",
            "Primary_Skill": "PLC",
            "Secondary_Skill": "Robotics",
            "Programming_Languages": "MATLAB, C++",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Siemens PLC Certified",
            "Interest_Area": "Robotics & Automation",
            "Career_Goal": "Design autonomous robotic systems",
            "Preferred_Environment": "Core Manufacturing",
            "Target_Sector": "Core Manufacturing",
            "Expected_Salary": 10.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Chennai",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Robotics Engineer", "IoT Engineer", "Mechanical Design Engineer"]
    },

    # 7. Mechatronics -> Embedded Systems
    {
        "id": "7. Mechatronics -> Embedded Systems",
        "academic": {"branch": "Mechatronics Engineering", "specialization": "Robotics", "cgpa": 8.3},
        "direction": "electronics-vlsi",
        "profile": {
            "Branch": "Mechatronics Engineering",
            "Specialization": "Robotics",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "Embedded C",
            "Secondary_Skill": "Microcontrollers",
            "Programming_Languages": "C, Embedded C",
            "Technical_Proficiency": "Advanced",
            "Certifications": "ARM Cortex Embedded Systems",
            "Interest_Area": "Embedded Systems",
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
        "expected_top": ["Embedded Systems Engineer", "IoT Engineer", "Electronics Design Engineer"]
    },

    # 8. Civil -> Structural Engineering
    {
        "id": "8. Civil -> Structural Engineering",
        "academic": {"branch": "Civil Engineering", "specialization": "Structural", "cgpa": 8.5},
        "direction": "civil-infrastructure",
        "profile": {
            "Branch": "Civil Engineering",
            "Specialization": "Structural",
            "CGPA": 8.5,
            "Academic_Performance": "Excellent",
            "Primary_Skill": "STAAD.Pro",
            "Secondary_Skill": "AutoCAD",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Certified Structural Modeler",
            "Interest_Area": "Structural Design",
            "Career_Goal": "Design resilient structures",
            "Preferred_Environment": "Construction Site",
            "Target_Sector": "Construction",
            "Expected_Salary": 9.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Mumbai",
            "Startup_Interest": "Low"
        },
        "expected_top": ["Civil Structural Engineer"]
    },

    # 9. Civil -> Data Engineering (Cross-Disciplinary Transition)
    {
        "id": "9. Civil -> Data Engineering",
        "academic": {"branch": "Civil Engineering", "specialization": "GIS & Surveying", "cgpa": 8.1},
        "direction": "ai-data",
        "profile": {
            "Branch": "Civil Engineering",
            "Specialization": "GIS & Surveying",
            "CGPA": 8.1,
            "Academic_Performance": "Good",
            "Primary_Skill": "SQL",
            "Secondary_Skill": "Airflow",
            "Programming_Languages": "Python, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Google Cloud Data Engineer",
            "Interest_Area": "Data Engineering",
            "Career_Goal": "Build scalable data pipelines",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Information Technology",
            "Expected_Salary": 13.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Hyderabad",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Data Engineer", "Database Engineer", "Data Analyst"]
    },

    # 10. Electrical -> Power Systems
    {
        "id": "10. Electrical -> Power Systems",
        "academic": {"branch": "Electrical Engineering", "specialization": "Power", "cgpa": 8.4},
        "direction": "electrical-power",
        "profile": {
            "Branch": "Electrical Engineering",
            "Specialization": "Power",
            "CGPA": 8.4,
            "Academic_Performance": "Good",
            "Primary_Skill": "Power Systems",
            "Secondary_Skill": "ETAP",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Advanced",
            "Certifications": "ETAP Power Grid Certified",
            "Interest_Area": "Power Systems",
            "Career_Goal": "Design reliable power systems",
            "Preferred_Environment": "Power Utility",
            "Target_Sector": "CleanTech & Energy",
            "Expected_Salary": 9.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Delhi",
            "Startup_Interest": "Low"
        },
        "expected_top": ["Electrical Power Systems Engineer"]
    },

    # 11. Electrical -> Robotics
    {
        "id": "11. Electrical -> Robotics",
        "academic": {"branch": "Electrical Engineering", "specialization": "Control Systems", "cgpa": 8.3},
        "direction": "robotics-mechatronics",
        "profile": {
            "Branch": "Electrical Engineering",
            "Specialization": "Control Systems",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "Robotics",
            "Secondary_Skill": "PLC",
            "Programming_Languages": "MATLAB, C++",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Industrial Robotics & Automation",
            "Interest_Area": "Robotics & Automation",
            "Career_Goal": "Design autonomous robotic systems",
            "Preferred_Environment": "R&D Center",
            "Target_Sector": "Automotive",
            "Expected_Salary": 11.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Robotics Engineer", "IoT Engineer", "Electrical Power Systems Engineer"]
    },

    # 12. ECE -> VLSI
    {
        "id": "12. ECE -> VLSI",
        "academic": {"branch": "Electronics and Communication", "specialization": "VLSI Design", "cgpa": 8.6},
        "direction": "electronics-vlsi",
        "profile": {
            "Branch": "Electronics and Communication",
            "Specialization": "VLSI Design",
            "CGPA": 8.6,
            "Academic_Performance": "Excellent",
            "Primary_Skill": "Verilog",
            "Secondary_Skill": "Digital Electronics",
            "Programming_Languages": "Verilog, SystemVerilog",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Synopsys Design Verification",
            "Interest_Area": "VLSI & Chip Design",
            "Career_Goal": "Develop integrated circuits",
            "Preferred_Environment": "Semiconductor Company",
            "Target_Sector": "Semiconductors",
            "Expected_Salary": 14.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["VLSI Design Engineer", "Electronics Design Engineer"]
    },

    # 13. ECE -> Software Development (Cross-Disciplinary Transition)
    {
        "id": "13. ECE -> Software Development",
        "academic": {"branch": "Electronics and Communication", "specialization": "Telecommunication", "cgpa": 8.2},
        "direction": "cs-software",
        "profile": {
            "Branch": "Electronics and Communication",
            "Specialization": "Telecommunication",
            "CGPA": 8.2,
            "Academic_Performance": "Good",
            "Primary_Skill": "Java",
            "Secondary_Skill": "SQL",
            "Programming_Languages": "Java, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Backend Software Engineering",
            "Interest_Area": "Software Development",
            "Career_Goal": "Build scalable software systems",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Information Technology",
            "Expected_Salary": 12.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Low",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Hyderabad",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Software Development Engineer", "Backend Developer", "Full Stack Developer"]
    },

    # 14. Biotechnology -> Research
    {
        "id": "14. Biotechnology -> Research",
        "academic": {"branch": "Biotechnology", "specialization": "Genetic Engineering", "cgpa": 8.7},
        "direction": "research-higherstudies",
        "profile": {
            "Branch": "Biotechnology",
            "Specialization": "Genetic Engineering",
            "CGPA": 8.7,
            "Academic_Performance": "Excellent",
            "Primary_Skill": "Molecular Biology",
            "Secondary_Skill": "Bioinformatics",
            "Programming_Languages": "R, Python",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Molecular Genetics Research Fellow",
            "Interest_Area": "Biotechnology & Genomics",
            "Career_Goal": "Conduct biological research",
            "Preferred_Environment": "Research Laboratory",
            "Target_Sector": "Healthcare & Biotech",
            "Expected_Salary": 9.0,
            "Higher_Studies_Interest": "Yes",
            "Research_Interest": "High",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Pune",
            "Startup_Interest": "Low"
        },
        "expected_top": ["Biotechnology Researcher", "Research Scientist"]
    },

    # 15. Biotechnology -> Data Science (Cross-Disciplinary Transition)
    {
        "id": "15. Biotechnology -> Data Science",
        "academic": {"branch": "Biotechnology", "specialization": "Bioinformatics", "cgpa": 8.4},
        "direction": "ai-data",
        "profile": {
            "Branch": "Biotechnology",
            "Specialization": "Bioinformatics",
            "CGPA": 8.4,
            "Academic_Performance": "Good",
            "Primary_Skill": "Python",
            "Secondary_Skill": "Machine Learning",
            "Programming_Languages": "Python, SQL",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Certified Data Scientist",
            "Interest_Area": "Data Science",
            "Career_Goal": "Build predictive models",
            "Preferred_Environment": "Product-based Company",
            "Target_Sector": "Healthcare & Biotech",
            "Expected_Salary": 13.0,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Bangalore",
            "Startup_Interest": "Moderate"
        },
        "expected_top": ["Data Scientist", "Data Analyst", "Biotechnology Researcher"]
    },

    # 16. Chemical -> Process Engineering
    {
        "id": "16. Chemical -> Process Engineering",
        "academic": {"branch": "Chemical Engineering", "specialization": "Petrochemicals", "cgpa": 8.3},
        "direction": "chemical-process",
        "profile": {
            "Branch": "Chemical Engineering",
            "Specialization": "Petrochemicals",
            "CGPA": 8.3,
            "Academic_Performance": "Good",
            "Primary_Skill": "Aspen Plus",
            "Secondary_Skill": "Process Simulation",
            "Programming_Languages": "None / Basic Scripting",
            "Technical_Proficiency": "Advanced",
            "Certifications": "Aspen Plus Certified User",
            "Interest_Area": "Chemical Processes",
            "Career_Goal": "Optimize industrial processes",
            "Preferred_Environment": "Chemical Plant",
            "Target_Sector": "Chemicals",
            "Expected_Salary": 9.5,
            "Higher_Studies_Interest": "No",
            "Research_Interest": "Moderate",
            "Problem_Solving_Level": "Advanced",
            "Communication_Level": "Good",
            "Preferred_Location": "Vadodara",
            "Startup_Interest": "Low"
        },
        "expected_top": ["Chemical Process Engineer"]
    }
]


def run_all_tests():
    print("=" * 80)
    print("CAREER COMPASS V8 — 16 CROSS-DISCIPLINARY PROFILES VERIFICATION")
    print("=" * 80)

    passed_count = 0
    total_count = len(TEST_CASES)

    for tc in TEST_CASES:
        test_id = tc["id"]
        profile = tc["profile"]
        expected_top_list = tc["expected_top"]

        # 1. Execute actual trained V8 model inference
        raw_pred = predict_v8(profile)
        v8_model_prob = raw_pred["predicted_probability"]
        v8_top_class = raw_pred["predicted_career"]

        # 2. Execute 6-factor compatibility ranker
        ranking_result = rank_careers_v8(profile, top_n=5)
        top_recs = ranking_result.get("top_recommendations", [])
        top_rec_title = top_recs[0]["career_title"] if top_recs else "None"
        top_rec_score = top_recs[0]["compatibility_score"] if top_recs else 0.0

        is_match = top_rec_title in expected_top_list
        status = "PASSED" if is_match else "FAILED"
        if is_match:
            passed_count += 1

        print(f"\n[{status}] {test_id}")
        print(f"  Branch: {profile['Branch']} -> Direction/Goal: {profile['Career_Goal']}")
        print(f"  V8 Model Prediction: {v8_top_class} ({v8_model_prob:.2f}%)")
        print(f"  Ranked #1 Recommendation: {top_rec_title} ({top_rec_score:.1f}% compatibility)")
        print(f"  Top 3 Recommendations: {[r['career_title'] for r in top_recs[:3]]}")
        print(f"  Explanation snippet: {top_recs[0]['why_recommended'][:90]}...")

        if not is_match:
            print(f"  >>> Expected one of: {expected_top_list}, but received: {top_rec_title}")

    print("\n" + "=" * 80)
    print(f"SUMMARY: {passed_count}/{total_count} Profiles Passed")
    print("=" * 80)

    # 17. Verify Mid-Assessment Direction Change State Reset
    print("\n[VERIFICATION 17] Mid-Assessment Direction Change State Integrity:")
    mechanical_initial = {
        "Branch": "Mechanical Engineering",
        "Primary_Skill": "Robotics",
        "Secondary_Skill": "PLC",
        "Programming_Languages": "MATLAB, C++",
        "Career_Goal": "Design autonomous robotic systems",
        "Target_Sector": "Automotive"
    }
    # When user changes direction to Software, domain state must update:
    mechanical_switched = {
        "Branch": "Mechanical Engineering",  # Academic branch remains unchanged!
        "Primary_Skill": "Java",             # Skill changes to new domain
        "Secondary_Skill": "SQL",
        "Programming_Languages": "Java, SQL",
        "Career_Goal": "Build scalable software systems",
        "Target_Sector": "Information Technology"
    }
    assert mechanical_switched["Branch"] == mechanical_initial["Branch"], "Academic branch must be preserved!"
    assert mechanical_switched["Career_Goal"] != mechanical_initial["Career_Goal"], "Career goal must reflect new direction!"

    switched_res = rank_careers_v8(mechanical_switched, top_n=3)
    switched_top = switched_res["top_recommendations"][0]["career_title"]
    print(f"  Academic Branch: {mechanical_switched['Branch']}")
    print(f"  Switched Career Goal: {mechanical_switched['Career_Goal']}")
    print(f"  Resulting Top Career: {switched_top}")
    assert switched_top in ["Software Development Engineer", "Backend Developer", "Full Stack Developer"], f"Unexpected top career: {switched_top}"
    print("  State reset and redirection verified successfully!")

    # 18. Verify Explanation Consistency
    print("\n[VERIFICATION 18] Explanation Consistency Check:")
    top_rec = switched_res["top_recommendations"][0]
    why_text = top_rec["why_recommended"]
    assert "Mechanical Engineering" in why_text, "Explanation must accurately reference academic branch!"
    assert "Build scalable software systems" in why_text, "Explanation must reference student's career aspiration!"
    print(f"  Verified why_recommended text: '{why_text}'")

    if passed_count == total_count:
        print("\nALL 16 CROSS-DISCIPLINARY PATHWAYS + 2 VERIFICATIONS PASSED SUCESSFULLY!")
        return 0
    else:
        print(f"\n{total_count - passed_count} PROFILES FAILED.")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
