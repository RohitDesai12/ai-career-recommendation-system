"""
Career Compass — Resume Analyzer Branch Normalization & Document Validation Test Suite
Tests:
1. CSE versus Computer Science & Engineering normalization.
2. Mechanical Engineering branch normalization (Mechanical, Mech, ME).
3. Civil Engineering branch normalization (Civil, CE).
4. Same-branch strong matching (score >= 85, status: strong).
5. Genuine cross-domain partial matching (e.g. CS <-> ECE, Mech <-> Electrical).
6. Genuine cross-domain mismatch (e.g. CS <-> Civil).
7. Non-resume PDF rejection (syllabus, homework, lecture notes, invoices, exam papers, articles).
8. Genuine resume without experience (fresher resume accepted with full analysis).
9. Existing Resume Analyzer regression (end-to-end response schema and ATS scoring).
10. V8 recommendation engine regression (mathematical scoring consistency preserved).
"""

import os
import sys
import json
import tempfile
import asyncio
from pathlib import Path
from unittest.mock import patch

# Ensure ml-service root is in sys.path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from main import (
    normalize_branch,
    evaluate_branch_alignment,
    validate_document_is_resume,
    analyze_resume,
    recommend_career_v8
)

class TestUploadFile:
    def __init__(self, data: bytes, filename: str = "test.pdf"):
        self.data = data
        self.filename = filename

    async def read(self, size: int = -1) -> bytes:
        return self.data


def create_pdf_bytes_helper(text: str) -> bytes:
    """Creates a syntactically valid PDF binary with accurate xref offsets containing the specified text."""
    lines = text.replace("(", "").replace(")", "").replace("\r", "").split("\n")
    content_stream = "BT\n/F1 12 Tf\n14 TL\n50 700 Td\n"
    for line in lines:
        content_stream += f"({line} ) Tj T*\n"
    content_stream += "ET\n"
    stream_bytes = content_stream.encode("latin1")

    header = b"%PDF-1.4\n"
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
    obj4_header = b"4 0 obj\n<< /Length " + str(len(stream_bytes)).encode("ascii") + b" >>\nstream\n"
    obj4_footer = b"\nendstream\nendobj\n"
    obj4 = obj4_header + stream_bytes + obj4_footer
    obj5 = b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"

    offsets = []
    current_offset = len(header)
    for obj in [obj1, obj2, obj3, obj4, obj5]:
        offsets.append(current_offset)
        current_offset += len(obj)

    xref_offset = current_offset
    xref = b"xref\n0 6\n0000000000 65535 f \n"
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode("ascii")

    trailer = (
        b"trailer\n<< /Size 6 /Root 1 0 R >>\n"
        b"startxref\n" + str(xref_offset).encode("ascii") + b"\n%%EOF\n"
    )

    return header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer


