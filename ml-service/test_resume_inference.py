import joblib
import numpy as np
import random
import json

resume_model = joblib.load('resume_model.pkl')
resume_encoders = joblib.load('resume_encoders.pkl')
with open('resume_model_meta.json', 'r', encoding='utf-8') as f:
    resume_meta = json.load(f)
resume_features = resume_meta['features']

branch = "CSE"
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

kw_matched_count = 5
kw_total = 10
kw_score = 50

word_count_score = 100 if 300 <= word_count <= 600 else 50
ats_score = int((kw_score * 0.4) + ((sections_count / len(sections_found)) * 100 * 0.3) + (formatting_score * 0.2) + (word_count_score * 0.1))

resume_quality = 1 # 0: Poor, 1: Average, 2: Good
if ats_score > 80:
    resume_quality = 2
elif ats_score < 50:
    resume_quality = 0

feat_dict = {
    "Branch": branch,
    "Year": 3,
    "CGPA": 8.0,
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
probs = resume_model.predict_proba(X_res)[0]
pred = resume_model.predict(X_res)[0]

print("Features:")
print(list(zip(resume_features, f_vals)))
print()
print("Probs:", probs)
print("Pred:", pred)
