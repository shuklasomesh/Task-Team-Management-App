# Railway Deployment Guide
## Task & Team Management App (Spring Boot + React + PostgreSQL)

---

## What's in this folder

| File | What to do with it |
|------|-------------------|
| `frontend/Dockerfile` | **Replace** `frontend/Dockerfile` in your repo |
| `frontend/nginx.conf` | **Replace** `frontend/nginx.conf` in your repo |
| `frontend/docker-entrypoint.sh` | **Add** this new file to `frontend/` in your repo |
| `backend/application.properties` | **Replace** `backend/src/main/resources/application.properties` in your repo |

After copying these 4 files, push to GitHub, then follow the steps below.

---

## Bugs fixed

### 1. nginx env var substitution (frontend)
Your `nginx.conf` uses `$BACKEND_URL` at runtime, but nginx cannot read OS environment
variables by itself. The fix uses `envsubst` inside a startup script to inject the value
before nginx launches.

### 2. `ddl-auto=validate` (backend)
Railway starts with a blank PostgreSQL database — no tables exist yet.
`validate` tells Spring Boot to verify tables exist and crashes immediately.
Changed to `${DDL_AUTO:update}` so Spring Boot auto-creates tables on first boot.
You can set `DDL_AUTO=validate` via Railway env vars after the first successful deploy.

---

## Step-by-step Railway deployment

### Prerequisites
- Railway account at https://railway.app
- Your repo pushed to GitHub with the 4 fixed files above

---

### Step 1 — Create a new Railway project

1. Go to https://railway.app → **New Project**
2. Choose **Empty Project**

---

### Step 2 — Add PostgreSQL database

1. Inside your project click **+ New** → **Database** → **Add PostgreSQL**
2. Railway provisions a Postgres instance and auto-sets these internal variables:
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `DATABASE_URL`
3. No extra config needed — the backend will reference these.

---

### Step 3 — Deploy the Backend (Spring Boot)

1. Click **+ New** → **GitHub Repo** → select `Task-Team-Management-App`
2. Railway detects the repo root. Set **Root Directory** → `backend`
3. Railway will use `backend/Dockerfile` and `backend/railway.toml` automatically.

#### Backend environment variables
Go to your backend service → **Variables** tab → add these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
| `DATABASE_USERNAME` | `${{Postgres.PGUSER}}` |
| `DATABASE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `JWT_SECRET` | Any long random string, e.g. `a1b2c3d4e5f6...` (min 32 chars) |
| `CORS_ORIGINS` | `http://localhost:5173` *(update after frontend is deployed — see Step 5)* |

> **Note on DATABASE_URL format**: Railway's `${{Postgres.DATABASE_URL}}` gives
> `postgresql://user:pass@host/db` (no `jdbc:` prefix). Spring Boot needs the JDBC format,
> so use the individual vars above to build it manually.

4. Click **Deploy** — wait for the build (3-5 min first time).
5. Once green, click your service → **Settings** → **Networking** → **Generate Domain**.
   Copy the URL, e.g. `https://backend-xxx.up.railway.app` — you'll need it in Step 4.

---

### Step 4 — Deploy the Frontend (React + Vite + nginx)

1. Click **+ New** → **GitHub Repo** → same repo
2. Set **Root Directory** → `frontend`
3. Railway uses `frontend/Dockerfile` and `frontend/railway.toml` automatically.

#### Frontend environment variables
Go to your frontend service → **Variables** tab → add:

| Variable | Value | When used |
|----------|-------|-----------|
| `BACKEND_URL` | `https://backend-xxx.up.railway.app` *(your backend URL from Step 3)* | Runtime (nginx proxy) |
| `VITE_API_URL` | `/api` | Build time (Vite bundles this in) |

> `VITE_API_URL=/api` tells axios to send requests to `/api/...` on the same domain.
> nginx then proxies those to your Spring Boot backend via `BACKEND_URL`.

4. Click **Deploy** — wait for the build.
5. Once green, **Settings** → **Networking** → **Generate Domain**.
   Copy the URL e.g. `https://frontend-xxx.up.railway.app`

---

### Step 5 — Update CORS on the backend

Now that you have the frontend URL:

1. Go to your **backend** service → **Variables**
2. Update `CORS_ORIGINS`:
   ```
   https://frontend-xxx.up.railway.app
   ```
   (If you want to keep local dev working too, comma-separate:
   `https://frontend-xxx.up.railway.app,http://localhost:5173`)
3. Railway redeploys automatically.

---

### Step 6 — Verify everything works

Open your frontend Railway URL in the browser.

- Login / Register should work
- Check browser DevTools → Network tab: `/api/` calls should return 200
- If you see CORS errors → double-check `CORS_ORIGINS` in the backend vars
- If the backend crashes on startup → check logs; most likely a DB connection issue

---

## After first successful deploy (optional cleanup)

Once all tables are created and the app is working:

1. Go to backend **Variables** → add `DDL_AUTO` = `validate`
2. This prevents Spring Boot from accidentally altering your schema on future deploys.

---

## Summary of all Railway env vars

### Backend service
| Variable | Example value |
|----------|--------------|
| `DATABASE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
| `DATABASE_USERNAME` | `${{Postgres.PGUSER}}` |
| `DATABASE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `JWT_SECRET` | `super-secret-random-string-32chars+` |
| `CORS_ORIGINS` | `https://frontend-xxx.up.railway.app` |
| `DDL_AUTO` | `update` (first deploy) → `validate` (after) |

### Frontend service
| Variable | Example value |
|----------|--------------|
| `BACKEND_URL` | `https://backend-xxx.up.railway.app` |
| `VITE_API_URL` | `/api` |

---

## Troubleshooting

**Backend won't start — "relation does not exist"**
→ Make sure `DDL_AUTO` is not set (defaults to `update`) on first deploy.

**Frontend shows blank page / 502 on /api calls**
→ Check `BACKEND_URL` is set correctly on the frontend service (no trailing slash).

**CORS error in browser**
→ Update `CORS_ORIGINS` on the backend to include your exact frontend Railway URL.

**Backend build fails — jar not found**
→ The `pom.xml` has `<finalName>task-manager-backend</finalName>` and Dockerfile copies
`task-manager-backend.jar` — this is already correct, no changes needed.

**WebSocket / chat not working**
→ Add WebSocket upgrade headers to nginx.conf if you add real-time features:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
