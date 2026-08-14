"""
Resume Analyzer — Model Training Script
Dataset : resume_dataset_v2.csv (15,000 rows, 30 careers)
Model   : Gradient Boosting Classifier
Accuracy: ~99%  |  AUC: ~0.9998

What this model predicts:
  Given a student's resume features → will it get shortlisted? (0/1)

What the ATS score formula does separately:
  Calculates the raw ATS score from keyword match, sections, word count etc.
  (No ML needed for ATS score — it's a weighted formula)
"""

import pandas as pd
import numpy as np
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# ─────────────────────────────────────────────
# 1. LOAD
# ─────────────────────────────────────────────
print("=" * 60)
print("  Resume Analyzer — Shortlist Prediction Model")
print("=" * 60)

df = pd.read_csv("resume_dataset_v2.csv")
print(f"\n✅ Rows     : {len(df):,}")
print(f"🎯 Careers  : {df['Target_Career'].nunique()}")
print(f"📊 Shortlist: {df['Shortlisted'].mean()*100:.1f}% positive rate")

# ─────────────────────────────────────────────
# 2. ENCODE
# ─────────────────────────────────────────────
le_dict = {}
for col in ['Branch','Target_Career','Resume_Quality','Top_Suggestion_Priority']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    le_dict[col] = le

# ─────────────────────────────────────────────
# 3. FEATURES & TARGET
# ─────────────────────────────────────────────
FEATURES = [
    'Branch','Year','CGPA','Word_Count',
    'Has_Summary','Has_Skills','Has_Experience','Has_Education',
    'Has_Projects','Has_Certifications','Has_Achievements',
    'Sections_Count','Has_Internship','Internship_Months',
    'Action_Verb_Count','Keywords_Matched','Keywords_Total',
    'Keyword_Match_Score','Formatting_Score','ATS_Score','Resume_Quality'
]

X = df[FEATURES]
y = df['Shortlisted']
X_train,X_test,y_train,y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📊 Train: {len(X_train):,}  |  Test: {len(X_test):,}")

# ─────────────────────────────────────────────
# 4. TRAIN
# ─────────────────────────────────────────────
print("\n⏳ Training Gradient Boosting Classifier...")

model = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    subsample=0.8,
    random_state=42
)
model.fit(X_train, y_train)

# ─────────────────────────────────────────────
# 5. EVALUATE
# ─────────────────────────────────────────────
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:,1]
acc  = accuracy_score(y_test, y_pred)
auc  = roc_auc_score(y_test, y_prob)
cv   = cross_val_score(model, X, y, cv=5, scoring='accuracy', n_jobs=-1)

print(f"\n{'='*60}")
print(f"  ✅ Accuracy  : {acc*100:.2f}%")
print(f"  ✅ AUC Score : {auc:.4f}")
print(f"  ✅ CV Mean   : {cv.mean()*100:.2f}% ± {cv.std()*100:.2f}%")
print(f"{'='*60}")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Not Shortlisted','Shortlisted']))

# Feature importance
fi = sorted(zip(FEATURES, model.feature_importances_), key=lambda x:-x[1])
print("\n🔍 Top 8 Features:")
for i,(f,v) in enumerate(fi[:8],1):
    print(f"  {i}. {f:<28} {v:.4f}  {'█'*int(v*100)}")

# ─────────────────────────────────────────────
# 6. SAVE
# ─────────────────────────────────────────────
joblib.dump(model, "resume_model.pkl")
joblib.dump(le_dict, "resume_encoders.pkl")

meta = {
    "features":    FEATURES,
    "best_model":  "Gradient Boosting",
    "accuracy":    round(acc*100, 2),
    "auc":         round(auc, 4),
}
with open("resume_model_meta.json","w") as f:
    json.dump(meta, f, indent=2)

print("\n✅ Saved: resume_model.pkl | resume_encoders.pkl | resume_model_meta.json")

