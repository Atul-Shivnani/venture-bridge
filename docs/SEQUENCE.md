# Sequence Diagrams — VentureBridge

Key interaction flows between actors and system components.

---

## 1. Startup Registration & Portal Access

```mermaid
sequenceDiagram
    actor SF as Startup Founder
    participant WEB as website :3000
    participant API as /api/auth/register
    participant DB as PostgreSQL
    participant SP as startup-portal :3002

    SF->>WEB: Visit /register
    WEB-->>SF: Registration form (role selector)
    SF->>WEB: Select "Startup", fill company details
    SF->>API: POST {email, password, portal:"startup", details}
    API->>API: Validate input
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: null (email free)
    API->>API: bcrypt.hash(password, 12)
    API->>DB: INSERT user {email, hash, portal, approved:true, role:"user"}
    DB-->>API: user record
    API->>API: signJWT({sub, email, portal:"startup", approved:true}, 7d)
    API-->>WEB: {token, portal:"startup"}
    WEB->>SP: redirect → /signin?token=JWT
    SP->>SP: Parse token from URL
    SP->>SP: Set vb_token cookie (7d, samesite=lax)
    SP->>SF: redirect → / (dashboard)
    Note over SP,SF: All future requests verified by middleware
```

---

## 2. Investor Registration & Approval Gate

```mermaid
sequenceDiagram
    actor IV as Investor
    actor AD as Admin
    participant WEB as website :3000
    participant API as /api/auth/register
    participant DB as PostgreSQL
    participant IP as investor-portal :3001

    IV->>WEB: Visit /register → select "Investor"
    IV->>API: POST {email, password, portal:"investor", firm details}
    API->>DB: INSERT user {portal:"investor", approved:false}
    API->>API: signJWT({approved:false})
    API-->>WEB: {token, portal:"investor", approved:false}
    WEB->>IP: redirect → /signin?token=JWT
    IP->>IP: Set vb_token cookie
    IP->>IP: Middleware checks approved === true
    IP-->>IV: redirect → /signin (BLOCKED — not approved)
    Note over IV,IP: Investor cannot access portal until approved

    AD->>DB: UPDATE user SET approved=true WHERE id=?
    Note over AD,DB: Admin approves via admin-portal

    IV->>WEB: Sign in again
    WEB->>API: POST {email, password} → /api/auth/login
    API->>DB: SELECT user, verify bcrypt
    API->>API: signJWT({approved:true})
    API-->>WEB: {token, approved:true}
    WEB->>IP: redirect → /signin?token=JWT
    IP->>IP: Middleware: approved === true ✓
    IP-->>IV: Dashboard (deal flow)
```

---

## 3. Sign In Flow (All Portals)

```mermaid
sequenceDiagram
    actor U as User
    participant WEB as website :3000
    participant API as /api/auth/login
    participant DB as PostgreSQL
    participant PORTAL as Target Portal

    U->>WEB: Visit /signin, enter email + password
    U->>API: POST {email, password}
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: user record
    API->>API: bcrypt.compare(password, hash)
    alt Password valid
        API->>API: signJWT({sub, email, portal, role, approved})
        API-->>WEB: {token, portal, approved}
        WEB->>PORTAL: redirect → /signin?token=JWT
        PORTAL->>PORTAL: Set vb_token cookie
        PORTAL->>PORTAL: Middleware validates token
        alt Token valid + portal match + approved (investor)
            PORTAL-->>U: Dashboard
        else Any check fails
            PORTAL-->>U: redirect → /signin
        end
    else Password invalid
        API-->>WEB: 401 Unauthorized
        WEB-->>U: "Invalid credentials" error
    end
```

---

## 4. Deal Submission & Admin Validation

