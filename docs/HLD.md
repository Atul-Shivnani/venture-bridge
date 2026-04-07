# High Level Design — VentureBridge

---

## System Architecture Overview

```mermaid
flowchart TB

    subgraph CLIENTS["Client Layer (Browsers)"]
        C1["Startup Founder\nBrowser"]
        C2["Investor\nBrowser"]
        C3["Admin / Analyst\nBrowser"]
    end

    subgraph FRONTEND["Frontend Layer (Next.js Apps)"]
        direction TB
        WEB["website :3000\n─────────────\n• Marketing pages\n• /startups, /investors\n• /signin, /register\n• Auth API routes\n• Prisma ORM"]
        INV_P["investor-portal :3001\n─────────────\n• Deal flow dashboard\n• Watchlist\n• Diligence queue\n• Portfolio tracker\n• JWT middleware"]
        STR_P["startup-portal :3002\n─────────────\n• Fundraising pipeline\n• Investor matches\n• Task manager\n• Data room\n• JWT middleware"]
        ADM_P["admin-portal :3003\n─────────────\n• Approvals queue\n• Analyst workbench\n• Risk & policy\n• Deal oversight\n• JWT middleware"]
    end

    subgraph AUTH["Auth Layer"]
        JWT["JWT Tokens\n(jose, HS256, 7d)\nIssued by website\nVerified by all portals"]
        COOKIE["vb_token Cookie\n(samesite=lax)\nSet per portal\nVerified by middleware"]
    end

    subgraph BACKEND["Backend Layer (FastAPI — Python)"]
        INV_A["investor-api\n─────────────\n• Deal browsing\n• Match management\n• Diligence ops\n• Portfolio data"]
        STR_A["startup-api\n─────────────\n• Profile management\n• Document upload\n• Deal submission\n• Pipeline tracking"]
        ADM_A["admin-api :8003\n─────────────\n• User approvals\n• Analyst assignment\n• Compliance checks\n• Reporting"]
    end

    subgraph DATA["Data Layer"]
        PG[("PostgreSQL :5432\n─────────────\n users\n startup_profiles\n investor_profiles\n deals\n deal_matches\n documents\n diligence_items\n analyst_notes\n term_sheets\n notifications")]
        FS["File Storage\n(future)\n─────────────\n• Pitch decks\n• Financials\n• Legal docs"]
    end

    subgraph SHARED["Shared Packages"]
        UI["@venturebridge/ui\n─────────────\nButton, Input, Card\nLandingHeader\nPortalHeader\nPasswordStrength\nProgressSteps"]
        AUTHPKG["@venturebridge/auth\n─────────────\nJWT sign/verify\nShared utilities"]
        TYPES["@venturebridge/types\n─────────────\nShared TypeScript\ntype definitions"]
    end

    %% Client → Frontend
    C1 --> WEB
    C1 --> STR_P
    C2 --> WEB
    C2 --> INV_P
    C3 --> WEB
    C3 --> ADM_P

    %% Auth flow
    WEB --> JWT
    JWT --> COOKIE
    COOKIE --> INV_P
    COOKIE --> STR_P
    COOKIE --> ADM_P

    %% Frontend → Backend APIs
    INV_P --> INV_A
    STR_P --> STR_A
    ADM_P --> ADM_A

    %% Backend → Database
    WEB --> PG
    INV_A --> PG
    STR_A --> PG
    ADM_A --> PG
    STR_A --> FS

    %% Shared packages used by
    UI -.->|used by| WEB
    UI -.->|used by| INV_P
    UI -.->|used by| STR_P
    UI -.->|used by| ADM_P
    AUTHPKG -.->|used by| WEB
    AUTHPKG -.->|used by| INV_P
    AUTHPKG -.->|used by| STR_P
    AUTHPKG -.->|used by| ADM_P
```

---

## Portal Responsibility Map

