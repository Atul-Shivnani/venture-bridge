# Entity Relationship Diagram — VentureBridge

All entities, attributes, and relationships for the PostgreSQL database.

```mermaid
erDiagram

  users {
    string  id           PK "cuid"
    string  email        UK
    string  password_hash
    enum    portal          "startup | investor | admin"
    enum    role            "user | admin"
    boolean approved
    datetime created_at
    datetime updated_at
  }

  startup_profiles {
    string  id           PK
    string  user_id      FK
    string  company_name
    string  sector
    string  country
    enum    funding_stage   "pre_seed | seed | series_a | series_b | growth"
    string  description
    string  website
    int     founded_year
    int     team_size
    float   arr             "annual recurring revenue"
    
    datetime created_at
    datetime updated_at
  }

  investor_profiles {
    string  id           PK
    string  user_id      FK
    string  firm_name
    enum    investor_type   "vc | family_office | angel | bank"
    float   ticket_min
    float   ticket_max
    json    geographies     "array of countries"
    json    sectors         "array of focus sectors"
    datetime created_at
    datetime updated_at
  }

  deals {
    string  id           PK
    string  startup_id   FK
    string  analyst_id   FK  "nullable — assigned admin/analyst"
    string  title
    enum    stage           "pre_seed | seed | series_a | series_b | growth"
    float   target_amount
    string  currency
    enum    status          "draft | under_review | approved | live | closed | rejected"
    datetime created_at
    datetime updated_at
  }

  deal_matches {
    string  id           PK
    string  deal_id      FK
    string  investor_id  FK
    int     match_score     "0-100 AI score"
    enum    status          "pending | interested | passed | in_diligence | term_sheet | closed"
    datetime created_at
    datetime updated_at
  }

  documents {
    string  id           PK
    string  startup_id   FK
    string  deal_id      FK  "nullable"
    string  uploaded_by  FK
    enum    type            "pitch_deck | financial_model | cap_table | legal | other"
    string  filename
    string  url
    enum    status          "pending | approved | flagged"
    datetime created_at
  }

  diligence_items {
    string  id           PK
    string  deal_id      FK
    string  investor_id  FK
    string  assigned_to  FK  "nullable — analyst user id"
    enum    category        "financial | legal | governance | market | team"
    string  title
    string  notes
    enum    status          "pending | in_progress | complete | flagged"
    datetime created_at
    datetime updated_at
  }

  analyst_notes {
    string  id           PK
    string  deal_id      FK
    string  author_id    FK
    string  content
    enum    flag_type       "positive | warning | critical"
    datetime created_at
  }

  term_sheets {
    string  id              PK
    string  deal_match_id   FK
    float   proposed_amount
    float   valuation
    json    terms
    enum    status          "draft | sent | countered | accepted | rejected"
    datetime created_at
    datetime updated_at
  }

  notifications {
    string  id           PK
    string  user_id      FK
    string  type
    string  title
    string  message
    boolean read
    string  ref_id          "optional reference to deal/match/etc"
    datetime created_at
  }

  %% Relationships

  users             ||--o|  startup_profiles  : "has one (if portal=startup)"
  users             ||--o|  investor_profiles : "has one (if portal=investor)"
  startup_profiles  ||--o{  deals             : "creates"
  users             ||--o{  deals             : "assigned as analyst"
  deals             ||--o{  deal_matches      : "matched to investors"
  investor_profiles ||--o{  deal_matches      : "receives matches"
  startup_profiles  ||--o{  documents         : "uploads"
  deals             ||--o{  documents         : "attached to"
  users             ||--o{  documents         : "uploaded by"
  deals             ||--o{  diligence_items   : "has checklist"
  investor_profiles ||--o{  diligence_items   : "runs diligence"
  users             ||--o{  diligence_items   : "assigned analyst"
  deals             ||--o{  analyst_notes     : "annotated"
  users             ||--o{  analyst_notes     : "authored by"
  deal_matches      ||--o|  term_sheets       : "leads to"
  users             ||--o{  notifications     : "receives"
```

---

## Entity Descriptions

| Entity | Purpose |
|---|---|
| `users` | Single auth table for all portals. `portal` field determines role context. |
| `startup_profiles` | Extended profile for startup users — company info, sector, funding stage. |
| `investor_profiles` | Extended profile for investor users — firm, ticket size, focus areas. |
| `deals` | A live fundraising round created by a startup. Central entity for all activity. |
| `deal_matches` | Junction between deals and investors. Tracks AI match score and progression status. |
| `documents` | Files uploaded by startups (pitch decks, financials, legal docs). |
| `diligence_items` | Checklist items per deal per investor. Assigned to analysts for review. |
| `analyst_notes` | Internal notes by admin/analysts on a deal with severity flags. |
| `term_sheets` | Formal offer from investor to startup arising from a deal match. |
| `notifications` | In-app notifications for all user types on key events. |
