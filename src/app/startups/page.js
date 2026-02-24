import Image from "next/image";
import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Startup Portal | VentureBridge",
  description:
    "Startup funding portal for equity, bank loans, and government schemes.",
};

export default function Startups() {
  const navLinks = [
    { href: "/", label: "Landing" },
    { href: "/investors", label: "Investor Portal" },
    { href: "/admin", label: "Admin Console" },
  ];

  return (
    <PortalLayout
      navLinks={navLinks}
      tag="Founder launchpad"
      title="Startup Funding Hub"
      description="Build a single profile and unlock equity, venture debt, and scheme funding with validation by experienced advisors."
      cta="Create Startup Profile"
      heroVisual={
        <div className="hero-visual image-card">
          <Image
            src="/startup-flow.svg"
            alt="Startup funding flow"
            width={560}
            height={360}
          />
        </div>
      }
      footerNote="Success-fee commissions apply only after a closed deal."
    >
      <section className="section">
        <div className="portal-grid">
          <div className="module">
            <h4>Equity Raise</h4>
            <p className="muted">
              Pitch to global VCs and family offices with curated exposure.
            </p>
            <div className="timeline">
              <div className="timeline-item">Upload traction metrics</div>
              <div className="timeline-item">Match to investor mandates</div>
              <div className="timeline-item">Live term sheet tracking</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 36C28 30 56 28 84 20C112 12 140 14 168 18C186 20 194 16 196 14"
                stroke="#E96F3A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="module">
            <h4>Bank & Venture Debt</h4>
            <p className="muted">
              Receive cross-border lending offers based on credit readiness.
            </p>
            <div className="timeline">
              <div className="timeline-item">Credit score simulation</div>
              <div className="timeline-item">Collateral checklist</div>
              <div className="timeline-item">Repayment modeling</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 34C34 28 56 20 78 22C100 24 120 30 142 26C164 22 182 16 196 12"
                stroke="#2E6B5D"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="module">
            <h4>Government Schemes</h4>
            <p className="muted">
              Auto-match national and state incentives with eligibility checks.
            </p>
            <div className="timeline">
              <div className="timeline-item">Sector eligibility scan</div>
              <div className="timeline-item">Compliance reminders</div>
              <div className="timeline-item">Grant documentation tracker</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 36C28 32 50 30 72 28C94 26 114 22 132 18C150 14 170 18 196 22"
                stroke="#193A5B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Validation workflow</h2>
        <p className="muted">
          Analysts validate your financials and narrative before investor
          distribution, improving credibility and funding speed.
        </p>
        <div className="card-grid" style={{ marginTop: "18px" }}>
          <div className="card">
            <h3>Step 1</h3>
            <p className="muted">Upload pitch deck, model, and cap table.</p>
          </div>
          <div className="card">
            <h3>Step 2</h3>
            <p className="muted">
              Receive feedback, red-flag notes, and improvements.
            </p>
          </div>
          <div className="card">
            <h3>Step 3</h3>
            <p className="muted">
              Get published to investor pipelines once approved.
            </p>
          </div>
        </div>
        <div className="kpi-grid">
          <div className="kpi">
            <strong>92%</strong>
            Profiles approved
          </div>
          <div className="kpi">
            <strong>3.4x</strong>
            Faster feedback loop
          </div>
          <div className="kpi">
            <strong>6</strong>
            Analyst touchpoints
          </div>
        </div>

        <div className="deal-modal">
          <div className="modal-header">
            <div>
              <h3>Pitch Preview: CrediWeave</h3>
              <p className="muted">Embedded credit underwriting stack.</p>
            </div>
            <span className="modal-chip">Awaiting Review</span>
          </div>
          <div className="modal-grid">
            <div>Runway: 14 months</div>
            <div>Monthly Revenue: ₹42L</div>
            <div>Target Raise: $1.2M</div>
            <div>Preferred Terms: SAFE</div>
          </div>
          <div className="mini-actions">
            <button className="cta-secondary">Upload New Metrics</button>
            <button className="cta-ghost">View Analyst Notes</button>
          </div>
        </div>
      </section>

    </PortalLayout>
  );
}
