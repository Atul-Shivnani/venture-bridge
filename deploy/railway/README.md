# Railway Deployment Guide

## Overview

7 services, all deployed as Docker containers in one Railway project:

| Service | Type | Public URL | Internal URL |
|---|---|---|---|
| `website` | Next.js | `https://vc-website.up.railway.app` | — |
| `startup-portal` | Next.js | `https://vc-startup.up.railway.app` | — |
| `investor-portal` | Next.js | `https://vc-investor.up.railway.app` | — |
| `admin-portal` | Next.js | `https://vc-admin.up.railway.app` | — |
| `startup-api` | FastAPI | *(no public URL needed)* | `http://startup-api.railway.internal:8000` |
| `investor-api` | FastAPI | *(no public URL needed)* | `http://investor-api.railway.internal:8000` |
| `admin-api` | FastAPI | *(no public URL needed)* | `http://admin-api.railway.internal:8000` |

> The subdomains above are suggestions — replace `vc-` with whatever you like.
> Railway assigns `<your-chosen-name>.up.railway.app`.

---

## Prerequisites

- Railway account at [railway.app](https://railway.app) (free Hobby plan works)
- Repo pushed to GitHub (Railway pulls from GitHub)
- Your Neon `DATABASE_URL` and `AUTH_SECRET` handy

---

## Step 1 — Create the Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Empty project**
3. Name it `venturebridge` (top-left)

---

## Step 2 — Add all 7 services (repeat for each)

For **each** service in the table below, do the following:

1. In the Railway project canvas, click **+ New → GitHub Repo**
2. Select this repository
3. Railway will ask for a service name — use the names in the table
4. In service **Settings → Build**:
   - Set **Config file path** to the path in the "Config file" column
   - This tells Railway to use our pre-written `railway.toml` for that service
5. Do **NOT** deploy yet — click **Save** only

| Service name (exact) | Config file path |
|---|---|
| `website` | `deploy/railway/website.toml` |
| `startup-portal` | `deploy/railway/startup-portal.toml` |
| `investor-portal` | `deploy/railway/investor-portal.toml` |
| `admin-portal` | `deploy/railway/admin-portal.toml` |
| `startup-api` | `deploy/railway/startup-api.toml` |
| `investor-api` | `deploy/railway/investor-api.toml` |
| `admin-api` | `deploy/railway/admin-api.toml` |

> **Why not deploy yet?** The Next.js `NEXT_PUBLIC_*` URLs are baked into the
> build at compile time. We need to know the final URLs before building.

---

## Step 3 — Set subdomains for the 4 Next.js services

For each of the 4 Next.js services (`website`, `startup-portal`, `investor-portal`, `admin-portal`):

1. Click the service → **Settings → Networking → Public Networking**
2. Click **Generate Domain** then immediately click the pencil icon to rename it
3. Set a custom subdomain (e.g. `vc-website`, `vc-startup`, `vc-investor`, `vc-admin`)
4. Write down all 4 final URLs — you'll need them for the next step

The Python API services (`startup-api`, `investor-api`, `admin-api`) do **not** need public URLs — they communicate privately inside Railway.

---

## Step 4 — Set environment variables for each service

Click each service → **Variables** tab → **+ Add variable**

### `website`
```
DATABASE_URL        = <your Neon PostgreSQL URL>
AUTH_SECRET         = <your shared JWT secret>
PORT                = 3000
NEXT_PUBLIC_STARTUP_PORTAL_URL   = https://vc-startup.up.railway.app
NEXT_PUBLIC_INVESTOR_PORTAL_URL  = https://vc-investor.up.railway.app
NEXT_PUBLIC_ADMIN_PORTAL_URL     = https://vc-admin.up.railway.app
```

### `startup-portal`
```
AUTH_SECRET               = <same JWT secret>
PORTAL_NAME               = startup
PORT                      = 3002
NEXT_PUBLIC_WEBSITE_URL   = https://vc-website.up.railway.app
STARTUP_API_URL           = http://startup-api.railway.internal:8000
```

### `investor-portal`
```
AUTH_SECRET               = <same JWT secret>
PORTAL_NAME               = investor
PORT                      = 3001
NEXT_PUBLIC_WEBSITE_URL   = https://vc-website.up.railway.app
INVESTOR_API_URL          = http://investor-api.railway.internal:8000
```

### `admin-portal`
```
AUTH_SECRET               = <same JWT secret>
PORTAL_NAME               = admin
PORT                      = 3003
NEXT_PUBLIC_WEBSITE_URL   = https://vc-website.up.railway.app
ADMIN_API_URL             = http://admin-api.railway.internal:8000
```

### `startup-api`
```
DATABASE_URL    = <same Neon PostgreSQL URL>
AUTH_SECRET     = <same JWT secret>
PORT            = 8000
CORS_ORIGINS    = https://vc-startup.up.railway.app
```

### `investor-api`
```
DATABASE_URL    = <same Neon PostgreSQL URL>
AUTH_SECRET     = <same JWT secret>
PORT            = 8000
CORS_ORIGINS    = https://vc-investor.up.railway.app
```

### `admin-api`
```
DATABASE_URL    = <same Neon PostgreSQL URL>
AUTH_SECRET     = <same JWT secret>
PORT            = 8000
CORS_ORIGINS    = https://vc-admin.up.railway.app
```

---

## Step 5 — Deploy in order

Deploy services in this order to avoid startup errors:

1. **`startup-api`**, **`investor-api`**, **`admin-api`** — click Deploy on all three simultaneously
2. Wait for all three health checks to pass (`/health` returns `{"status":"ok"}`)
3. **`startup-portal`**, **`investor-portal`**, **`admin-portal`** — deploy all three
4. **`website`** last (it imports all portal URLs)

To trigger a deploy: click the service → **Deploy** button (or push a commit to `main`).

---

## Step 6 — Verify

1. Open `https://vc-website.up.railway.app` — marketing site should load
2. Register a startup account → you should be redirected to `vc-startup.up.railway.app`
3. Check Railway logs if anything fails: service → **Deployments → View Logs**

---

## Ongoing deploys

Railway watches your `main` branch. Every push triggers a rebuild of all services automatically. Build time is ~3-5 minutes per service (they build in parallel).

---

## Free tier limits

Railway Hobby plan: **$5/month free credit**. For a demo with low traffic this comfortably covers all 7 services. If you hit the limit, Railway will pause deployments until next billing cycle (services stay up until credit runs out).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Portal redirects to website `/signin` loop | `PORTAL_NAME` mismatch or wrong `AUTH_SECRET` | Check env vars match exactly |
| API calls fail (null data everywhere) | Private networking URL wrong | Confirm `STARTUP_API_URL=http://startup-api.railway.internal:8000` (exact service name) |
| Build fails with "NEXT_PUBLIC_WEBSITE_URL is not set" | Env var missing at build time | Add it in Railway Variables, then redeploy |
| FastAPI 500 on DB queries | `DATABASE_URL` wrong or Neon connection limit | Check Neon dashboard, verify URL |