```mermaid
flowchart LR

    subgraph WEBSITE["website :3000"]
        W1["Marketing / Landing"]
        W2["For Startups page"]
        W3["For Investors page"]
        W4["Sign In form"]
        W5["Register form"]
        W6["POST /api/auth/login"]
        W7["POST /api/auth/register"]
    end

    subgraph SP["startup-portal :3002"]
        S1["Fundraising Pipeline"]
        S2["Investor Matches"]
        S3["Task Manager"]
        S4["Data Room"]
        S5["Readiness Checklist"]
    end

    subgraph IP["investor-portal :3001"]
        I1["Deal Flow Board"]
        I2["Watchlist"]
        I3["Diligence Queue"]
        I4["Portfolio Tracker"]
        I5["Deal Memos / IC Notes"]
    end

    subgraph AP["admin-portal :3003"]
        A1["Approvals Queue"]
        A2["Analyst Workbench"]
        A3["Risk & Policy"]
        A4["Deal Oversight"]
        A5["Reporting"]
    end

    W4 --> SP
    W4 --> IP
    W4 --> AP
    W5 --> SP
    W5 --> IP
```

---

## Authentication Architecture

```mermaid
flowchart TD

    USER["User (any portal)"]
    WEBSITE["website :3000\n/api/auth/login\n/api/auth/register"]
    DB[("PostgreSQL\nusers table")]
    PORTAL["Target Portal\n:3001 / :3002 / :3003\n/signin?token=..."]
    MW["Next.js Middleware\n(every request)"]
    DASHBOARD["Portal Dashboard\n/"]
    BLOCKED["→ Redirect to /signin"]

    USER -- "POST credentials" --> WEBSITE
    WEBSITE -- "bcrypt verify / create" --> DB
    DB -- "user record" --> WEBSITE
    WEBSITE -- "sign JWT\n{sub,email,portal,role,approved}" --> PORTAL
    PORTAL -- "set vb_token cookie\n(7d, samesite=lax)" --> MW

    MW -- "cookie present?\nJWT valid?\nportal match?\napproved (investor only)?" --> DASHBOARD
    MW -- "any check fails" --> BLOCKED
```

---

## Deployment Topology (Local Dev → Production)

```mermaid
flowchart LR

    subgraph LOCAL["Local Development"]
        L1["turbo dev\n(all apps in parallel)"]
        L2["website :3000"]
        L3["investor-portal :3001"]
        L4["startup-portal :3002"]
        L5["admin-portal :3003"]
        L6["admin-api :8003"]
        L7["PostgreSQL :5432"]
        L1 --> L2 & L3 & L4 & L5 & L6
        L2 & L6 --> L7
    end

    subgraph PROD["Production (Target)"]
        P0["CDN / Load Balancer"]
        P1["venturebridge.com\n(website)"]
        P2["app.venturebridge.com/investor\n(investor-portal)"]
        P3["app.venturebridge.com/startup\n(startup-portal)"]
        P4["admin.venturebridge.com\n(admin-portal)"]
        P5["api.venturebridge.com/investor\n(investor-api)"]
        P6["api.venturebridge.com/startup\n(startup-api)"]
        P7["api.venturebridge.com/admin\n(admin-api)"]
        P8[("Managed PostgreSQL\nNeon / Supabase / RDS")]
        P9["Object Storage\nS3 / R2\n(documents)"]
        P0 --> P1 & P2 & P3 & P4
        P2 --> P5
        P3 --> P6
        P4 --> P7
        P5 & P6 & P7 --> P8
        P6 --> P9
    end
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Monorepo | Turborepo + npm workspaces | Parallel builds, shared packages |
| Frontend | Next.js 16, React 19 | All portals and website |
| Styling | Tailwind CSS 4 | Utility-first, design tokens via `@theme` |
| Auth | jose (JWT HS256) + bcryptjs | Token signing + password hashing |
| ORM | Prisma 5 | Type-safe DB access (website only) |
| Database | PostgreSQL | Primary data store |
| Backend APIs | FastAPI (Python) | Business logic per portal |
| Shared UI | @venturebridge/ui | Cross-portal component library |
| File Storage | TBD (S3/R2) | Pitch decks, financial docs |
| Deployment | TBD (Vercel / Railway) | Hosting |
