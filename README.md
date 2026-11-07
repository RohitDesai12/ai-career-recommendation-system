# Career Compass — AI-Powered Career Intelligence Platform

Career Compass is an end-to-end, production-ready AI Career Intelligence Platform designed to guide students from self-discovery to career readiness and employment.

---

## 🚀 Key Modules & Capabilities

### 1. Job Discovery & Live ATS Ingestion
- **Automated Ingestion**: Live integrations with Greenhouse and Lever posting APIs alongside verified direct career portals.
- **Geographical Filtering**: Dedicated discovery scopes for India 🇮🇳, International 🌎, and Remote Worldwide 🌐.
- **Job Matching & Deduplication**: Smart deduplication, title normalization, and profile-based relevance scoring.
- **Application Tracking**: Real-time status pipeline (*Saved*, *Applied*, *Interviewing*, *Offered*).

### 2. Personalized AI Learning Hub
- Curated course recommendations linked to student skill gaps, target job roles, and career test results.
- Multi-provider catalog (Coursera, Udemy, edX, YouTube, community guides).
- Interactive progress tracking, active learning path roadmaps, and bookmarking.

### 3. Professional Student Profile & Portfolio
- Complete academic, technical skills, projects, and certification portfolio.
- Public, shareable portfolio views (`/portfolio/:id`) with custom privacy controls.

### 4. AI Resume Studio & Analyzer
- Deterministic ATS score analysis with keyword gap identification.
- 8 modern ATS-friendly templates with real-time live preview.
- AI-tailoring for job descriptions and cover letter generator with 10 custom tones.

### 5. Practice & Coaching
- **AI Mock Interview**: Multi-turn conversational voice & technical panel practice powered by Groq LLM.
- **Interview Prep Guide**: Company-wise question banks across DSA, System Design, and Behavioral rounds.

### 6. Legal, Privacy & Security Trust Center
- Comprehensive public legal center (Privacy Policy, Terms, Cookie Policy, AI Transparency, Security Policy, Data Deletion, FAQs).
- **Cookie Consent Management**: Compliant banner with granular controls and Global Privacy Control (GPC / DNT) detection.
- **Data Portability & Deletion**: Self-service GDPR/DPDP-aligned JSON data export and account deletion workflows.
- **Dual-Layer Authentication**: HttpOnly secure session cookies combined with Authorization headers.
- **Security Protections**: Native brute-force rate limiting, Helmet-style security headers, and CORS origin validation.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Career Compass Architecture                 │
├───────────────────────┬─────────────────────────────────────┤
│ Frontend              │ React 18, Vite, TypeScript,         │
│                       │ Tailwind CSS, Motion/React          │
├───────────────────────┼─────────────────────────────────────┤
│ Backend API           │ Node.js, Express.js (Port 5000)     │
├───────────────────────┼─────────────────────────────────────┤
│ Database              │ MongoDB (Mongoose ODM)              │
├───────────────────────┼─────────────────────────────────────┤
│ Machine Learning & AI │ Python ML Service, Groq LLM API     │
└───────────────────────┴─────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or connection URI
- Python 3.10+ (for ML service)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛡️ Security & Privacy
- **No Third-Party Trackers**: 0 commercial ad networks or profiling pixels.
- **GPC Honored**: Browsers signaling Global Privacy Control automatically disable optional cookies.
- **Credentials Protection**: All API keys and database credentials reside strictly in local `.env` files (excluded by `.gitignore`).

---

## 📄 License
This project is proprietary and confidential. All rights reserved.
