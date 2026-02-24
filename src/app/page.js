import Link from "next/link";
import Image from "next/image";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="page">
      <div className="grain" />
      <div className="container">
        <Header
          links={[
            { href: "/investors", label: "Investor Portal" },
            { href: "/startups", label: "Startup Portal" },
            { href: "/admin", label: "Admin Console" },
          ]}
        />

        <section className="hero">
          <div className="fade-up">
            <span className="tag">Direct capital for Indian founders</span>
            <h1>Replace intermediaries with verified, data-led funding.</h1>
            <p>
              VentureBridge connects Indian startups directly to global VCs,
              family offices, and cross-border lenders, with investment banking
              grade validation and analytics baked in.
            </p>
            <div className="cta-group">
              <Link className="cta-primary" href="/startups">
                Launch Startup Profile
              </Link>
              <Link className="cta-secondary" href="/investors">
                Explore Opportunities
              </Link>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <strong>320+</strong>
                Active investor mandates
              </div>
              <div className="stat">
                <strong>11</strong>
                Validation checkpoints
              </div>
              <div className="stat">
                <strong>48 hrs</strong>
                Typical response window
              </div>
            </div>
          </div>

          <div className="hero-card fade-up">
            <h3>Live Deal Board</h3>
            <p className="muted">
              Curated opportunities matched by sector thesis, ticket size, and
              credit-readiness.
            </p>
            <div className="timeline">
              <div className="timeline-item">
                Clean energy SaaS • Series A • $6M
              </div>
              <div className="timeline-item">
                Healthtech diagnostics • Pre-seed • $750K
              </div>
              <div className="timeline-item">
                Logistics AI • Growth • $12M + debt
              </div>
            </div>
            <div className="hero-visual">
              <Image
                src="/hero-visual.svg"
                alt="Deal flow analytics illustration"
                width={640}
                height={520}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="split">
            <div>
              <h2 className="section-title">Three lanes. One trusted network.</h2>
              <p className="muted">
                A single platform for equity, venture debt, and government or
                bank-backed schemes. Every startup passes commercial,
                compliance, and credit scoring before investors see it.
              </p>
            </div>
            <div className="card-grid">
              <div className="card">
                <h3>Equity Capital</h3>
                <p className="muted">
                  VCs and family offices see validated pitches with clean
                  cap-tables, traction, and diligence notes.
                </p>
              </div>
              <div className="card">
                <h3>Bank Loans</h3>
                <p className="muted">
                  Cross-border lenders evaluate credit-ready businesses through
                  standardized risk packs.
                </p>
              </div>
              <div className="card">
                <h3>Government Schemes</h3>
                <p className="muted">
                  Auto-matched grants and incentives for eligible sectors with a
                  guided compliance path.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Built for transparency and speed.</h2>
          <p className="muted">
            Investment bankers and advisors validate key metrics before
            investors receive access, reducing noise and accelerating decisions.
          </p>
          <div className="card-grid" style={{ marginTop: "24px" }}>
            <div className="card">
              <h3>Confidence Scores</h3>
              <p className="muted">
                Every startup is graded across revenue quality, unit economics,
                and governance maturity.
              </p>
            </div>
            <div className="card">
              <h3>Verified Documents</h3>
              <p className="muted">
                Structured data rooms with red-flag indicators and audit trails.
              </p>
            </div>
            <div className="card">
              <h3>Deal Orchestration</h3>
              <p className="muted">
                Centralized term sheet workflow, updates, and milestone tracking.
              </p>
            </div>
            <div className="card">
              <h3>Commission Logic</h3>
              <p className="muted">
                Transparent success-fee rules shared across investors and
                founders.
              </p>
            </div>
          </div>
          <div className="insight-grid">
            <div className="insight">
              <strong>Top interest sectors</strong>
              <div className="bar-chart">
                <div className="bar">
                  <span>Climate</span>
                  <div className="track">
                    <div className="fill" style={{ width: "86%" }} />
                  </div>
                </div>
                <div className="bar">
                  <span>Fintech</span>
                  <div className="track">
                    <div className="fill" style={{ width: "74%" }} />
                  </div>
                </div>
                <div className="bar">
                  <span>Health</span>
                  <div className="track">
                    <div className="fill" style={{ width: "62%" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="insight">
              <strong>Deal pipeline</strong>
              <div className="kpi-grid">
                <div className="kpi">
                  <strong>34</strong>
                  Active raises
                </div>
                <div className="kpi">
                  <strong>18</strong>
                  Bank-ready
                </div>
                <div className="kpi">
                  <strong>9</strong>
                  Schemes matched
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Choose your portal.</h2>
          <div className="card-grid" style={{ marginTop: "18px" }}>
            <div className="card">
              <h3>Investor Portal</h3>
              <p className="muted">
                Invite-only access to sector-matched opportunities and diligence
                dashboards.
              </p>
              <Link className="pill" href="/investors">
                Open Investor View
              </Link>
            </div>
            <div className="card">
              <h3>Startup Portal</h3>
              <p className="muted">
                Build a pitch profile, select funding lanes, and get matched to
                capital.
              </p>
              <Link className="pill" href="/startups">
                Open Startup View
              </Link>
            </div>
            <div className="card">
              <h3>Admin Console</h3>
              <p className="muted">
                Control approvals, analyst assignments, and policy compliance.
              </p>
              <Link className="pill" href="/admin">
                Open Admin View
              </Link>
            </div>
          </div>
        </section>

        <Footer note="Prototype showcase for VentureBridge. Success-fee commissions applied only on closed deals." />
      </div>
    </div>
  );
}
