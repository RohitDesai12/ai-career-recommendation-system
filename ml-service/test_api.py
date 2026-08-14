import requests
url = "http://localhost:8000/api/recommend"
data = {
 "branch": "CSE",
 "cgpa": 8.3,
 "programming_skill": 9,
 "ai_interest": 8,
 "cloud_knowledge": 6
}
response = requests.post(url, json=data)
with open('test_out.txt', 'w', encoding='utf-8') as f:
    f.write(f"Status: {response.status_code}\n")
    f.write(f"Response: {response.json()}\n")
