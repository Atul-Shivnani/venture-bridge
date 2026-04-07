# VentureBridge

A VC deal-flow SaaS platform connecting startups, investors, and admins. Built as a Turborepo monorepo with Next.js portals, FastAPI data services, and a shared PostgreSQL database.

---

## Architecture Overview

```
apps/
  website/          Next.js  ── port 3000 ── marketing site, auth API (register/login), Prisma
  startup-portal/   Next.js  ── port 3002 ── startup dashboard, pipeline, data room, tasks
  investor-portal/  Next.js  ── port 3001 ── dealflow, diligence, portfolio, watchlist
  admin-portal/     Next.js  ── port 3003 ── approvals, deals, diligence queue, analyst mgmt
  startup-api/      FastAPI  ── port 8002 ── data layer for startup-portal
  investor-api/     FastAPI  ── port 8001 ── data layer for investor-portal
  admin-api/        FastAPI  ── port 8003 ── data layer for admin-portal

packages/
  python-shared/    SQLAlchemy models, DB session, JWT auth (shared by all 3 APIs)
  ui/               Shared React components
  auth/             JWT utilities
  types/            Shared TypeScript types
```

**Critical rule:** Next.js portals are frontend-only — they never import Prisma or query the database. All data flows through the FastAPI services via HTTP.

