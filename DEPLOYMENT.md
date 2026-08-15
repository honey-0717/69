# HotHarini69 Production Deployment Guide

This document provides step-by-step instructions for deploying the **HotHarini69** platform (Next.js Frontend + Express Node.js Backend + Supabase PostgreSQL Database) to production environments.

---

## 1. Required Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `SUPABASE_URL` | Hosted Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Backend Only) | `eyJhbG...` |
| `DATABASE_URL` | Supabase Direct PostgreSQL Connection String | `postgresql://postgres:pass@db.your-project.supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret key for signing admin session tokens | `random_secure_secret_key` |
| `FRONTEND_URL` | Production URL of the Next.js frontend | `https://your-frontend-domain.com` |
| `CORS_ORIGIN` | Allowed origin for CORS headers | `https://your-frontend-domain.com` |

> [!CAUTION]
> NEVER expose `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` in frontend code or commit them to source control.

---

### Frontend Environment Variables (`frontend/.env`)

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | Public production URL of Express API backend | `https://api.your-domain.com` |
| `BACKEND_INTERNAL_URL` | Internal backend URL (for Docker / server-side rewrites) | `http://backend:5000` |

---

## 2. Deployment Architecture Options

### Option A: Cloud Managed Deployment (Recommended)

#### 1. Database (Supabase PostgreSQL)
- Ensure all required tables (`profile`, `categories`, `services`, `reviews`, `payment_methods`, `social_contacts`, `terms`, `message_template`) are created in your Supabase project.
- Retrieve the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard -> **Project Settings** -> **API**.

#### 2. Backend Deployment (Render / Railway / Fly.io)
1. Connect your repository to your cloud hosting platform.
2. Select **Root Directory**: `backend`
3. Configure Build Settings:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/server.js`
4. Set Environment Variables as listed in Section 1.
5. Note the assigned Backend URL (e.g. `https://hotharini69-backend.onrender.com`).

#### 3. Frontend Deployment (Vercel / Netlify)
1. Import repository to Vercel/Netlify.
2. Select **Root Directory**: `frontend`
3. Configure Build Settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Set Environment Variable:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://hotharini69-backend.onrender.com`
5. Click **Deploy**.

---

### Option B: Docker Compose Deployment (VPS / EC2 / Hetzner)

1. Clone repository to host server:
   ```bash
   git clone <your-repo-url>
   cd 69
   ```

2. Create `.env` file in the root directory with production values:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://postgres:pass@db.your-project.supabase.co:5432/postgres
   JWT_SECRET=your_production_jwt_secret
   FRONTEND_URL=https://your-frontend-domain.com
   NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
   ```

3. Run Docker Compose in detached mode:
   ```bash
   docker-compose up -d --build
   ```

4. Verify service logs:
   ```bash
   docker-compose logs -f
   ```

---

## 3. Health Checks & Verification

- **Backend Health Check**: `GET /api/health`
  - Returns `{"status":"ok","database":"connected","timestamp":"..."}`
- **Public Data API**: `GET /api/public-data`
  - Returns current live services, profile, reviews, and template configuration.
- **Admin Verification**:
  - Access `/admin/login`
  - Test profile, service CRUD, availability, and message template mutations.
  - Verify changes persist across server restarts.

---

## 4. Troubleshooting & Maintenance

- **CORS Errors**: Verify `FRONTEND_URL` in backend exactly matches the protocol and domain of the frontend application (e.g. `https://yourdomain.com` without trailing slash).
- **Port Conflict (`EADDRINUSE`)**: Ensure no orphaned process is occupying port 5000 before running `npm start`.
- **Database Connection Failure**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured properly and network connection to Supabase is active.
