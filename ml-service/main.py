from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import json
import random
import os
import re
import io
import urllib.request
import pypdf

# Load environment variables from .env if present
try:
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()
except Exception:
    pass

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

from model_manager import (
    ensure_model_file,
    load_v8_model,
    load_v8_metadata,
    is_v8_available,
    get_v8_status,
    is_local_v8_mode,
    load_resume_analyzer_artifacts,
    get_resume_model_status,
    is_resume_model_available,
    HF_REPO_ID,
    HF_RESUME_MODEL_FILENAME,
    HF_RESUME_ENCODERS_FILENAME,
    HF_RESUME_META_FILENAME,
    USE_LOCAL_V8_MODEL,
    RESUME_MODEL_URL,
    V8_MODEL_URL
)

# V8 Intelligent Career Recommendation & Ranking Engine (The Sole Recommendation Engine)
try:
    from v8 import (
        rank_careers_v8,
        predict_v8,
        get_all_careers
    )
except ImportError:
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from v8 import (
        rank_careers_v8,
        predict_v8,
        get_all_careers
    )

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Initialize V8 Model & Metadata on module load
try:
    load_v8_model()
    load_v8_metadata()
except Exception as e:
    print("Warning: Could not initialize V8 model at module load:", e)

# Load Resume ML models via Hugging Face / Local loader
try:
    resume_model, resume_encoders, resume_meta, _resume_info = load_resume_analyzer_artifacts()
    resume_features = resume_meta.get('features', [])
    career_keywords_map = resume_meta.get('career_keywords', {})
    resume_size_bytes = _resume_info.get('size_bytes', 0)
except Exception as e:
    print("Warning: Could not load Resume ML models:", e)
    resume_model = None
    resume_features = []
    resume_encoders = {}
    career_keywords_map = {}
    resume_size_bytes = 0


def get_current_model_status():
    """Builds real-time model telemetry dictionary without exposing credentials."""
    v8_stat = get_v8_status()
    resume_stat = get_resume_model_status()
    return {
        "career_engine": {
            "engine": "v8",
            "model_name": v8_stat.get("model_name", "Career Compass V8 - HistGradientBoosting"),
            "available": v8_stat.get("available", False),
            "classes_count": v8_stat.get("classes_count", 35),
            "features_count": v8_stat.get("features_count", 20),
            "mode": v8_stat.get("mode", "unavailable"),
            "hf_repo_id": v8_stat.get("hf_repo_id"),
            "predict_proba_available": v8_stat.get("predict_proba_available", False)
        },
        "resume_model": resume_stat,
        "environment": {
            "active_recommendation_engine": "v8",
            "hf_configured": bool(HF_REPO_ID),
            "use_local_v8_model": is_local_v8_mode(),
            "resume_model_url_configured": bool(RESUME_MODEL_URL),
            "groq_configured": bool(GROQ_API_KEY)
        }
    }


# Backwards compatibility reference
MODEL_STATUS = get_current_model_status()