```
Browser → Next.js portal (server component)
              │  Authorization: Bearer <vb_token>
              ▼
          FastAPI service (startup-api / investor-api / admin-api)
              │  SQLAlchemy (psycopg2)
              ▼
          PostgreSQL (shared Neon DB)
```

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** — a [Neon](https://neon.tech) free-tier instance works fine
- **npm** 9+

---

## Setup

### 1. Install Node dependencies

```bash
git clone <repo-url>
cd vc
npm install
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp apps/website/.env.example          apps/website/.env
cp apps/startup-portal/.env.example   apps/startup-portal/.env
cp apps/investor-portal/.env.example  apps/investor-portal/.env
cp apps/admin-portal/.env.example     apps/admin-portal/.env
cp apps/startup-api/.env.example      apps/startup-api/.env
cp apps/investor-api/.env.example     apps/investor-api/.env
cp apps/admin-api/.env.example        apps/admin-api/.env
```

**`apps/website/.env`**
```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
AUTH_SECRET=<64-char random hex — generate with: openssl rand -hex 32>
NEXT_PUBLIC_INVESTOR_PORTAL_URL=http://localhost:3001
NEXT_PUBLIC_STARTUP_PORTAL_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_PORTAL_URL=http://localhost:3003
```

**`apps/startup-portal/.env`**
```env
AUTH_SECRET=<same as website>
PORTAL_NAME=startup
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
STARTUP_API_URL=http://localhost:8002
NEXT_PUBLIC_STARTUP_API_URL=http://localhost:8002
```

**`apps/investor-portal/.env`**
```env
AUTH_SECRET=<same as website>
PORTAL_NAME=investor
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
INVESTOR_API_URL=http://localhost:8001
NEXT_PUBLIC_INVESTOR_API_URL=http://localhost:8001
```

**`apps/admin-portal/.env`**
```env
AUTH_SECRET=<same as website>
PORTAL_NAME=admin
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
ADMIN_API_URL=http://localhost:8003
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8003
```

**`apps/startup-api/.env`** / **`apps/investor-api/.env`** / **`apps/admin-api/.env`**
```env
DATABASE_URL=<same as website>
AUTH_SECRET=<same as website>
```

> `AUTH_SECRET` must be **identical** across all 7 services. It signs tokens in the website and verifies them everywhere else.

### 3. Push the database schema

```bash
cd apps/website
npx prisma db push      # creates all tables
npx prisma generate     # generates the Prisma client
```

> **Windows:** If `prisma generate` throws an EPERM error on `query_engine-windows.dll.node`, stop all running dev servers first, run the command, then restart.

### 4. Seed test data

```bash
cd apps/website
node scripts/seed.mjs
```

The seed script is idempotent — safe to run multiple times. It creates:

#### Test accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@venturebridge.com` | `admin123` |
| Startup | `maya@techflow.ai` | `password123` |
| Startup | `carlos@alphagrid.io` | `password123` |
| Startup | `priya@solarvista.com` | `password123` |
| Investor (approved) | `fund@alphaventures.com` | `password123` |
| Investor (approved) | `deals@horizoncap.com` | `password123` |
| Investor (approved) | `invest@greenfield.vc` | `password123` |
| Investor (pending) | `pending@newvc.com` | `password123` |

It also creates 3 deals, 5 investor–deal matches at various stages, 7 diligence items, and 5 documents.

---

## Running the Platform

### Start the Python APIs

Open three separate terminals — each API runs in its own venv:

```bash
# Terminal 1 — Startup API  (port 8002)
cd apps/startup-api
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8002

# Terminal 2 — Investor API  (port 8001)
cd apps/investor-api
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Terminal 3 — Admin API  (port 8003)
cd apps/admin-api
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8003
```

### Start the Next.js apps

From the repo root (all four portals in parallel):

```bash
npm run dev
```

Or individually:

```bash
npm run dev -- --filter=website          # localhost:3000
npm run dev -- --filter=startup-portal   # localhost:3002
npm run dev -- --filter=investor-portal  # localhost:3001
npm run dev -- --filter=admin-portal     # localhost:3003
```

### Verify everything works

With all services running:

```bash
cd apps/website
node scripts/verify.mjs
```

This hits every API endpoint, validates response shapes, and exits with code 1 on any failure.

---

## Portal Guide

### Admin Portal — `http://localhost:3003`

**Sign in:** `admin@venturebridge.com` / `admin123`

| Page | Capability |
|------|-----------|
| Dashboard | Pending approvals widget, open diligence summary, analyst workload |
| **Approvals** | Approve or reject investor registrations (approve `pending@newvc.com` to test the full investor flow) |
| **Deals** | View all deals; assign analysts; run investor matching; change deal status; analyst notes per deal; export CSV |
| **Diligence** | Full queue of all diligence items across deals — update status, assign to analyst, filter by status |
| **Compliance** | Flagged diligence items and flagged documents |
| **Analysts** | Add new admin/analyst accounts; remove existing analysts |
| Profile / Settings | Update profile and change password |

### Startup Portal — `http://localhost:3002`

**Sign in:** `maya@techflow.ai` / `password123`
(or register a new startup at `localhost:3000/register`)

| Page | Capability |
|------|-----------|
| Dashboard | KPI summary, top investor matches, priority task counts |
| **Pipeline** | CRM view of investor matches grouped by stage |
| **Data Room** | Upload pitch deck, financials, cap table, legal documents |
| **Investors** | Browse matched investors; mark interested or passed |
| **Tasks** | Create and manage diligence tasks; assign to a deal; update status |
| Profile / Settings | Edit company details and change password |

### Investor Portal — `http://localhost:3001`

**Sign in:** `fund@alphaventures.com` / `password123`
(must be approved — seed data pre-approves this account)

| Page | Capability |
|------|-----------|
| Dashboard | KPI summary, top matches, diligence queue |
| **Dealflow** | Pipeline grouped by match stage — move deals through interested → diligence → term sheet → closed; view term sheet details when issued |
| **Diligence** | Diligence items assigned to this investor — update status |
| **Watchlist** | Shortlisted (interested) companies |
| **Portfolio** | Closed investments |
| Profile / Settings | Edit mandate, update preferences, change password |

> **Investor approval flow:** New investor registrations land in a pending state. Go to the admin portal Approvals page and approve `pending@newvc.com` to test the full onboarding experience. The investor can then sign in.

---

## Auth Flow

1. User registers or signs in at `localhost:3000`
2. Website validates credentials via Prisma, issues a JWT (`vb_token`) — claims: `{ sub, email, portal, role, approved }`
3. Browser is redirected to `<portal-url>/signin?token=<jwt>`
4. Portal writes the token to a `vb_token` cookie (`max-age=604800`, 7 days) and redirects to `/`
5. Portal middleware verifies the JWT and the `portal` claim on every request
6. Portal server components read `vb_token` from the cookie, pass it as `Authorization: Bearer` to the FastAPI service
7. FastAPI verifies the token and enforces the portal claim

**Admin accounts cannot self-register.** Create them from the Analysts page in the admin portal, or run the one-shot script:

```bash
cd apps/website
# Edit ADMIN_EMAIL and ADMIN_PASSWORD in the script first
node scripts/create-admin.mjs
```

---

## Matching Engine

Run from **Admin → Deals → Run Matching** on any deal. The engine scores each approved investor 0–100:

| Signal | Max points |
|--------|-----------|
| Sector overlap | 30 |
| Stage overlap | 25 |
| Ticket size fit | 25 |
| Geography overlap | 20 |

Matches scoring below 20 are discarded. Already-matched investors are skipped — running matching twice is safe.

---

## Database

Single PostgreSQL instance shared by all apps. Only `apps/website` runs Prisma migrations. The Python APIs access the same DB via SQLAlchemy with `quoted_name()` on all camelCase identifiers to match Prisma's quoted PostgreSQL identifiers.

**Key models:**

| Model | Purpose |
|-------|---------|
| `User` | All users (startup, investor, admin) |
| `StartupProfile` | Company profile — sector, stage, ARR, funding target |
| `InvestorProfile` | Mandate — ticket size, sectors, stages, geographies, ESG |
| `Deal` | A funding round created by a startup |
| `DealMatch` | Investor–deal pairing with match score and status |
| `DiligenceItem` | Checklist item per deal — assignable to an analyst |
| `AnalystNote` | Flagged note (positive / warning / critical) per deal |
| `TermSheet` | Proposed term sheet attached to a DealMatch |
| `Document` | Uploaded file metadata per startup |
| `Notification` | In-app notification per user |

After any schema change:

```bash
cd apps/website
npx prisma db push
npx prisma generate
```

---

## Useful Commands

```bash
# Run all apps
npm run dev

# Build everything
npm run build

# Lint
npm run lint

# Prisma visual browser
cd apps/website && npx prisma studio

# Verify all API endpoints
cd apps/website && node scripts/verify.mjs

# Seed test data
cd apps/website && node scripts/seed.mjs

# Create first admin (edit credentials in the script first)
cd apps/website && node scripts/create-admin.mjs
```

---

## Environment Variable Reference

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | website, all 3 APIs | PostgreSQL connection string |
| `AUTH_SECRET` | website, all portals, all APIs | JWT signing/verification — must match everywhere |
| `PORTAL_NAME` | startup/investor/admin portal | Enforced against JWT `portal` claim in middleware |
| `NEXT_PUBLIC_WEBSITE_URL` | portals | Where to redirect on sign-out |
| `STARTUP_API_URL` | startup-portal (server) | Base URL for API calls from server components |
| `NEXT_PUBLIC_STARTUP_API_URL` | startup-portal (client) | Base URL for API calls from client components |
| `INVESTOR_API_URL` | investor-portal (server) | Same pattern |
| `NEXT_PUBLIC_INVESTOR_API_URL` | investor-portal (client) | Same pattern |
| `ADMIN_API_URL` | admin-portal (server) | Same pattern |
| `NEXT_PUBLIC_ADMIN_API_URL` | admin-portal (client) | Same pattern |
| `CORS_ORIGINS` | all 3 APIs | Comma-separated allowed origins (defaults to localhost) |
