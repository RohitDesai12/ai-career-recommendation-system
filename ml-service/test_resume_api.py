import pypdf
import io
import urllib.request
import json

# Generate PDF with text
def create_pdf_bytes(text: str) -> bytes:
    # Use pypdf with a simple page or reportlab/fpdf or minimal pdf structure
    # Minimal PDF structure:
    pdf_template = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length {len(text) + 50} >>
stream
BT
/F1 12 Tf
50 700 Td
({text.replace("(", "").replace(")", "").replace("\n", ") Tj T* (")}) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
425
%%EOF"""
    return pdf_template.encode('latin1')

# Test with requests or multipart
import urllib.request

def test_endpoint(file_bytes: bytes, filename: str, branch: str, role: str):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    
    # branch
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="branch"\r\n\r\n{branch}\r\n'.encode('utf-8'))
    # jobRole
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="jobRole"\r\n\r\n{role}\r\n'.encode('utf-8'))
    # file
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: application/pdf\r\n\r\n'.encode('utf-8'))
    body.extend(file_bytes)
    body.extend(f'\r\n--{boundary}--\r\n'.encode('utf-8'))
    
    req = urllib.request.Request(
        'http://localhost:8000/api/analyze-resume',
        data=bytes(body),
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        }
    )
    
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode('utf-8'))

resume_text = """John Doe
Software Engineer | email: john@example.com
EDUCATION: B.Tech Computer Science 2025
SKILLS: Python, React, JavaScript, SQL, Git, Docker, FastApi
EXPERIENCE: Full Stack Intern at Tech Corp (6 months)
Developed REST APIs and optimized database queries.
PROJECTS: Built AI Recommendation Engine with Python."""

hw_text = """CS 229 Machine Learning Homework Assignment 2
Due Date: October 20
Problem 1: Derive the gradient of logistic loss function.
Problem 2: Train a decision tree model on iris dataset.
Submit your PDF report to the portal."""

print("1. Testing Real Resume (named my_doc.pdf)...")
pdf1 = create_pdf_bytes(resume_text)
res1 = test_endpoint(pdf1, "my_doc.pdf", "CSE", "Software Development Engineer")
print(json.dumps(res1, indent=2))

print("\n2. Testing Homework Assignment (deceptively named Resume_Final_2026.pdf)...")
pdf2 = create_pdf_bytes(hw_text)
res2 = test_endpoint(pdf2, "Resume_Final_2026.pdf", "CSE", "Software Development Engineer")
print(json.dumps(res2, indent=2))