app = FastAPI(title="AI Career Recommendation API — V8 Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Application startup: ensure V8 model and Resume Analyzer artifacts are loaded and validated once."""
    global resume_model, resume_encoders, resume_meta, resume_features, career_keywords_map, resume_size_bytes
    try:
        m = load_v8_model()
        if m is not None:
            status = get_v8_status()
            print(f"[Startup]: Career Compass V8 Model active (mode: {status.get('mode')}, classes: {status.get('classes_count')})")
        else:
            print("[Startup Warning]: V8 Model could not be loaded at startup.")
    except Exception as e:
        print("[Startup Warning]: V8 Model startup loading failed:", e)

    try:
        r_m, r_enc, r_meta, r_info = load_resume_analyzer_artifacts()
        resume_model = r_m
        resume_encoders = r_enc
        resume_meta = r_meta
        resume_features = r_meta.get('features', [])
        career_keywords_map = r_meta.get('career_keywords', {})
        resume_size_bytes = r_info.get('size_bytes', 0)
        r_status = get_resume_model_status()
        print(f"[Startup]: Resume Analyzer active (storage: {r_status.get('storage')}, size: {r_status.get('file_size_bytes')} bytes)")
    except Exception as e:
        print("[Startup Warning]: Resume Analyzer startup loading failed:", e)


@app.get("/")
def read_root():
    return {
        "status": "ML Service is running",
        "active_recommendation_engine": "v8",
        "v8_available": is_v8_available(),
        "classes_count": len(get_all_careers()) if is_v8_available() else 35,
        "features_count": 20
    }


@app.get("/health")
def health_check():
    status = get_current_model_status()
    return {
        "status": "healthy" if is_v8_available() else "degraded",
        "service": "career-compass-ml",
        "active_engine": "v8",
        "models": status,
        "resume_model": status.get("resume_model"),
        "career_engine": status.get("career_engine")
    }


@app.get("/api/model-status")
def get_model_status():
    return get_current_model_status()

@app.post("/api/assess")
def assess_aptitude(data: dict):
    return {"score": 85, "top_traits": ["Analytical", "Problem Solving"]}

@app.post("/api/recommend/v8")
def recommend_career_v8(data: dict):
    """
    V8 Intelligent Career Recommendation & Ranking.
    Evaluates all 35 career classes via HistGradientBoosting predict_proba(),
    computes 6-factor compatibility scores, and returns top ranked pathways
    with skill gap analysis and transparent explanations.
    """
    try:
        top_n = int(data.get("top_n", 5))
        assessment_id = data.get("assessment_id") or data.get("assessmentId")
        profile = data.get("profile") or data.get("student_profile") or data
        return rank_careers_v8(profile, top_n=top_n, assessment_id=assessment_id)
    except Exception as e:
        logger_err = str(e)
        print("V8 recommendation error:", logger_err)
        return {
            "status": "error",
            "message": f"V8 ranking error: {logger_err}",
            "recommendation": "Software Development Engineer",
            "confidence": 50.0,
            "model_status": "error_fallback",
            "alternatives": []
        }

@app.post("/api/recommend")
def recommend_career(data: dict):
    """
    Consolidated Primary Recommendation Endpoint (Powered Exclusively by V8).
    Maintains backwards compatibility with legacy callers while returning rich V8 results.
    """
    try:
        top_n = int(data.get("top_n", 5))
        assessment_id = data.get("assessment_id") or data.get("assessmentId")
        profile = data.get("profile") or data.get("student_profile") or data
        v8_result = rank_careers_v8(profile, top_n=top_n, assessment_id=assessment_id)

        # Populate backwards-compatible top-level properties
        primary = v8_result.get("primary_career", {})
        top_title = primary.get("career_title", "Software Development Engineer")
        top_conf = round(float(primary.get("compatibility_score", 85.0)), 2)

        alternatives = [
            {
                "title": alt.get("career_title", ""),
                "confidence": round(float(alt.get("compatibility_score", 70.0)), 2)
            }
            for alt in v8_result.get("alternative_careers", [])
        ]

        v8_result.update({
            "recommendation": top_title,
            "confidence": top_conf,
            "model_status": "v8_trained_pipeline",
            "warning": None,
            "alternatives": alternatives
        })
        return v8_result

    except Exception as e:
        print("Recommendation error:", e)
        return {
            "status": "error",
            "recommendation": "Software Development Engineer",
            "confidence": 50.0,
            "model_status": "error_fallback",
            "warning": f"Recommendation error: {str(e)}",
            "alternatives": [],
            "top_recommendations": []
        }


# =========================================================================
# RESUME ANALYZER (Fully Preserved)
# =========================================================================

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full raw text content from uploaded PDF bytes."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_pages.append(t)
        return "\n".join(extracted_pages).strip()
    except Exception as e:
        print("Error extracting text with pypdf:", e)
        return ""

def classify_document_with_llm(extracted_text: str, selected_branch: str, selected_role: str) -> dict:
    """
    Use an LLM classifier to determine:
    1. Whether the extracted text represents a genuine candidate resume.
    2. How well the candidate's actual background/field matches the selected branch and target role.
    """
    prompt = f"""You are an expert document and career domain classifier.
Given the extracted text, verify if it is a genuine candidate resume or CV, and evaluate the field alignment between the resume content and the user's selected engineering branch and target job role.

Selected Engineering Branch: "{selected_branch}"
Selected Target Job Role: "{selected_role}"

CRITICAL RULES:
1. Ignore and never trust the filename or external hints. Focus purely on the semantic content of the document text.
2. If it is NOT a resume (e.g. homework assignment, syllabus, problem set, lecture note, essay, invoice, generic article):
   - set "document_type": "not_resume"
   - explain clearly why in "explanation".
3. If it IS a genuine resume:
   - set "document_type": "resume"
   - identify candidate's primary detected domain (detected_field).
   - recommend the best matching engineering branch (recommended_branch, e.g. "Computer Science & Engineering", "Mechanical Engineering", "Civil Engineering", "Electrical & Electronics Engineering").
   - evaluate field_match_score (0 to 100 integer) comparing resume skills/experience with the selected branch and role.
   - match_status:
     * "strong" (score >= 70): Strong direct domain alignment.
     * "partial" (score between 40 and 69): Moderate overlap (e.g. CS profile for ECE/Embedded or Mechatronics).
     * "mismatch" (score < 40): Major domain mismatch (e.g. CS profile for Civil/Mechanical/Chemical).
   - field_match_explanation: 1-2 sentence description explaining the fit or discrepancy.

Document text snippet (first 3500 chars):
\"\"\"
{extracted_text[:3500]}
\"\"\"

Return strictly a valid JSON object matching this schema:
{{
  "document_type": "resume" | "not_resume",
  "confidence": 0.95,
  "candidate_name": "Full Name" | null,
  "detected_field": "Computer Science & Engineering",
  "recommended_branch": "Computer Science & Engineering",
  "field_match_score": 92,
  "match_status": "strong" | "partial" | "mismatch",
  "field_match_explanation": "1-2 concise sentences explaining the overlap or fit.",
  "has_experience": true | false,
  "has_skills": true | false,
  "has_education": true | false,
  "explanation": "Clear explanation of the classification"
}}"""

    # 1. Attempt Groq LLM classification
    if GROQ_API_KEY:
        for model_name in ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'openai/gpt-oss-120b']:
            try:
                req = urllib.request.Request(
                    'https://api.groq.com/openai/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {GROQ_API_KEY}',
                        'Content-Type': 'application/json',
                        'User-Agent': 'CareerRecommender/1.0'
                    },
                    data=json.dumps({
                        'model': model_name,
                        'messages': [{'role': 'user', 'content': prompt}],
                        'response_format': {'type': 'json_object'},
                        'temperature': 0.1,
                        'max_tokens': 600
                    }).encode('utf-8')
                )

                with urllib.request.urlopen(req, timeout=12) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    result_json = json.loads(data['choices'][0]['message']['content'])
                    if "document_type" in result_json:
                        return result_json
            except Exception as llm_err:
                print(f"LLM classification with {model_name} failed:", llm_err)

    # 2. Heuristic fallback in case LLM is offline
    lower_text = extracted_text.lower()

    # Non-resume triggers
    not_resume_keywords = ['homework', 'problem 1', 'problem 2', 'due date', 'syllabus', 'assignment', 'submission date', 'quiz', 'midterm', 'final exam', 'invoice #', 'receipt #', 'terms and conditions']
    not_resume_score = sum(1 for kw in not_resume_keywords if kw in lower_text)

    # Resume triggers
    has_contact = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', lower_text) or re.search(r'\+?\d[\d\s-]{8,}', lower_text))
    has_edu = any(k in lower_text for k in ['education', 'b.tech', 'bachelor', 'master', 'university', 'college', 'cgpa', 'gpa'])
    has_skills = any(k in lower_text for k in ['skills', 'technologies', 'programming', 'languages', 'frameworks', 'tools'])
    has_exp = any(k in lower_text for k in ['experience', 'internship', 'employment', 'work history', 'projects'])

    resume_score = sum([has_contact, has_edu, has_skills, has_exp])

    if not_resume_score >= 2 or (resume_score < 2 and not (has_edu and has_skills)):
        return {
            "document_type": "not_resume",
            "confidence": 0.90,
            "candidate_name": None,
            "detected_field": "Not applicable",
            "recommended_branch": selected_branch,
            "field_match_score": 0,
            "match_status": "mismatch",
            "field_match_explanation": "The document lacks essential resume sections (contact details, structured education, or skill listings) and appears to be a homework assignment, article, or general document.",
            "has_experience": has_exp,
            "has_skills": has_skills,
            "has_education": has_edu,
            "explanation": "The document lacks essential resume sections."
        }

    # Domain keyword heuristics
    cs_keywords = ['python', 'java', 'react', 'javascript', 'c++', 'sql', 'docker', 'git', 'web', 'fastapi', 'node', 'algorithms', 'software', 'frontend', 'backend']
    ece_keywords = ['vlsi', 'verilog', 'embedded', 'microcontroller', 'arduino', 'fpga', 'circuits', 'signal processing', 'matlab', 'sensors', 'pcb']
    mech_keywords = ['cad', 'solidworks', 'ansys', 'autocad', 'thermal', 'hvac', 'manufacturing', 'robotics', 'catia', 'fluid mechanics', 'thermodynamics']
    civil_keywords = ['structural', 'surveying', 'concrete', 'geotechnical', 'staad', 'construction', 'transportation', 'hydraulics', 'autocad civil']

    cs_count = sum(1 for kw in cs_keywords if kw in lower_text)
    ece_count = sum(1 for kw in ece_keywords if kw in lower_text)
    mech_count = sum(1 for kw in mech_keywords if kw in lower_text)
    civil_count = sum(1 for kw in civil_keywords if kw in lower_text)

    domain_counts = {
        "Computer Science & Engineering": cs_count,
        "Electronics & Communication Engineering": ece_count,
        "Mechanical Engineering": mech_count,
        "Civil Engineering": civil_count
    }

    detected_field = max(domain_counts, key=domain_counts.get)
    if domain_counts[detected_field] == 0:
        detected_field = selected_branch or "Computer Science & Engineering"

    # Check match with selected branch
    is_same_branch = (detected_field.lower() in (selected_branch or "").lower()) or ((selected_branch or "").lower() in detected_field.lower())

    if is_same_branch:
        field_match_score = 90
        match_status = "strong"
        explanation = f"Your resume strongly aligns with {selected_branch}."
    elif (detected_field == "Computer Science & Engineering" and "electronics" in (selected_branch or "").lower()) or \
         (detected_field == "Electronics & Communication Engineering" and "computer" in (selected_branch or "").lower()) or \
         (detected_field == "Mechanical Engineering" and "electrical" in (selected_branch or "").lower()):
        field_match_score = 60
        match_status = "partial"
        explanation = f"Your resume is primarily focused on {detected_field}, but has transferable skills for {selected_branch}."
    else:
        field_match_score = 18
        match_status = "mismatch"
        explanation = f"Your resume appears to target {detected_field}, while {selected_branch} was selected."

    return {
        "document_type": "resume",
        "confidence": 0.88,
        "candidate_name": "Candidate",
        "detected_field": detected_field,
        "recommended_branch": detected_field,
        "field_match_score": field_match_score,
        "match_status": match_status,
        "field_match_explanation": explanation,
        "has_experience": has_exp,
        "has_skills": has_skills,
        "has_education": has_edu,
        "explanation": "Genuine candidate resume validated."
    }

