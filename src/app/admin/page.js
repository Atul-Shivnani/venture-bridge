import Image from "next/image";
import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Admin Console | VentureBridge",
  description:
    "Admin console for approvals, validation workflows, and policy controls.",
};

export default function Admin() {
  const navLinks = [
    { href: "/", label: "Landing" },
    { href: "/investors", label: "Investor Portal" },
    { href: "/startups", label: "Startup Portal" },
  ];

  return (
    <PortalLayout
      navLinks={navLinks}
      tag="Control center"
      title="Admin Operations Console"
      description="Manage onboarding, validation workflows, and investor access. Keep compliance, analyst notes, and policy enforcement in one place."
      cta="Review Pending Queue"
      heroVisual={
        <div className="hero-visual image-card">
          <Image
            src="/admin-shield.svg"
            alt="Admin compliance shield"
            width={520}
            height={360}
          />
        </div>
      }
      footerNote="Admin console view for internal operations and compliance."
    >
      <section className="section">
        <div className="dashboard">
          <aside className="side-nav">
            <h4>Admin Menu</h4>
            <ul>
              <li>
                <a className="active" href="#">
                  Overview
                </a>
              </li>
              <li>
                <a href="#">Approvals Queue</a>
              </li>
              <li>
                <a href="#">Analyst Workbench</a>
              </li>
              <li>
                <a href="#">Risk & Policy</a>
              </li>
              <li>
                <a href="#">Deal Oversight</a>
              </li>
              <li>
                <a href="#">Reports</a>
              </li>
            </ul>
          </aside>

          <div className="dashboard-content">
            <div className="dashboard-row">
              <div className="dashboard-card">
                <h4>Daily Snapshot</h4>
                <p className="muted">
                  16 approvals pending • 3 escalations • 2 policy updates
                </p>
                <div className="status-list">
                  <div className="status-item">
                    Investor approvals <span className="status-pill">4</span>
                  </div>
                  <div className="status-item">
                    Startup approvals <span className="status-pill">12</span>
                  </div>
                  <div className="status-item">
                    Analyst tasks <span className="status-pill">8</span>
                  </div>
                </div>
              </div>
              <div className="dashboard-card">
                <h4>Compliance Coverage</h4>
                <div className="bar-chart">
                  <div className="bar">
                    <span>KYC</span>
                    <div className="track">
                      <div className="fill" style={{ width: "88%" }} />
                    </div>
                  </div>
                  <div className="bar">
                    <span>AML</span>
                    <div className="track">
                      <div className="fill" style={{ width: "71%" }} />
                    </div>
                  </div>
                  <div className="bar">
                    <span>ESG</span>
                    <div className="track">
                      <div className="fill" style={{ width: "64%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard-card">
                <h4>Weekly Workload</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Analyst</td>
                      <td>18</td>
                    </tr>
                    <tr>
                      <td>Legal</td>
                      <td>7</td>
                    </tr>
                    <tr>
                      <td>Risk</td>
                      <td>5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="dashboard-card">
                <h4>Approvals Queue</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    OceanGrid • Compliance review
                  </div>
                  <div className="timeline-item">
                    Vale Capital • Mandate verification
                  </div>
                  <div className="timeline-item">
                    Nova Health • Analyst assignment
                  </div>
                </div>
                <svg
                  className="sparkline"
                  viewBox="0 0 200 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 36C30 30 54 26 76 20C98 14 120 16 142 18C164 20 182 16 196 12"
                    stroke="#E96F3A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="dashboard-card">
                <h4>Analyst Workbench</h4>
                <div className="timeline">
                  <div className="timeline-item">Financial model review</div>
                  <div className="timeline-item">Market size validation</div>
                  <div className="timeline-item">Governance checklist</div>
                </div>
                <svg
                  className="sparkline"
                  viewBox="0 0 200 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 34C26 32 46 28 66 24C86 20 108 22 132 24C156 26 178 20 196 16"
                    stroke="#2E6B5D"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="dashboard-card">
                <h4>Risk & Policy</h4>
                <div className="timeline">
                  <div className="timeline-item">Auto-flagged anomalies: 2</div>
                  <div className="timeline-item">Policy updates: 1 pending</div>
                  <div className="timeline-item">Weekly audit log export</div>
                </div>
                <svg
                  className="sparkline"
                  viewBox="0 0 200 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 36C34 30 60 26 86 24C112 22 136 18 156 16C176 14 188 18 196 22"
                    stroke="#193A5B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="deal-modal">
                <div className="modal-header">
                  <div>
                    <h3>Policy Review: New Lending Partner</h3>
                    <p className="muted">
                      Cross-border debt provider onboarding.
                    </p>
                  </div>
                  <span className="modal-chip">In Review</span>
                </div>
                <div className="modal-grid">
                  <div>KYC Status: 92% complete</div>
                  <div>Jurisdiction: Singapore</div>
                  <div>Risk Tier: Medium</div>
                  <div>Advisor Owner: R. Sharma</div>
                </div>
                <div className="mini-actions">
                  <button className="cta-secondary">Request Missing Docs</button>
                  <button className="cta-ghost">Approve Conditionally</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </PortalLayout>
  );
}
