const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testClassifier(docText) {
  const prompt = `You are an expert document classifier.
Determine whether the following extracted document text is a genuine candidate resume or curriculum vitae (CV).

CRITICAL RULES:
1. Ignore and never trust the filename or external hints. Focus purely on the semantic content of the document text.
2. A genuine resume outlines a specific person's qualifications, education history, technical/soft skills, projects, or work history.
3. Documents that are NOT resumes include: homework assignments, syllabi, lecture notes, essays, research papers, invoices, recipes, generic articles, user manuals, code-only files without personal credentials, etc.
4. If it is NOT a resume:
   - set "document_type": "not_resume"
   - explain clearly why in "explanation".
5. If it IS a genuine resume:
   - set "document_type": "resume"
   - extract candidate_name (or null), career_domain, and booleans for has_experience, has_skills, has_education.

Document text snippet (first 3000 chars):
"""
${docText.substring(0, 3000)}
"""

Return strictly a valid JSON object matching this schema:
{
  "document_type": "resume" | "not_resume",
  "confidence": 0.94,
  "candidate_name": "John Doe" | null,
  "career_domain": "Software Development" | "Not applicable",
  "has_experience": true | false,
  "has_skills": true | false,
  "has_education": true | false,
  "explanation": "Clear explanation of why this document is or is not a resume"
}`;

  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.1
  }, {
    headers: {
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return JSON.parse(res.data.choices[0].message.content);
}

const resume = `John Doe
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
AI Recommendation Engine - Built collaborative filtering system using PyTorch and Scikit-Learn.`;

const homework = `Machine Learning Homework 3: Linear Regression and Gradient Descent
Course: CS 229 - Spring 2024
Due Date: October 15, 2024

Problem 1: Derive the normal equation for linear regression with L2 regularization (Ridge regression).
Show that theta = (X^T X + lambda I)^-1 X^T y.

Problem 2: Implement batch gradient descent in Python and plot the loss function J(theta) over 1000 iterations.
Submit your Jupyter notebook to Canvas. Do not collaborate with other students.`;

(async () => {
  console.log('--- Testing Resume ---');
  const r1 = await testClassifier(resume);
  console.log(JSON.stringify(r1, null, 2));

  console.log('\n--- Testing Homework Assignment ---');
  const r2 = await testClassifier(homework);
  console.log(JSON.stringify(r2, null, 2));
})();