COMMON_ACTION_VERBS = [
    "developed", "created", "built", "designed", "implemented", "managed", "led", "engineered",
    "architected", "optimized", "integrated", "analyzed", "deployed", "spearheaded", "configured",
    "programmed", "collaborated", "researched", "improved", "automated", "trained", "delivered"
]

@app.post("/api/analyze-resume")
async def analyze_resume(
    branch: str = Form(...),
    jobRole: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_pdf(file_bytes)

        if not raw_text or len(raw_text.strip()) < 30:
            return {
                "document_type": "not_resume",
                "confidence": 0.99,
                "candidate_name": None,
                "career_domain": "Not applicable",
                "has_experience": False,
                "has_skills": False,
                "has_education": False,
                "explanation": "The uploaded file could not be parsed into readable text or is empty. Please upload a standard text PDF."
            }

        classification = classify_document_with_llm(raw_text, branch, jobRole)

        if classification.get("document_type") == "not_resume":
            return {
                "document_type": "not_resume",
                "confidence": classification.get("confidence", 0.94),
                "candidate_name": classification.get("candidate_name"),
                "career_domain": classification.get("career_domain", "Not applicable"),
                "has_experience": classification.get("has_experience", False),
                "has_skills": classification.get("has_skills", False),
                "has_education": classification.get("has_education", False),
                "explanation": classification.get("explanation", "The uploaded document does not appear to be a genuine resume or CV.")
            }

        words = raw_text.split()
        word_count = len(words)
        lower_text = raw_text.lower()

        action_verbs_matched = [v for v in COMMON_ACTION_VERBS if re.search(r'\b' + v + r'\b', lower_text)]
        action_verbs_count = len(action_verbs_matched)

        sections_found = {
            "Summary": any(s in lower_text for s in ["summary", "objective", "profile", "about me"]),
            "Skills": any(s in lower_text for s in ["skills", "technical skills", "technologies", "proficiencies", "competencies"]),
            "Experience": any(s in lower_text for s in ["experience", "employment", "work experience", "internship", "intern"]),
            "Education": any(s in lower_text for s in ["education", "academic", "university", "b.tech", "degree", "college"]),
            "Projects": any(s in lower_text for s in ["projects", "personal projects", "academic projects", "key projects"]),
            "Certifications": any(s in lower_text for s in ["certifications", "certificates", "courses", "licenses", "training"])
        }

        sections_count = sum(1 for v in sections_found.values() if v)
        intern_months = 3 if sections_found["Experience"] else 0

        target_keywords = career_keywords_map.get(jobRole, ["Python", "SQL", "Git", "React", "Linux", "Docker", "API"])
        matched_kws = [k for k in target_keywords if re.search(r'\b' + re.escape(k.lower()) + r'\b', lower_text)]
        missing_kws = [k for k in target_keywords if k not in matched_kws]

        kw_matched_count = len(matched_kws)
        kw_total = len(target_keywords)
        kw_score = int((kw_matched_count / max(1, kw_total)) * 100)

        formatting_score = min(98, max(55, 60 + (sections_count * 5) + (10 if 300 <= word_count <= 700 else 0)))
        word_count_score = 100 if 300 <= word_count <= 700 else (75 if 200 <= word_count <= 900 else 40)
        ats_score = int((kw_score * 0.4) + ((sections_count / len(sections_found)) * 100 * 0.3) + (formatting_score * 0.2) + (word_count_score * 0.1))

        strength_str = "Average"
        if ats_score >= 80:
            strength_str = "Good"
        elif ats_score < 50:
            strength_str = "Poor"

        shortlist_chance = round(min(98.0, max(15.0, (ats_score * 0.75) + (kw_score * 0.25) + random.uniform(-2, 3))), 1)

        suggestions = []
        if not sections_found["Experience"]:
            suggestions.append({"priority": "High", "text": "Add work experience or internship section — recruiters filter by this first"})
        if missing_kws:
            suggestions.append({"priority": "High", "text": f"Include missing keywords in your skills: {', '.join(missing_kws[:3])}"})
        if word_count < 300:
            suggestions.append({"priority": "Medium", "text": f"Resume is concise at {word_count} words — expand project descriptions to 400–600 words"})
        elif word_count > 800:
            suggestions.append({"priority": "Medium", "text": f"Resume is quite long ({word_count} words) — condense to 1–2 focused pages"})
        if not sections_found["Certifications"]:
            suggestions.append({"priority": "Medium", "text": "Add relevant industry certifications to strengthen your technical credibility"})
        if action_verbs_count < 8:
            suggestions.append({"priority": "Low", "text": "Use more strong action verbs to start each bullet point (e.g., Developed, Engineered, Optimized)"})

        if not suggestions:
            suggestions.append({"priority": "Low", "text": "Resume structure looks strong! Continue tailoring keywords for specific job postings."})

        field_match_data = {
            "score": int(classification.get("field_match_score", 85)),
            "status": classification.get("match_status", "strong"),
            "detected_field": classification.get("detected_field", branch),
            "recommended_branch": classification.get("recommended_branch", branch),
            "explanation": classification.get("field_match_explanation", f"Resume aligns with {branch}."),
        }

        return {
            "document_type": "resume",
            "confidence": classification.get("confidence", 0.95),
            "candidate_name": classification.get("candidate_name") or "Candidate",
            "career_domain": classification.get("detected_field") or branch,
            "has_experience": classification.get("has_experience", sections_found["Experience"]),
            "has_skills": classification.get("has_skills", sections_found["Skills"]),
            "has_education": classification.get("has_education", sections_found["Education"]),
            "explanation": classification.get("explanation", "Genuine candidate resume validated."),
            "field_match": field_match_data,
            "atsScore": ats_score,
            "shortlistChance": shortlist_chance,
            "resumeStrength": strength_str,
            "sections": [{"name": k, "found": v} for k, v in sections_found.items()],
            "matchedKeywords": matched_kws,
            "missingKeywords": missing_kws,
            "keywordScore": kw_score,
            "suggestions": suggestions,
            "stats": {
                "wordCount": word_count,
                "actionVerbs": action_verbs_count,
                "internshipMonths": intern_months,
                "formattingScore": formatting_score
            }
        }
    except Exception as e:
        print("Resume analysis error:", e)
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/chatbot")
def chatbot_mentor(data: dict):
    message = data.get("message", "")
    return {"reply": f"As an AI mentor, I suggest focusing on building scalable projects to complement your interest in {message}."}

@app.get("/api/skill-gap/careers")
def get_available_careers():
    try:
        with open('required_skills.json', 'r', encoding='utf-8') as f:
            required_skills_data = json.load(f)
        return {"careers": list(required_skills_data.keys())}
    except:
        return {"careers": []}

@app.post("/api/skill-gap")
def skill_gap_analysis(data: dict):
    career = data.get("career", "")
    user_ratings = data.get("skill_ratings", {})

    try:
        with open('required_skills.json', 'r', encoding='utf-8') as f:
            required_skills_data = json.load(f)
    except:
        required_skills_data = {}

    try:
        with open('skill_resources.json', 'r', encoding='utf-8') as f:
            resources_data = json.load(f)
    except:
        resources_data = {}

    req_skills = required_skills_data.get(career, {})
    if not req_skills:
        return {"skills": [], "readiness": 0, "time_estimate": "N/A", "resources": [], "available_careers": list(required_skills_data.keys())}

    skills_result = []
    total_required = 0
    total_current = 0

    for skill_name, info in req_skills.items():
        required_score = info.get("required", 50)
        category = info.get("category", "General")
        user_skill = user_ratings.get(skill_name, {})
        current_score = user_skill.get("score", 0) if isinstance(user_skill, dict) else 0

        gap = max(0, required_score - current_score)
        total_required += required_score
        total_current += min(current_score, required_score)

        if gap <= 0:
            color = "#1D9E75"
        elif gap <= 25:
            color = "#EF9F27"
        else:
            color = "#E24B4A"

        skills_result.append({
            "name": skill_name,
            "current": current_score,
            "required": required_score,
            "gap": gap,
            "category": category,
            "color": color
        })

    skills_result.sort(key=lambda x: x["gap"], reverse=True)
    readiness = int((total_current / max(1, total_required)) * 100)

    total_gap = sum(s["gap"] for s in skills_result)
    months = max(1, round(total_gap / 100))
    time_estimate = f"~{months} months"

    resources_result = []
    for s in skills_result:
        if s["gap"] > 0 and s["name"] in resources_data:
            for r in resources_data[s["name"]]:
                resources_result.append({
                    "skill": s["name"],
                    "name": r["name"],
                    "url": r["url"],
                    "free": r.get("free", False),
                    "weeks": r.get("weeks", 4)
                })

    return {
        "skills": skills_result,
        "readiness": readiness,
        "time_estimate": time_estimate,
        "resources": resources_result[:10],
        "available_careers": list(required_skills_data.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
