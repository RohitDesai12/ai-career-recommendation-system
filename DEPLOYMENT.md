# Career Compass — Free Cloud Deployment Guide

This guide provides instructions for deploying Career Compass across free hosting platforms.

---

## Architecture Overview

```
                      ┌────────────────────────┐
                      │   Vercel / Netlify     │
                      │  (Frontend React SPA)  │
                      └───────────┬────────────┘
                                  │ HTTPS
                                  ▼
                      ┌────────────────────────┐
                      │    Render / Railway    │
                      │   (Node.js REST API)   │
                      └─────┬────────────┬─────┘
                            │            │
             MongoDB Driver │            │ HTTP REST
                            ▼            ▼
             ┌─────────────────┐  ┌───────────────────────┐
             │  MongoDB Atlas  │  │ Render / HuggingFace  │
             │   (Free M0 DB)  │  │   (FastAPI ML Svc)    │
             └─────────────────┘  └───────────────────────┘
```

---

## 1. Database — MongoDB Atlas (Free Tier)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster (shared 512MB, free forever).
3. Under **Security → Database Access**, create a database user (e.g., `career_user`) with password authentication.
4. Under **Security → Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) so cloud hosting platforms can connect.
5. Under **Deployments → Databases**, click **Connect → Drivers (Node.js)** and copy your connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/career_compass?retryWrites=true&w=majority
   ```

---

## 2. Backend — Render (Free Tier)

1. Sign up at [render.com](https://render.com) using your GitHub account.
2. Click **New + → Web Service**.
3. Select your repository: `ai-career-recommendation-system`.
4. Configure the service settings:
   - **Name**: `career-compass-backend`
   - **Region**: Closest to your users (e.g., Singapore / Frankfurt / Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend` (or leave blank; the repository root package.json automatically redirects to backend)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/health`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/career_compass?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *A secure random string (e.g. `career_compass_prod_secret_2026_x99` or generated via `openssl rand -hex 32`). Must NOT be default.* |
   | `GROQ_API_KEY` | *Your Groq API Key* |
   | `ALLOWED_ORIGINS` | `http://localhost:5173,https://<your-frontend-domain>.vercel.app` |
   | `ML_SERVICE_URL` | `https://career-compass-ml-q4f2.onrender.com` |
   | `PORT` | *Optional (Render automatically assigns port 10000)* |
6. Click **Create Web Service**. Once deployed, copy the backend URL (e.g., `https://career-compass-backend-jvwf.onrender.com`).

---

## 3. Frontend — Vercel (Free Tier)

1. Sign up at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New… → Project**.
3. Import `ai-career-recommendation-system`.
4. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://<your-backend-name>.onrender.com/api` |
6. Click **Deploy**.
7. Once deployed, copy your production frontend URL (e.g., `https://career-compass.vercel.app`) and update the `ALLOWED_ORIGINS` variable on your Render backend service.

> [!NOTE]
> Client-side SPA routing rewrites are pre-configured in `frontend/vercel.json` and `frontend/public/_redirects` to ensure page reloads (e.g. `/resume-studio`, `/dashboard`, `/jobs`) never return 404 errors.

---

## 4. Python ML Service Deployment (V8 Recommendation Engine)

The Career Compass ML service is powered by the **V8 HistGradientBoosting Pipeline** (`career_model_v8.pkl`, ~2.9 MB, 35 career classes, 20 canonical input features) along with the **Resume Analyzer** (`resume_model.pkl`). Because the V8 pipeline is compact (~2.9 MB), it runs within free-tier cloud memory (e.g. Render 512 MB RAM) without OOM issues or heavy memory constraints.

### Option A: Render / Railway Free Tier (Recommended)

1. In Render, click **New + → Web Service**.
2. Select your repository: `ai-career-recommendation-system`.
3. Configure the service settings:
   - **Name**: `career-compass-ml`
   - **Root Directory**: `ml-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` (512 MB RAM)
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `GROQ_API_KEY` | *Your Groq API key* | Used for LLM-based resume extraction and classification |
   | `HF_REPO_ID` | `rohitdesai205/compass` | Private Hugging Face repository containing model artifacts |
   | `HF_MODEL_FILENAME` | `career_model_v8.pkl` | Model filename in Hugging Face repository |
   | `HF_METADATA_FILENAME` | `career_model_v8_metadata.json` | Metadata filename in Hugging Face repository |
   | `HF_RESUME_MODEL_FILENAME` | `resume_model.pkl` | Resume classifier filename in Hugging Face repository |
   | `HF_RESUME_ENCODERS_FILENAME` | `resume_encoders.pkl` | Resume encoders filename in Hugging Face repository |
   | `HF_RESUME_META_FILENAME` | `resume_model_meta.json` | Resume metadata filename in Hugging Face repository |
   | `HF_TOKEN` | *hf_...* | Hugging Face Access Token with read permissions |
   | `USE_LOCAL_V8_MODEL` | `false` | Set to true only in local dev to force local file loading |
   | `RESUME_MODEL_URL` | *(optional)* | Hugging Face or R2 URL to download `resume_model.pkl` if hosted externally |
