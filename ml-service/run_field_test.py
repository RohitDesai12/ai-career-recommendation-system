import urllib.request
import json

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

def test_resume(text, branch, role):
    body = bytearray()
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="branch"\r\n\r\n{branch}\r\n'.encode('utf-8'))
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="jobRole"\r\n\r\n{role}\r\n'.encode('utf-8'))
    
    # minimal PDF
    pdf_content = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length {len(text) + 50} >>
stream
BT
/F1 12 Tf
50 700 Td
({text.replace(chr(10), ') Tj T* (')}) Tj
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
    
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n'.encode('utf-8'))
    body.extend(pdf_content.encode('latin1'))
    body.extend(f'\r\n--{boundary}--\r\n'.encode('utf-8'))
    
    req = urllib.request.Request(
        'http://localhost:8000/api/analyze-resume',
        data=bytes(body),
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

cs_text = "John Doe | email: john@example.com | EDUCATION: B.Tech Computer Science 2025 | SKILLS: Python, React, JavaScript, SQL, Git, Docker, FastApi | EXPERIENCE: Software Intern at Tech Corp (6 months) | PROJECTS: Built AI Platform"

print("CS Resume + CS Branch:")
r1 = test_resume(cs_text, "Computer Science & Engineering", "Software Development Engineer")
print(json.dumps(r1.get("field_match"), indent=2))

print("\nCS Resume + Civil Branch:")
r2 = test_resume(cs_text, "Civil Engineering", "Structural Design Engineer")
print(json.dumps(r2.get("field_match"), indent=2))