```mermaid
sequenceDiagram
    actor SF as Startup Founder
    actor AN as Analyst/Admin
    participant SP as startup-portal :3002
    participant SAPI as startup-api
    participant DB as PostgreSQL
    participant NOTIF as Notifications

    SF->>SP: Navigate to "New Deal"
    SF->>SP: Fill deal details (stage, target amount, docs)
    SP->>SAPI: POST /deals {startup_id, title, stage, target_amount}
    SAPI->>DB: INSERT deal {status:"draft"}
    SAPI->>NOTIF: Notify admins — new deal pending review
    SAPI-->>SP: deal created

    AN->>DB: SELECT deals WHERE status="draft"
    AN->>SAPI: GET /deals/:id (read full deal + documents)
    AN->>SAPI: POST /analyst-notes {deal_id, content, flag_type}
    SAPI->>DB: INSERT analyst_note

    alt Approved
        AN->>SAPI: PATCH /deals/:id {status:"approved"}
        SAPI->>DB: UPDATE deal status="approved"
        SAPI->>NOTIF: Notify startup — deal approved
        SAPI->>SAPI: Trigger investor matching (Process 5.0)
    else Rejected
        AN->>SAPI: PATCH /deals/:id {status:"rejected"}
        SAPI->>DB: UPDATE deal status="rejected"
        SAPI->>NOTIF: Notify startup — deal rejected with notes
    end
```

---

## 5. Investor Match → Diligence → Term Sheet

```mermaid
sequenceDiagram
    actor IV as Investor
    actor AN as Analyst
    actor SF as Startup Founder
    participant IP as investor-portal :3001
    participant IAPI as investor-api
    participant DB as PostgreSQL
    participant NOTIF as Notifications

    Note over DB: Deal just approved, matches created

    IAPI->>DB: SELECT investor_profiles (filter by sector, ticket, geo)
    IAPI->>IAPI: Score each investor (AI match algo)
    IAPI->>DB: INSERT deal_matches {match_score, status:"pending"}
    IAPI->>NOTIF: Notify each matched investor

    IV->>IP: View deal flow — sees new match
    IV->>IAPI: POST /deal-matches/:id/interest {status:"interested"}
    IAPI->>DB: UPDATE deal_match status="in_diligence"
    IAPI->>NOTIF: Notify startup + admin

    AN->>IAPI: POST /diligence-items {deal_id, investor_id, category, title}
    IAPI->>DB: INSERT diligence_items
    IV->>IAPI: PATCH /diligence-items/:id {status:"complete", notes}
    IAPI->>DB: UPDATE diligence_item

    alt All diligence complete
        IV->>IAPI: POST /term-sheets {deal_match_id, amount, valuation, terms}
        IAPI->>DB: INSERT term_sheet {status:"sent"}
        IAPI->>NOTIF: Notify startup — term sheet received

        SF->>IAPI: PATCH /term-sheets/:id {status:"accepted"}
        IAPI->>DB: UPDATE term_sheet, deal_match status="closed", deal status="closed"
        IAPI->>NOTIF: Notify investor + admin — deal closed 🎉
    end
```

---

## 6. Middleware Auth Check (Every Request)

```mermaid
sequenceDiagram
    participant BROWSER as Browser
    participant MW as Next.js Middleware
    participant JWT as JWT Verifier

    BROWSER->>MW: Any request to protected route
    MW->>MW: Is path in PUBLIC_PATHS (/signin)?
    alt Public path
        MW-->>BROWSER: Allow
    else Protected
        MW->>MW: Read vb_token from cookies
        alt No cookie
            MW-->>BROWSER: Redirect → /signin
        else Cookie exists
            MW->>JWT: jwtVerify(token, AUTH_SECRET)
            alt Invalid / expired
                MW-->>BROWSER: Redirect → /signin
            else Valid
                MW->>MW: Check payload.portal === this portal
                alt Wrong portal
                    MW-->>BROWSER: Redirect → /signin
                else Correct portal
                    MW->>MW: Is investor portal?
                    alt Investor portal
                        MW->>MW: Check payload.approved === true
                        alt Not approved
                            MW-->>BROWSER: Redirect → /signin
                        else Approved
                            MW-->>BROWSER: Allow request
                        end
                    else Startup / Admin portal
                        MW-->>BROWSER: Allow request
                    end
                end
            end
        end
    end
```
