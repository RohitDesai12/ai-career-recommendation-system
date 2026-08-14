from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import json
import random

# Load Career ML models
try:
    career_model = joblib.load('career_model_v3.pkl')
    career_encoders = joblib.load('label_encoders_v3.pkl')
    with open('model_meta_v3.json', 'r', encoding='utf-8') as f:
        career_meta = json.load(f)
    career_features = career_meta['features']
    career_classes = career_meta['career_classes']
except Exception as e:
    print("Warning: Could not load Career ML models.", e)
    career_model = None
    career_features = []
    career_classes = []

# Load Resume ML models
try:
    resume_model = joblib.load('resume_model.pkl')
    resume_encoders = joblib.load('resume_encoders.pkl')
    with open('resume_model_meta.json', 'r', encoding='utf-8') as f:
        resume_meta = json.load(f)
    resume_features = resume_meta['features']
    career_keywords_map = resume_meta.get('career_keywords', {})
except Exception as e:
    print("Warning: Could not load Resume ML models.", e)
    resume_model = None
    resume_features = []
    resume_encoders = {}
    career_keywords_map = {}

app = FastAPI(title="AI Career Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ML Service is running"}

@app.post("/api/assess")
def assess_aptitude(data: dict):
    return {"score": 85, "top_traits": ["Analytical", "Problem Solving"]}

# Aliases so the frontend's long branch names are correctly resolved
BRANCH_ALIAS = {
    "Computer Science & Engineering": "CSE",
    "Information Technology": "IT",
    "Software Engineering": "CSE",
    "Data Science": "Data Science",
    "Electronics & Communication Engineering": "ECE",
    "Electronics Engineering": "ECE",
    "VLSI Design": "ECE",
    "Embedded Systems": "ECE",
    "Electrical Engineering": "EEE",
    "Electrical & Electronics Engineering": "EEE",
    "Power Engineering": "EEE",
    "Mechanical Engineering": "Mechanical",
    "Manufacturing Engineering": "Mechanical",
    "Automotive Engineering": "Mechanical",
    "Aerospace Engineering": "Aerospace",
    "Civil Engineering": "Civil",
    "Construction Engineering": "Civil",
    "Transportation Engineering": "Civil",
}

@app.post("/api/recommend")
def recommend_career(data: dict):
    try:
        if not career_model: return {"recommendation": "Software Engineer", "confidence": 80.0}
        feature_values = []
        for feature in career_features:
            val = data.get(feature)
            if feature in career_encoders:
                enc = career_encoders[feature]
                val_str = str(val) if val is not None else "Unknown"
                # Try alias if not found directly
                if val_str not in enc.classes_ and feature == "Branch":
                    val_str = BRANCH_ALIAS.get(val_str, val_str)
                if val_str in enc.classes_:
                    encoded_val = enc.transform([val_str])[0]
                else:
                    # Use middle of the encoder range instead of 0 to avoid bias
                    encoded_val = len(enc.classes_) // 2
            else:
                try: encoded_val = float(val) if val is not None else 0.0
                except ValueError: encoded_val = 0.0
            feature_values.append(encoded_val)

        input_array = np.array([feature_values])
        
        # Get probabilities for ALL classes and rank them
        try:
            probs = career_model.predict_proba(input_array)[0]
            # Build (career_name, probability) pairs and sort descending
            career_probs = []
            for idx, prob in enumerate(probs):
                if idx < len(career_classes):
                    career_probs.append((career_classes[idx], float(prob) * 100))
            career_probs.sort(key=lambda x: x[1], reverse=True)
            
            recommended_career = career_probs[0][0]
            confidence = round(career_probs[0][1], 2)
            
            # Top 5 alternatives (excluding the primary)
            alternatives = [
                {"title": c[0], "confidence": round(c[1], 2)}
                for c in career_probs[1:6]
            ]
        except Exception as e:
            print("predict_proba failed, falling back to predict:", e)
            pred_idx = career_model.predict(input_array)[0]
            if isinstance(pred_idx, (int, np.integer)) and pred_idx < len(career_classes):
                recommended_career = career_classes[pred_idx]
            else:
                recommended_career = str(pred_idx)
            confidence = 85.0
            alternatives = []

        return {
            "recommendation": recommended_career,
            "confidence": confidence,
            "alternatives": alternatives
        }
    except Exception as e:
        print("Recommendation error:", e)
        return {"recommendation": "Software Engineer", "confidence": 50.0}

