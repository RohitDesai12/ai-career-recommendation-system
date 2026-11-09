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
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *A secure random string (e.g. generated via `openssl rand -hex 32`)* |
   | `GROQ_API_KEY` | *Your Groq API Key* |
   | `ALLOWED_ORIGINS` | `http://localhost:5173,https://<your-frontend-domain>.vercel.app` |
   | `ML_SERVICE_URL` | *Your ML service URL (or leave empty to use built-in fallback)* |
6. Click **Create Web Service**. Once deployed, copy the backend URL (e.g., `https://career-compass-backend.onrender.com`).

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

## 4. Python ML Service Deployment Options

### Option A: Standalone Web Service on Render (Free Tier)
1. In Render, click **New + → Web Service**.
2. Select repository, set **Root Directory** to `ml-service`.
3. Set **Runtime**: `Python 3`.
4. Set **Build Command**: `pip install -r requirements.txt`.
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
6. Add environment variable:
   - `GROQ_API_KEY`: *Your Groq API key*

> [!IMPORTANT]
> The `career_model_v3.pkl` model file is ~1.88 GB and is excluded from Git. If hosting `ml-service` in a 512MB RAM free container, `main.py` is pre-configured with a graceful fallback (`if not career_model: return ...`) so the service functions seamlessly without crashing. For full model predictions in cloud production, consider hosting on a Hugging Face Space (Free 16GB RAM) or downloading the model from cloud object storage (Cloudflare R2 / AWS S3) upon container boot.

