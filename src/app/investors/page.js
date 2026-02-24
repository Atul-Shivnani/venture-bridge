import Image from "next/image";
import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Investor Portal | VentureBridge",
  description:
    "Invite-only investor portal with validated Indian startup opportunities.",
};

export default function Investors() {
  const navLinks = [
    { href: "/", label: "Landing" },
    { href: "/startups", label: "Startup Portal" },
    { href: "/admin", label: "Admin Console" },
  ];

  return (
    <PortalLayout
      navLinks={navLinks}
      tag="Invite-only access"
      title="Investor Opportunity Desk"
      description="View vetted Indian startups matched to your mandate. Each deal is pre-scored, with banker notes and structured diligence packs."
      cta="Request Admin Access"
      heroVisual={
        <div className="hero-visual image-card">
          <Image
            src="/investor-map.svg"
            alt="Investor opportunity map"
            width={560}
            height={360}
          />
        </div>
      }
      footerNote="Access is granted only after admin validation and mandate approval."
    >
      <section className="section">
        <div className="portal-grid">
          <div className="module">
            <h4>Portfolio Match Index</h4>
            <p className="muted">
              86% alignment with your climate + fintech thesis.
            </p>
            <div className="timeline">
              <div className="timeline-item">AlphaGrid • Series A • $4M</div>
              <div className="timeline-item">CrediWeave • Pre-seed • $600K</div>
              <div className="timeline-item">SolarStack • Growth • $8M + debt</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 40C28 22 52 20 76 26C100 32 124 18 148 14C172 10 188 16 196 20"
                stroke="#E96F3A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="module">
            <h4>Due Diligence Snapshot</h4>
            <p className="muted">
              11 checks complete, 2 follow-ups pending.
            </p>
            <div className="timeline">
              <div className="timeline-item">Revenue Quality: Strong</div>
              <div className="timeline-item">Governance: Mature</div>
              <div className="timeline-item">Legal: Standardized</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 34C32 30 56 26 82 18C108 10 132 12 156 18C180 24 190 16 196 12"
                stroke="#2E6B5D"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="module">
            <h4>Deal Room Updates</h4>
            <p className="muted">
              Track term sheets, syndicates, and live milestones.
            </p>
            <div className="timeline">
              <div className="timeline-item">2 new term sheets this week</div>
              <div className="timeline-item">5 active co-investors</div>
              <div className="timeline-item">Avg. close time: 21 days</div>
            </div>
            <svg
              className="sparkline"
              viewBox="0 0 200 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 36C28 34 48 26 72 20C96 14 124 10 156 16C176 20 188 22 196 18"
                stroke="#193A5B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How investors use VentureBridge</h2>
        <div className="card-grid" style={{ marginTop: "18px" }}>
          <div className="card">
            <h3>Screen</h3>
            <p className="muted">
              Receive a curated list filtered by ticket size, sector, and stage.
            </p>
          </div>
          <div className="card">
            <h3>Analyze</h3>
            <p className="muted">
              Review banker commentary, unit economics, and red-flag flags.
            </p>
          </div>
          <div className="card">
            <h3>Commit</h3>
            <p className="muted">
              Execute term sheets with guided workflows and milestone alerts.
            </p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Stage</th>
              <th>Ticket</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AlphaGrid</td>
              <td>Series A</td>
              <td>$4M</td>
              <td>DD Pack Ready</td>
            </tr>
            <tr>
              <td>CrediWeave</td>
              <td>Pre-seed</td>
              <td>$600K</td>
              <td>Term Sheet Draft</td>
            </tr>
            <tr>
              <td>SolarStack</td>
              <td>Growth</td>
              <td>$8M + Debt</td>
              <td>Co-investor Review</td>
            </tr>
          </tbody>
        </table>

        <div className="deal-modal">
          <div className="modal-header">
            <div>
              <h3>Deal Spotlight: AlphaGrid</h3>
              <p className="muted">Climate analytics platform for utilities.</p>
            </div>
            <span className="modal-chip">Live DD</span>
          </div>
          <div className="modal-grid">
            <div>ARR: $1.8M • 120% YoY</div>
            <div>Gross Margin: 74%</div>
            <div>Round Target: $4M</div>
            <div>Lead: Pending</div>
          </div>
          <div className="mini-actions">
            <button className="cta-secondary">Open Data Room</button>
            <button className="cta-ghost">Invite Co-Investor</button>
          </div>
        </div>
      </section>

    </PortalLayout>
  );
}