@app.post("/api/analyze-resume")
def analyze_resume(
    branch: str = Form(...),
    jobRole: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # In a real scenario, we would extract text from the PDF file.
        # Here we mock the text extraction and focus on the ML application.
        
        # 1. Rule-based extraction (Mocked based on typical student resume)
        # Randomize slightly to make the UI feel alive
        word_count = random.randint(250, 600)
        action_verbs = random.randint(5, 15)
        intern_months = random.randint(0, 6)
        has_summary = random.choice([0, 1])
        has_projects = random.choice([0, 1])
        formatting_score = random.randint(60, 95)
        
        sections_found = {
            "Summary": has_summary == 1,
            "Skills": True,
            "Experience": intern_months > 0,
            "Education": True,
            "Projects": has_projects == 1,
            "Certifications": random.choice([True, False])
        }
        
        sections_count = sum([1 for v in sections_found.values() if v])
        
        # 2. Keyword matching
        target_keywords = career_keywords_map.get(jobRole, ["Python", "SQL", "Git", "React", "Linux"])
        random.shuffle(target_keywords)
        matched_kws = target_keywords[:len(target_keywords)//2 + 1]
        missing_kws = [k for k in target_keywords if k not in matched_kws]
        
        kw_matched_count = len(matched_kws)
        kw_total = len(target_keywords)
        kw_score = int((kw_matched_count / max(1, kw_total)) * 100)
        
        # 3. Calculate ATS Score (Formula-based)
        # Weights: Keywords (40%), Sections (30%), Formatting (20%), Word Count (10%)
        word_count_score = 100 if 300 <= word_count <= 600 else 50
        ats_score = int((kw_score * 0.4) + ((sections_count / len(sections_found)) * 100 * 0.3) + (formatting_score * 0.2) + (word_count_score * 0.1))
        
        # 4. Strength Analysis
        resume_quality = 1 # 0: Poor, 1: Average, 2: Good
        strength_str = "Average"
        if ats_score > 80:
            resume_quality = 2
            strength_str = "Good"
        elif ats_score < 50:
            resume_quality = 0
            strength_str = "Poor"
            
        # 5. ML Prediction (Shortlist Chance)
        shortlist_chance = 0.0
        if resume_model:
            # Build feature array matching resume_features
            feat_dict = {
                "Branch": branch,
                "Year": 3, # Mock year
                "CGPA": 8.0, # Mock CGPA
                "Word_Count": word_count,
                "Has_Summary": has_summary,
                "Has_Skills": 1,
                "Has_Experience": 1 if intern_months > 0 else 0,
                "Has_Education": 1,
                "Has_Projects": has_projects,
                "Has_Certifications": 1 if sections_found["Certifications"] else 0,
                "Has_Achievements": 0,
                "Sections_Count": sections_count,
                "Has_Internship": 1 if intern_months > 0 else 0,
                "Internship_Months": intern_months,
                "Action_Verb_Count": action_verbs,
                "Keywords_Matched": kw_matched_count,
                "Keywords_Total": kw_total,
                "Keyword_Match_Score": kw_score,
                "Formatting_Score": formatting_score,
                "ATS_Score": ats_score,
                "Resume_Quality": resume_quality
            }
            
            f_vals = []
            for f in resume_features:
                val = feat_dict.get(f, 0)
                if f in resume_encoders:
                    enc = resume_encoders[f]
                    val_str = str(val)
                    if val_str in enc.classes_:
                        val = enc.transform([val_str])[0]
                    else:
                        val = enc.transform([enc.classes_[0]])[0]
                f_vals.append(val)
                
            X_res = np.array([f_vals])
            try:
                # If model predicts probability
                probs = resume_model.predict_proba(X_res)[0]
                raw_chance = float(probs[1]) * 100 if len(probs) > 1 else float(probs[0]) * 100
            except:
                # If it predicts binary
                pred = resume_model.predict(X_res)[0]
                raw_chance = 85.0 if pred == 1 else 35.0
                
            # Because ML trees often output polarized probs (99.9% or 0.1%),
            # we blend it with ats_score for a more dynamic and realistic user experience:
            if raw_chance > 95:
                shortlist_chance = 70.0 + (ats_score / 100.0) * 25.0
            elif raw_chance < 5:
                shortlist_chance = max(5.0, ats_score * 0.5)
            else:
                shortlist_chance = raw_chance
        else:
            shortlist_chance = min(95.0, ats_score * 1.1)
            
        # 6. Generate Suggestions
        suggestions = []
        if not sections_found["Experience"]:
            suggestions.append({"priority": "High", "text": "Add work experience or internship section — most recruiters filter by this first"})
        if missing_kws:
            suggestions.append({"priority": "High", "text": f"Include missing keywords in your skills: {', '.join(missing_kws[:3])}"})
        if word_count < 300:
            suggestions.append({"priority": "Medium", "text": f"Resume is short at {word_count} words — expand project descriptions to 400–600 words"})
        if not sections_found["Certifications"]:
            suggestions.append({"priority": "Medium", "text": "Add relevant certifications to strengthen your profile"})
        if action_verbs < 10:
            suggestions.append({"priority": "Low", "text": "Use more action verbs to start each bullet point (e.g., Developed, Implemented)"})
            
        if not suggestions:
            suggestions.append({"priority": "Low", "text": "Resume looks great! Consider tailoring it further for specific companies."})

        return {
            "atsScore": ats_score,
            "shortlistChance": round(shortlist_chance, 1),
            "resumeStrength": strength_str,
            "sections": [{"name": k, "found": v} for k, v in sections_found.items()],
            "matchedKeywords": matched_kws,
            "missingKeywords": missing_kws,
            "keywordScore": kw_score,
            "suggestions": suggestions,
            "stats": {
                "wordCount": word_count,
                "actionVerbs": action_verbs,
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
    user_ratings = data.get("skill_ratings", {})  # {skillName: {level, score}}

    # Load required skills
    try:
        with open('required_skills.json', 'r', encoding='utf-8') as f:
            required_skills_data = json.load(f)
    except:
        required_skills_data = {}

    # Load resources
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
        # Get user's current score for this skill
        user_skill = user_ratings.get(skill_name, {})
        current_score = user_skill.get("score", 0) if isinstance(user_skill, dict) else 0

        gap = max(0, required_score - current_score)
        total_required += required_score
        total_current += min(current_score, required_score)

        # Determine color based on gap
        if gap <= 0:
            color = "#1D9E75"  # Green - met
        elif gap <= 25:
            color = "#EF9F27"  # Amber - close
        else:
            color = "#E24B4A"  # Red - big gap

        skills_result.append({
            "name": skill_name,
            "current": current_score,
            "required": required_score,
            "gap": gap,
            "category": category,
            "color": color
        })

    # Sort: biggest gaps first
    skills_result.sort(key=lambda x: x["gap"], reverse=True)

    readiness = int((total_current / max(1, total_required)) * 100)

    # Estimate time: roughly 1 month per 100 gap points
    total_gap = sum(s["gap"] for s in skills_result)
    months = max(1, round(total_gap / 100))
    time_estimate = f"~{months} months"

    # Gather resources for skills with gaps
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
        "resources": resources_result[:10],  # Top 10 resources
        "available_careers": list(required_skills_data.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
