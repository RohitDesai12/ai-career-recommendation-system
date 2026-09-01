import urllib.request
import json
import os

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')  

def classify_document(text: str):
    prompt = f"""You are an expert document classifier.
Determine whether the following extracted text is a genuine candidate resume or curriculum vitae (CV).

CRITICAL RULES:
1. Ignore and never trust the filename or file title. A user can name an assignment "Resume.pdf" or name a resume "assignment.pdf".
2. Only classify as "resume" if the document genuinely outlines a specific person's qualifications, education, technical skills, projects, or work history.
3. If it is an assignment, lecture note, syllabus, article, invoice, essay, research report, or unrelated file, set document_type to "not_resume".
4. If it is not a resume, explain clearly what the document appears to be in "explanation".

Document text snippet (first 3000 chars):
\"\"\"{text[:3000]}\"\"\"

Return strictly a JSON object with this exact structure:
{{
  "document_type": "resume" or "not_resume",
  "confidence": 0.95,
  "candidate_name": "Name of the candidate or null",
  "career_domain": "e.g. Software Development, Civil Engineering, or Not applicable",
  "has_experience": true,
  "has_skills": true,
  "has_education": true,
  "explanation": "Clear explanation of why this document is or is not a resume"
}}"""

    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json',
            'User-Agent': 'CareerRecommender/1.0'
        },
        data=json.dumps({
            'model': 'llama-3.3-70b-versatile',
            'messages': [{'role': 'user', 'content': prompt}],
            'response_format': {'type': 'json_object'},
            'temperature': 0.1,
            'max_tokens': 500
        }).encode('utf-8')
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        return json.loads(res['choices'][0]['message']['content'])

# Test 1: Real resume
resume_sample = """
John Doe
Software Engineer | john@example.com | +1 555-0199 | github.com/johndoe
Summary: Passionate software engineer with 2 years of experience in Python and full-stack web development.
Education:
B.Tech in Computer Science and Engineering, XYZ University, 2021-2025, CGPA: 8.9
Skills:
Languages: Python, JavaScript, TypeScript, SQL, C++
Frameworks: React, Node.js, FastAPI, Django
Tools: Docker, Git, AWS, MongoDB
Experience:
Software Engineering Intern - Alpha Tech (June 2024 - Dec 2024)
- Built high-performance microservices in FastAPI reducing response time by 40%.
Projects:
AI Recommendation Engine - Built collaborative filtering system using PyTorch and Scikit-Learn.
"""

# Test 2: Assignment / Non-resume
assignment_sample = """
Machine Learning Homework 3: Linear Regression and Gradient Descent
Course: CS 229 - Spring 2024
Due Date: October 15, 2024

Problem 1: Derive the normal equation for linear regression with L2 regularization (Ridge regression).
Show that theta = (X^T X + lambda I)^-1 X^T y.

Problem 2: Implement batch gradient descent in Python and plot the loss function J(theta) over 1000 iterations.
Submit your Jupyter notebook to Canvas. Do not collaborate with other students.
"""

print("--- Testing Real Resume ---")
res1 = classify_document(resume_sample)
print(json.dumps(res1, indent=2))

print("\n--- Testing Homework Assignment ---")
res2 = classify_document(assignment_sample)
print(json.dumps(res2, indent=2))
