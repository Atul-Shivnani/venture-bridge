# User Journey Maps — VentureBridge

End-to-end flows for each persona from first visit to goal completion.

---

## 1. Startup Founder Journey

```mermaid
journey
    title Startup Founder — From Discovery to Funded
    section Discovery
      Visit landing page:          5: Founder
      Browse "For Startups" page:  4: Founder
      Read validation workflow:    4: Founder
    section Onboarding
      Click "Create Startup Profile": 5: Founder
      Fill registration form:         3: Founder
      Verify email:                   3: Founder
      Land on startup dashboard:      5: Founder
    section Profile Setup
      Complete company profile:       3: Founder
      Upload pitch deck:              3: Founder
      Upload financial model:         2: Founder
      Upload cap table:               3: Founder
    section Deal Submission
      Create new deal (stage, amount): 4: Founder
      Submit for review:               4: Founder
      Wait for analyst feedback:       2: Founder
      Receive analyst notes:           3: Founder
      Revise and resubmit (if needed): 2: Founder
      Deal approved and goes live:     5: Founder
    section Fundraising
      View matched investors:          5: Founder
      Receive investor interest:       5: Founder
      Track diligence progress:        4: Founder
      Respond to data requests:        3: Founder
      Receive term sheet:              5: Founder
      Review and negotiate:            3: Founder
      Accept term sheet:               5: Founder
      Deal closed:                     5: Founder
```

---

## 2. Investor Journey

```mermaid
journey
    title Investor — From Registration to Investment
    section Discovery
      Visit landing page:             5: Investor
      Browse "For Investors" page:    5: Investor
      Understand deal flow process:   4: Investor
    section Onboarding
      Request access (register):      3: Investor
      Submit firm and mandate details: 3: Investor
      Wait for admin approval:        2: Investor
      Receive approval notification:  4: Investor
      Sign in and enter portal:       5: Investor
    section Deal Discovery
      View AI-matched deals:          5: Investor
      Filter by sector and stage:     4: Investor
      Review deal scores and notes:   4: Investor
      Add deals to watchlist:         4: Investor
    section Due Diligence
      Signal interest in a deal:      5: Investor
      Review diligence checklist:     4: Investor
      Access startup data room:       4: Investor
      Request additional documents:   3: Investor
      Complete diligence items:       3: Investor
      Collaborate with co-investors:  3: Investor
    section Investment
      Draft term sheet:               4: Investor
      Submit term sheet to startup:   4: Investor
      Negotiate terms:                3: Investor
      Receive acceptance:             5: Investor
      Deal closed — portfolio added:  5: Investor
```

---

## 3. Admin / Analyst Journey

```mermaid
journey
    title Admin / Analyst — Daily Operations
    section Morning Queue
      Sign in to admin portal:         5: Admin
      Review overnight notifications:  4: Admin
      Check approvals queue:           4: Admin
    section Investor Approvals
      Review new investor registrations: 3: Admin
      Verify firm credentials:           3: Admin
      Approve or reject investors:       4: Admin
      Send approval notifications:       4: Admin
    section Deal Validation
      Pick up new deal submission:       4: Analyst
      Review pitch deck and financials:  3: Analyst
      Add analyst notes and flags:       4: Analyst
      Run compliance checks (KYC/AML):   3: Analyst
      Approve deal for matching:         5: Analyst
    section Diligence Support
      Assign diligence items to team:    4: Admin
      Monitor in-progress diligences:   4: Admin
      Escalate blockers:                 3: Admin
    section Reporting
      Export weekly compliance report:   3: Admin
      Review deal pipeline metrics:      4: Admin
      Flag policy anomalies:             3: Admin
```

---

## 4. Cross-Portal State Machine — Deal Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Startup submits deal

    Draft --> UnderReview : Analyst picks up
    UnderReview --> Rejected : Analyst rejects
    UnderReview --> Approved : Analyst approves

    Rejected --> Draft : Startup revises & resubmits

    Approved --> Live : Matching engine runs\nInvestors notified

    Live --> InDiligence : Investor signals interest\n(deal_match created)
    Live --> Closed : All investors pass\n(no takers)

    InDiligence --> TermSheet : Diligence complete\nInvestor submits term sheet

    TermSheet --> Closed : Startup accepts\n✅ Deal closed
    TermSheet --> InDiligence : Startup counters\nNegotiation continues
    TermSheet --> Live : Investor withdraws\nBack to matching pool

    Closed --> [*]
    Rejected --> [*] : Startup abandons
```