# ─────────────────────────────────────────────
# 7. ATS SCORE FORMULA (no ML needed)
# ─────────────────────────────────────────────
print(f"\n{'='*60}")
print("  ATS SCORE FORMULA (used at runtime, not trained)")
print(f"{'='*60}")
print("""
def calculate_ats_score(resume_features):
    kw_score    = resume_features['keyword_match_score']    # 0-100
    sec_count   = resume_features['sections_count']         # 0-8
    word_count  = resume_features['word_count']
    verb_count  = resume_features['action_verb_count']
    intern_months = resume_features['internship_months']

    wc_score = 100 if 300 <= word_count <= 750 else (70 if word_count < 300 else 60)

    ats = (
        kw_score       * 0.40 +   # keyword match    40%
        (sec_count/8)  * 100 * 0.25 +   # sections    25%
        wc_score       * 0.15 +   # word count       15%
        min(verb_count*7, 100) * 0.10 +  # action verbs 10%
        min(intern_months*12, 100) * 0.10  # experience 10%
    )
    return round(min(max(ats, 0), 100), 1)
""")

# ─────────────────────────────────────────────
# 8. SAMPLE PREDICTIONS
# ─────────────────────────────────────────────
print(f"{'='*60}")
print("  SAMPLE PREDICTIONS")
print(f"{'='*60}")

samples = [
    {"desc":"Strong CSE resume for ML Engineer",
     "Branch":"CSE","Target_Career":"ML Engineer / AI Researcher","Year":4,"CGPA":8.5,
     "Word_Count":520,"Has_Summary":1,"Has_Skills":1,"Has_Experience":1,"Has_Education":1,
     "Has_Projects":1,"Has_Certifications":1,"Has_Achievements":1,"Sections_Count":7,
     "Has_Internship":1,"Internship_Months":4,"Action_Verb_Count":12,"Keywords_Matched":11,
     "Keywords_Total":15,"Keyword_Match_Score":73.3,"Formatting_Score":88,"ATS_Score":81,"Resume_Quality":"good"},
    {"desc":"Weak ECE resume for VLSI Engineer",
     "Branch":"ECE","Target_Career":"VLSI Design Engineer","Year":3,"CGPA":6.2,
     "Word_Count":180,"Has_Summary":0,"Has_Skills":1,"Has_Experience":0,"Has_Education":1,
     "Has_Projects":0,"Has_Certifications":0,"Has_Achievements":0,"Sections_Count":2,
     "Has_Internship":0,"Internship_Months":0,"Action_Verb_Count":1,"Keywords_Matched":3,
     "Keywords_Total":12,"Keyword_Match_Score":25.0,"Formatting_Score":55,"ATS_Score":32,"Resume_Quality":"weak"},
    {"desc":"Average Civil resume for Structural Engineer",
     "Branch":"Civil","Target_Career":"Structural Design Engineer","Year":4,"CGPA":7.3,
     "Word_Count":350,"Has_Summary":1,"Has_Skills":1,"Has_Experience":0,"Has_Education":1,
     "Has_Projects":1,"Has_Certifications":0,"Has_Achievements":0,"Sections_Count":4,
     "Has_Internship":0,"Internship_Months":0,"Action_Verb_Count":5,"Keywords_Matched":6,
     "Keywords_Total":10,"Keyword_Match_Score":60.0,"Formatting_Score":72,"ATS_Score":58,"Resume_Quality":"average"},
]

for s in samples:
    row = pd.DataFrame([{k:v for k,v in s.items() if k != 'desc'}])
    for col, le in le_dict.items():
        if col in row.columns:
            val = str(row[col].iloc[0])
            row[col] = le.transform([val if val in le.classes_ else le.classes_[0]])
    pred = model.predict(row)[0]
    prob = model.predict_proba(row)[0][1]*100
    label = "✅ Shortlisted" if pred==1 else "❌ Not Shortlisted"
    print(f"\n  {s['desc']}")
    print(f"  ATS Score : {s['ATS_Score']}  |  Keywords: {s['Keyword_Match_Score']}%")
    print(f"  Result    : {label}  ({prob:.1f}% confidence)")

print("\n✅ Training complete!")
