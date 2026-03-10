# VentureBridge Monorepo

This repo is organized as a Turborepo with separate apps for marketing, portals, and APIs.

## Apps
- `apps/website` — Static marketing + SEO site (Next.js).
- `apps/investor-portal` — Investor web app (Next.js).
- `apps/startup-portal` — Startup web app (Next.js).
- `apps/admin-portal` — Admin web app (Next.js).
- `apps/investor-api` — Investor backend (FastAPI).
- `apps/startup-api` — Startup backend (FastAPI).
- `apps/admin-api` — Admin backend (FastAPI).

## Local Development
Install JS deps (root):
```bash
npm install
```

Run all Next.js apps with Turborepo:
```bash
npm run dev
```

Run a single portal:
```bash
npm run dev -- --filter=investor-portal
```

Run APIs (separately):
```bash
cd apps/investor-api
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Repeat for startup/admin APIs on ports `8002` and `8003`.

## Auth + DB (Planned)
- Auth: Website-hosted auth API (Next.js route handlers) issuing JWTs
- DB: Shared Postgres (local), later NeonDB or equivalent

## Auth Flow (Prototype)
- `apps/website` exposes `/api/auth/register` and `/api/auth/login`
- Returns JWT with `portal`, `role`, `approved`
- Portals accept JWT via `/signin?token=...` and store it in `vb_token`
- Each portal has middleware that validates JWT + portal match

Environment templates will be added once auth wiring starts.
