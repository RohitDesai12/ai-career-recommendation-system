import joblib
import numpy as np
import json

resume_model = joblib.load('resume_model.pkl')
resume_encoders = joblib.load('resume_encoders.pkl')
with open('resume_model_meta.json', 'r', encoding='utf-8') as f:
    resume_features = json.load(f)['features']

def test_resume(feat_dict):
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
    return float(probs[1]) * 100

print("Bad Resume:")
print(test_resume({
    "Branch": "CSE", "Year": 3, "CGPA": 5.0, "Word_Count": 150, "Has_Summary": 0, "Has_Skills": 1,
    "Has_Experience": 0, "Has_Education": 1, "Has_Projects": 0, "Has_Certifications": 0, "Has_Achievements": 0,
    "Sections_Count": 2, "Has_Internship": 0, "Internship_Months": 0, "Action_Verb_Count": 2,
    "Keywords_Matched": 1, "Keywords_Total": 10, "Keyword_Match_Score": 10, "Formatting_Score": 30,
    "ATS_Score": 25, "Resume_Quality": 0
}))

print("Average Resume:")
print(test_resume({
    "Branch": "CSE", "Year": 3, "CGPA": 7.0, "Word_Count": 300, "Has_Summary": 1, "Has_Skills": 1,
    "Has_Experience": 0, "Has_Education": 1, "Has_Projects": 1, "Has_Certifications": 0, "Has_Achievements": 0,
    "Sections_Count": 4, "Has_Internship": 0, "Internship_Months": 0, "Action_Verb_Count": 5,
    "Keywords_Matched": 5, "Keywords_Total": 10, "Keyword_Match_Score": 50, "Formatting_Score": 60,
    "ATS_Score": 55, "Resume_Quality": 1
}))

print("Good Resume:")
print(test_resume({
    "Branch": "CSE", "Year": 3, "CGPA": 9.0, "Word_Count": 500, "Has_Summary": 1, "Has_Skills": 1,
    "Has_Experience": 1, "Has_Education": 1, "Has_Projects": 1, "Has_Certifications": 1, "Has_Achievements": 1,
    "Sections_Count": 7, "Has_Internship": 1, "Internship_Months": 6, "Action_Verb_Count": 15,
    "Keywords_Matched": 9, "Keywords_Total": 10, "Keyword_Match_Score": 90, "Formatting_Score": 90,
    "ATS_Score": 95, "Resume_Quality": 2
}))