5. Click **Create Web Service**.
6. Once deployed, copy the ML service URL (e.g., `https://career-compass-ml.onrender.com`) and paste it as `ML_SERVICE_URL` in your backend Render service.

---

### Option B: Hugging Face Spaces (Free 16 GB RAM & 2 vCPUs)

For running in a dedicated AI microservice container on Hugging Face:

1. Sign up or log in at [huggingface.co](https://huggingface.co).
2. Click **New Space** ([huggingface.co/new-space](https://huggingface.co/new-space)).
   - **Space Name**: `career-compass-ml`
   - **License**: `mit`
   - **Space SDK**: **Docker** (Blank)
   - **Hardware**: **CPU basic • 2 vCPU • 16 GB RAM • Free**
3. Clone your new Hugging Face Space repository locally:
   ```bash
   git clone https://huggingface.co/spaces/<your-username>/career-compass-ml
   ```
4. Copy the contents of the `ml-service/` directory into your Space folder, including `Dockerfile`, `main.py`, `model_manager.py`, `requirements.txt`, and model files.
5. Push to Hugging Face:
   ```bash
   cd career-compass-ml
   git add .
   git commit -m "feat: deploy Career Compass V8 ML service"
   git push origin main
   ```
6. Your public URL will be:
   ```
   https://<your-username>-career-compass-ml.hf.space
   ```
7. Set this URL as `ML_SERVICE_URL` in your Render Backend environment variables.

---

## 5. Health & Telemetry Verification

After deployment, verify that each service is communicating properly:

### 1. ML Service Health Check
Query your deployed ML service directly:
```bash
curl https://<your-ml-service>.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "service": "career-compass-ml",
  "active_engine": "v8",
  "models": {
    "career_engine": {
      "engine": "v8",
      "model_name": "Career Compass V8 - HistGradientBoosting",
      "available": true,
      "classes_count": 35,
      "features_count": 20
    },
    "resume_model": {
      "loaded": true,
      "file_present": true,
      "file_size_bytes": 935912,
      "storage": "huggingface",
      "repository": "rohitdesai205/compass",
      "encoders_loaded": true,
      "metadata_loaded": true
    }
  }
}
```

### 2. Backend Proxy Health Check
Query the backend to verify it connects to the ML service:
```bash
curl https://<your-backend>.onrender.com/api/ml/model-status
```

---

## 6. Complete Environment Variables Summary

### Frontend (`frontend/.env`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://<backend>.onrender.com/api` | Base URL for REST API calls |

### Backend (`backend/.env`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `production` | Production mode |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | *random 32-byte hex* | JWT signing secret |
| `ML_SERVICE_URL` | `https://<ml-service>.onrender.com` | Base URL for ML service |
| `GROQ_API_KEY` | *gsk_...* | Groq API key for job matching & AI assistant |
| `ALLOWED_ORIGINS` | `https://<frontend>.vercel.app` | Allowed CORS origins (comma-separated) |

### ML Service (`ml-service/.env`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | *gsk_...* | Groq API key for resume parsing & LLM classification |
| `HF_REPO_ID` | `rohitdesai205/compass` | Private Hugging Face repository containing model artifacts |
| `HF_MODEL_FILENAME` | `career_model_v8.pkl` | Model filename in Hugging Face repository |
| `HF_METADATA_FILENAME` | `career_model_v8_metadata.json` | Metadata filename in Hugging Face repository |
| `HF_RESUME_MODEL_FILENAME` | `resume_model.pkl` | Resume classifier filename in Hugging Face repository |
| `HF_RESUME_ENCODERS_FILENAME` | `resume_encoders.pkl` | Resume encoders filename in Hugging Face repository |
| `HF_RESUME_META_FILENAME` | `resume_model_meta.json` | Resume metadata filename in Hugging Face repository |
| `HF_TOKEN` | *hf_...* | Hugging Face Access Token with read permissions |
| `USE_LOCAL_V8_MODEL` | `false` | Set to true only in local dev to force local file loading |
| `RESUME_MODEL_URL` | *(optional)* | Hugging Face or R2 URL to download `resume_model.pkl` if hosted externally |
| `MODEL_DOWNLOAD_TIMEOUT`| `300` | Download timeout in seconds |