def run_all_tests():
    print("=" * 80)
    print("CAREER COMPASS — RESUME ANALYZER BRANCH & DOCUMENT VALIDATION TEST SUITE")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # 1. CSE vs Computer Science & Engineering Normalization
    # --------------------------------------------------------------------------
    print("\n[TEST 1] Testing CSE versus Computer Science & Engineering Normalization...")
    norm_cse = normalize_branch("CSE")
    norm_cs_and_e = normalize_branch("Computer Science and Engineering")
    norm_cs_amp_e = normalize_branch("Computer Science & Engineering")
    norm_cs = normalize_branch("Computer Science")
    norm_btech_cse = normalize_branch("B.Tech CSE")

    print(f"  'CSE'                               -> '{norm_cse}'")
    print(f"  'Computer Science and Engineering'  -> '{norm_cs_and_e}'")
    print(f"  'Computer Science & Engineering'   -> '{norm_cs_amp_e}'")
    print(f"  'Computer Science'                  -> '{norm_cs}'")
    print(f"  'B.Tech CSE'                        -> '{norm_btech_cse}'")

    assert norm_cse == "Computer Science & Engineering"
    assert norm_cs_and_e == "Computer Science & Engineering"
    assert norm_cs_amp_e == "Computer Science & Engineering"
    assert norm_cs == "Computer Science & Engineering"
    assert norm_btech_cse == "Computer Science & Engineering"
    print("  ✓ CSE and Computer Science & Engineering successfully normalized to identical canonical branch.")

    # --------------------------------------------------------------------------
    # 2. Mechanical Engineering Branch Normalization
    # --------------------------------------------------------------------------
    print("\n[TEST 2] Testing Mechanical Engineering Branch Normalization...")
    norm_mech_full = normalize_branch("Mechanical Engineering")
    norm_mech_short = normalize_branch("Mechanical")
    norm_mech_tok = normalize_branch("Mech")
    norm_me_acronym = normalize_branch("ME")
    norm_auto = normalize_branch("Automotive Engineering")

    print(f"  'Mechanical Engineering'  -> '{norm_mech_full}'")
    print(f"  'Mechanical'              -> '{norm_mech_short}'")
    print(f"  'Mech'                    -> '{norm_mech_tok}'")
    print(f"  'ME'                      -> '{norm_me_acronym}'")
    print(f"  'Automotive Engineering'  -> '{norm_auto}'")

    assert norm_mech_full == "Mechanical Engineering"
    assert norm_mech_short == "Mechanical Engineering"
    assert norm_mech_tok == "Mechanical Engineering"
    assert norm_me_acronym == "Mechanical Engineering"
    assert norm_auto == "Mechanical Engineering"
    print("  ✓ Mechanical variations (Mechanical, Mech, ME, Automotive) normalize to Mechanical Engineering.")

    # --------------------------------------------------------------------------
    # 3. Civil Engineering Branch Normalization
    # --------------------------------------------------------------------------
    print("\n[TEST 3] Testing Civil Engineering Branch Normalization...")
    norm_civil_full = normalize_branch("Civil Engineering")
    norm_civil_short = normalize_branch("Civil")
    norm_ce_acronym = normalize_branch("CE")
    norm_const = normalize_branch("Construction Engineering")

    print(f"  'Civil Engineering'         -> '{norm_civil_full}'")
    print(f"  'Civil'                     -> '{norm_civil_short}'")
    print(f"  'CE'                        -> '{norm_ce_acronym}'")
    print(f"  'Construction Engineering'  -> '{norm_const}'")

    assert norm_civil_full == "Civil Engineering"
    assert norm_civil_short == "Civil Engineering"
    assert norm_ce_acronym == "Civil Engineering"
    assert norm_const == "Civil Engineering"
    print("  ✓ Civil variations (Civil, CE, Construction) normalize to Civil Engineering.")

    # --------------------------------------------------------------------------
    # 4. Same-Branch Strong Matching
    # --------------------------------------------------------------------------
    print("\n[TEST 4] Testing Same-Branch Strong Matching...")
    same_branch_pairs = [
        ("Computer Science and Engineering", "Computer Science & Engineering"),
        ("CSE", "Computer Science & Engineering"),
        ("Computer Science & Engineering", "Computer Science and Engineering"),
        ("Mechanical Engineering", "Mechanical"),
        ("Mech", "Mechanical Engineering"),
        ("ME", "Mechanical"),
        ("Civil Engineering", "Civil"),
        ("CE", "Civil Engineering"),
        ("Electrical Engineering", "Electrical & Electronics Engineering"),
        ("EEE", "Electrical & Electronics Engineering"),
        ("Electronics & Communication Engineering", "Electronics and Communication Engineering"),
        ("ECE", "Electronics & Communication Engineering")
    ]

    for sel, det in same_branch_pairs:
        res = evaluate_branch_alignment(sel, det)
        print(f"  Selected: '{sel}' | Detected: '{det}' -> status: {res['status']}, score: {res['score']}")
        assert res["status"] == "strong", f"Expected 'strong' status for {sel} vs {det}, got {res['status']}"
        assert res["score"] >= 85, f"Expected score >= 85 for {sel} vs {det}, got {res['score']}"
        assert sel.lower() in res["explanation"].lower() or "strongly aligns" in res["explanation"].lower()

    print("  ✓ All equivalent same-branch combinations produced 'strong' status with score >= 85.")

    # --------------------------------------------------------------------------
    # 5. Genuine Cross-Domain Partial Matching
    # --------------------------------------------------------------------------
    print("\n[TEST 5] Testing Genuine Cross-Domain Partial Matching...")
    partial_pairs = [
        ("Electronics & Communication Engineering", "Computer Science & Engineering"),
        ("Computer Science & Engineering", "Electronics & Communication Engineering"),
        ("Electrical & Electronics Engineering", "Computer Science & Engineering"),
        ("Mechanical Engineering", "Electrical & Electronics Engineering"),
        ("Mechanical Engineering", "Mechatronics Engineering"),
        ("Mechanical Engineering", "Aerospace Engineering")
    ]

    for sel, det in partial_pairs:
        res = evaluate_branch_alignment(sel, det)
        print(f"  Selected: '{sel}' | Detected: '{det}' -> status: {res['status']}, score: {res['score']}")
        assert res["status"] == "partial", f"Expected 'partial' for {sel} vs {det}, got {res['status']}"
        assert res["score"] == 60 or res["score"] == 65, f"Expected partial score ~60, got {res['score']}"
        assert "transferable skills" in res["explanation"].lower()

    print("  ✓ Cross-domain related disciplines produce 'partial' status and transferable skill notice.")

    # --------------------------------------------------------------------------
    # 6. Genuine Cross-Domain Mismatch
    # --------------------------------------------------------------------------
    print("\n[TEST 6] Testing Genuine Cross-Domain Mismatch...")
    mismatch_pairs = [
        ("Civil Engineering", "Computer Science & Engineering"),
        ("Computer Science and Engineering", "Civil Engineering"),
        ("Mechanical Engineering", "Computer Science & Engineering"),
        ("Chemical Engineering", "Computer Science & Engineering"),
        ("Civil Engineering", "Electronics & Communication Engineering")
    ]

    for sel, det in mismatch_pairs:
        res = evaluate_branch_alignment(sel, det)
        print(f"  Selected: '{sel}' | Detected: '{det}' -> status: {res['status']}, score: {res['score']}")
        assert res["status"] == "mismatch", f"Expected 'mismatch' for {sel} vs {det}, got {res['status']}"
        assert res["score"] <= 20, f"Expected score <= 20, got {res['score']}"
        assert "appears to target" in res["explanation"].lower()

    print("  ✓ Non-overlapping domains correctly flag genuine 'mismatch' (score <= 20).")

    # --------------------------------------------------------------------------
    # 7. Non-Resume PDF Rejection
    # --------------------------------------------------------------------------
    print("\n[TEST 7] Testing Non-Resume PDF Rejection...")
    non_resumes = {
        "Academic Syllabus": (
            "CS 301 Data Structures and Algorithms\n"
            "Course Syllabus - Fall 2026\n"
            "Instructor: Dr. Alan Turing | Office Hours: Tue/Thu 2-4 PM\n"
            "Course Code: CS301 | Credits: 4\n"
            "Course Objectives: Learn arrays, linked lists, trees, graphs.\n"
            "Learning Outcomes: Implement search and sorting algorithms.\n"
            "Grading Policy: Midterm 30%, Final 40%, Assignments 30%.\n"
            "Recommended Textbooks: Introduction to Algorithms by Cormen."
        ),
        "Homework Assignment": (
            "CS 229 Machine Learning Homework Assignment 2\n"
            "Due Date: October 20\n"
            "Problem 1: Derive the gradient of logistic loss function.\n"
            "Problem 2: Train a decision tree model on iris dataset.\n"
            "Submit your PDF report to the portal. Total points: 50."
        ),
        "Lecture Notes": (
            "Lecture 4: Introduction to Heat Transfer\n"
            "Class Notes - Mechanical Engineering Department\n"
            "Chapter 2: Conduction and Fourier's Law\n"
            "Unit 1: One-dimensional steady state conduction.\n"
            "Overview of chapter: Heat flux equation q = -k dT/dx.\n"
            "Table of Contents: 1. Conduction 2. Convection 3. Radiation."
        ),
        "Tax Invoice": (
            "Tax Invoice #INV-2026-8891\n"
            "Bill To: ABC Technologies Pvt Ltd\n"
            "Billing Address: 123 Tech Park, Bangalore\n"
            "Date: 12/03/2026 | Amount Due: $1,250.00\n"
            "Item: Cloud Hosting Services | Unit Price: $1,250.00 | Subtotal: $1,250.00\n"
            "Payment Terms: Due Upon Receipt.\n"
            "Terms and conditions apply."
        ),
        "Examination Paper": (
            "University Examination Paper - Dec 2026\n"
            "Course: B.Tech Civil Engineering\n"
            "Subject: Structural Analysis | Roll No: 123456\n"
            "Maximum Marks: 100 | Time Allowed: 3 Hours\n"
            "Duration: 3 hours | All questions carry equal marks.\n"
            "Section A: Answer all questions.\n"
            "1. Determine the deflection of a simply supported beam.\n"
            "2. Define influence line diagram."
        ),
        "Research Article": (
            "Deep Residual Learning for Image Recognition\n"
            "Abstract: We present a residual learning framework to ease the training of networks...\n"
            "1. Introduction\n"
            "2. Related Work and Literature Review\n"
            "3. Methodology and Deep Residual Blocks\n"
            "4. Experimental Results and Analysis\n"
            "5. Concluding Remarks\n"
            "References:\n"
            "[1] K. He et al., IEEE CVPR 2016. DOI: 10.1109/CVPR.2016.90."
        )
    }

    for doc_name, doc_text in non_resumes.items():
        # Test validator function directly
        v_res = validate_document_is_resume(doc_text)
        print(f"  Validating '{doc_name}': is_resume={v_res['is_resume']}, category={v_res.get('detected_category')}")
        assert v_res["is_resume"] is False, f"'{doc_name}' must NOT be treated as resume!"
        assert v_res["document_type"] == "not_resume"

        # Test through /api/analyze-resume endpoint
        pdf_bytes = create_pdf_bytes_helper(doc_text)
        upload_file = TestUploadFile(pdf_bytes, filename=f"{doc_name.lower().replace(' ', '_')}.pdf")

        with patch("main.GROQ_API_KEY", None), patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.side_effect = Exception("Offline test")
            endpoint_res = asyncio.run(analyze_resume(
                branch="Computer Science and Engineering",
                jobRole="Software Development Engineer",
                file=upload_file
            ))

        assert endpoint_res.get("document_type") == "not_resume", f"Endpoint must return not_resume for {doc_name}"
        assert "atsScore" not in endpoint_res, f"Endpoint must NOT return atsScore for {doc_name}"
        assert "shortlistChance" not in endpoint_res, f"Endpoint must NOT return shortlistChance for {doc_name}"
        assert endpoint_res.get("explanation"), f"Endpoint must provide clear explanation for {doc_name}"

    print("  ✓ All 6 non-resume document categories properly rejected with no ATS score generated.")

    # --------------------------------------------------------------------------
    # 8. Genuine Resume Without Work Experience (Fresher)
    # --------------------------------------------------------------------------
    print("\n[TEST 8] Testing Genuine Resume Without Work Experience (Fresher)...")
    fresher_text = (
        "Rahul Sharma\n"
        "Email: rahul.sharma@example.com | Phone: +91 9876543210\n"
        "LinkedIn: linkedin.com/in/rahulsharma | GitHub: github.com/rahulsharma\n\n"
        "SUMMARY\n"
        "Passionate Computer Science graduate seeking software development role.\n\n"
        "EDUCATION\n"
        "B.Tech in Computer Science and Engineering (2022 - 2026)\n"
        "XYZ Institute of Technology | CGPA: 8.7 / 10\n\n"
        "TECHNICAL SKILLS\n"
        "Programming Languages: Python, JavaScript, C++, SQL\n"
        "Frameworks & Tools: React, Node.js, FastAPI, Git, Docker, MongoDB\n"
        "Core Competencies: Data Structures, Algorithms, Object-Oriented Programming, REST APIs\n\n"
        "ACADEMIC & PERSONAL PROJECTS\n"
        "- Smart AI Career Compass: Full-stack career guidance tool built with React and Python FastAPI\n"
        "- Automated Task Planner: Productive scheduler using JavaScript and Node.js\n\n"
        "CERTIFICATIONS & ACHIEVEMENTS\n"
        "- AWS Certified Cloud Practitioner (2025)\n"
        "- Finalist in Smart India Hackathon 2024"
    )

    # 1. Validator function
    fresher_val = validate_document_is_resume(fresher_text)
    print(f"  Fresher validation: is_resume={fresher_val['is_resume']}, doc_type={fresher_val['document_type']}")
    assert fresher_val["is_resume"] is True, "Fresher resume must be accepted as resume!"
    assert fresher_val["document_type"] == "resume"

    # 2. Endpoint execution
    pdf_bytes = create_pdf_bytes_helper(fresher_text)
    upload_file = TestUploadFile(pdf_bytes, filename="rahul_sharma_fresher_resume.pdf")

    with patch("main.GROQ_API_KEY", None), patch("urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.side_effect = Exception("Offline test")
        res_fresher = asyncio.run(analyze_resume(
            branch="Computer Science and Engineering",
            jobRole="Software Development Engineer",
            file=upload_file
        ))

    print(f"  ✓ Document Type:    {res_fresher.get('document_type')}")
    print(f"  ✓ ATS Score:        {res_fresher.get('atsScore')}%")
    print(f"  ✓ Shortlist Chance: {res_fresher.get('shortlistChance')}%")
    print(f"  ✓ Field Match:      {res_fresher.get('field_match')}")

    assert res_fresher.get("document_type") == "resume", "Must be accepted as genuine resume!"
    assert res_fresher.get("atsScore", 0) > 40, "Fresher must receive valid ATS score!"
    assert res_fresher.get("shortlistChance", 0) > 15, "Fresher must receive valid shortlist chance!"
    assert res_fresher["field_match"]["status"] == "strong", "Field match must be strong for CSE!"
    assert res_fresher["field_match"]["score"] >= 85, "Field match score must be >= 85!"

    # Experience section was missing in fresher resume, so suggestion should guide them
    suggestions = [s["text"] for s in res_fresher.get("suggestions", [])]
    assert any("work experience" in s.lower() or "internship" in s.lower() for s in suggestions), \
        "Should constructively suggest adding internships/experience without rejecting the resume!"
    print("  ✓ Genuine fresher resume without experience accepted, scored, and constructively guided.")

    # --------------------------------------------------------------------------
    # 9. Existing Resume Analyzer Regression Test
    # --------------------------------------------------------------------------
    print("\n[TEST 9] Existing Resume Analyzer Regression Test...")
    experienced_text = (
        "Jane Doe\n"
        "Senior Software Engineer | email: jane.doe@example.com | phone: 9876543210 | Bangalore, India | LinkedIn: linkedin.com/in/janedoe\n"
        "PROFESSIONAL SUMMARY\n"
        "Accomplished Senior Software Development Engineer with 4+ years of hands-on experience designing, developing, and deploying mission-critical distributed systems and enterprise cloud applications. Expert in Object-Oriented Programming (OOP), Data Structures, Algorithms, System Design, and Microservices architecture. Proven track record of architecting scalable REST APIs, optimizing relational databases, and implementing automated CI/CD deployment pipelines.\n"
        "EDUCATION\n"
        "Bachelor of Technology (B.Tech) in Computer Science and Engineering | CGPA: 8.9 / 10\n"
        "National Institute of Technology (NIT) | Graduated: June 2022\n"
        "TECHNICAL SKILLS\n"
        "- Programming Languages: Python, Java, C++, JavaScript, TypeScript, SQL\n"
        "- Core Competencies: Data Structures, Algorithms, OOP, System Design, Design Patterns\n"
        "- Backend & Frameworks: FastAPI, Spring Boot, Microservices, REST APIs, GraphQL\n"
        "- Cloud & DevOps: Docker, Kubernetes, AWS, Git, CI/CD Pipelines, Linux\n"
        "- Databases & Caching: PostgreSQL, MySQL, Redis, MongoDB\n"
        "- Testing & Quality: Unit Testing, PyTest, JUnit, Integration Testing\n"
        "PROFESSIONAL EXPERIENCE\n"
        "Senior Software Engineer | Enterprise Cloud Systems, Bangalore | 2022 - Present\n"
        "- Architected and deployed scalable distributed microservices handling over 50000 requests per minute with 99.99% uptime.\n"
        "- Engineered high-throughput REST APIs and implemented distributed Redis caching, reducing API response latency by 55%.\n"
        "- Optimized complex SQL queries, database indexing, and connection pooling, enhancing PostgreSQL throughput by 40%.\n"
        "- Designed and maintained automated CI/CD pipelines using Git and Docker on Kubernetes clusters.\n"
        "- Led unit testing initiatives with PyTest achieving 94% test coverage across core microservices.\n"
        "KEY PROJECTS\n"
        "- High-Performance Distributed Cache: Implemented custom in-memory key-value cache in Python with LRU eviction and replication.\n"
        "- Real-Time Analytics Pipeline: Built event streaming data pipeline processing 10M events daily using Python, Kafka, and SQL.\n"
        "CERTIFICATIONS\n"
        "- AWS Certified Solutions Architect - Associate (2024)\n"
        "- Certified Kubernetes Application Developer (CKAD)"
    )

    pdf_bytes = create_pdf_bytes_helper(experienced_text)
    upload_file = TestUploadFile(pdf_bytes, filename="jane_doe_experienced.pdf")

    with patch("main.GROQ_API_KEY", None), patch("urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.side_effect = Exception("Offline test")
        res_exp = asyncio.run(analyze_resume(
            branch="Computer Science and Engineering",
            jobRole="Software Development Engineer",
            file=upload_file
        ))

    required_keys = [
        "document_type", "confidence", "candidate_name", "career_domain",
        "has_experience", "has_skills", "has_education", "explanation",
        "field_match", "atsScore", "shortlistChance", "resumeStrength",
        "sections", "matchedKeywords", "missingKeywords", "keywordScore",
        "suggestions", "stats"
    ]
    for rk in required_keys:
        assert rk in res_exp, f"Missing required response field '{rk}' in analyze_resume output!"

    assert res_exp["document_type"] == "resume"
    assert res_exp["field_match"]["status"] == "strong"
    assert res_exp["field_match"]["score"] >= 85
    assert res_exp["atsScore"] >= 70
    assert len(res_exp["matchedKeywords"]) > 0
    print(f"  ✓ Full response structure verified: ATS Score = {res_exp['atsScore']}%, Matched KWs = {res_exp['matchedKeywords']}")
    print("  ✓ Existing Resume Analyzer endpoint fully preserved.")

    # --------------------------------------------------------------------------
    # 10. V8 Recommendation Engine Regression Test
    # --------------------------------------------------------------------------
    print("\n[TEST 10] V8 Recommendation Engine Regression Test...")
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

    rec = recommend_career_v8(test_v8_profile)
    primary = rec["primary_career"]
    print(f"  ✓ V8 Primary Career:        {primary['career_title']}")
    print(f"  ✓ Compatibility Score:      {primary['compatibility_score']}%")
    print(f"  ✓ Active weights:           {list(primary['active_weights'].keys())}")
    print(f"  ✓ Weighted contributions:   {primary['weighted_contributions']}")

    assert rec["status"] == "success"
    assert primary["career_title"] == "Robotics Engineer"
    assert primary["compatibility_score"] > 80.0
    calc_sum = round(sum(primary["weighted_contributions"].values()), 2)
    reported_score = primary["compatibility_score"]
    assert abs(calc_sum - reported_score) <= 0.05, f"Sum {calc_sum} != reported {reported_score}"
    print("  ✓ V8 Recommendation Engine 100% intact with mathematically consistent scoring.")

    print("\n" + "=" * 80)
    print("ALL 10 RESUME ANALYZER & BRANCH VALIDATION TESTS PASSED PERFECTLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_all_tests()
