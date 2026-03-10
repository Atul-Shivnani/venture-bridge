import Link from "next/link";

const kpis = [
  { label: "Startups in pipeline", value: "67", delta: "+12 this month" },
  { label: "Partner calls", value: "9", delta: "3 this week" },
  { label: "Live diligences", value: "5", delta: "2 closing soon" },
  { label: "Warm intros", value: "14", delta: "6 pending review" },
];

const dealflow = [
  { stage: "New matches", count: 25 },
  { stage: "Initial screen", count: 18 },
  { stage: "Partner call", count: 9 },
  { stage: "Diligence", count: 5 },
  { stage: "Term sheet", count: 2 },
];

const watchlist = [
  {
    startup: "LedgerMint",
    sector: "Fintech infra",
    traction: "$82k MRR, 11% MoM",
    score: "High conviction",
  },
  {
    startup: "OpsPilot AI",
    sector: "Enterprise automation",
    traction: "5 design partners",
    score: "Watch closely",
  },
  {
    startup: "Verda Mobility",
    sector: "Climate logistics",
    traction: "2 city pilots",
    score: "Early stage fit",
  },
];

const diligence = [
  { company: "LedgerMint", item: "Security review", owner: "Anika", due: "Today" },
  { company: "FlowCarbon Labs", item: "Customer references", owner: "Ravi", due: "Mar 8" },
  { company: "OpsPilot AI", item: "Revenue quality check", owner: "Mehul", due: "Mar 9" },
  { company: "Verda Mobility", item: "Unit economics model", owner: "Tina", due: "Mar 11" },
];

const portfolio = [
  { company: "Nova Stack", update: "Expanded to UAE market", status: "On track" },
  { company: "CredAxis", update: "NPS climbed to 62", status: "Strong" },
  { company: "BuildLane", update: "Hiring VP Sales", status: "Monitor burn" },
];

export default function Home() {
  return (
    <main className="portal-page">
      <div className="shell portal-shell">
        <header className="site-header site-header--website">
          <nav className="nav nav-website">
            <div className="logo">VentureBridge</div>
            <div className="nav-center" aria-label="Investor sections">
              <Link className="nav-link" href="#">Dealflow</Link>
              <Link className="nav-link" href="#">Watchlist</Link>
              <Link className="nav-link" href="#">Diligence</Link>
              <Link className="nav-link" href="#">Portfolio</Link>
            </div>
            <div className="nav-right">
              <button className="pill">Create memo</button>
              <button className="pill pill-primary">Add deal</button>
            </div>
          </nav>
        </header>

        <header className="portal-top">
          <div>
            <p className="eyebrow">VentureBridge Investor Portal</p>
            <h1>Dealflow and diligence in one operating view</h1>
            <p className="lead">
              Source companies, run evaluations with your team, and move high-fit
              opportunities faster through IC.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary">Review matches</button>
            <button className="btn btn-secondary">Open IC notes</button>
          </div>
        </header>

        <section className="kpi-grid">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="kpi-card">
              <p>{kpi.label}</p>
              <strong>{kpi.value}</strong>
              <span>{kpi.delta}</span>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel panel-large">
            <div className="panel-head">
              <h2>Dealflow stages</h2>
              <a href="#">Open pipeline</a>
            </div>
            <div className="pipeline-list">
              {dealflow.map((item) => (
                <div key={item.stage} className="pipeline-row">
                  <div className="pipeline-meta">
                    <span>{item.stage}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="pipeline-track">
                    <div
                      className="pipeline-fill"
                      style={{ width: `${Math.min((item.count / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Watchlist highlights</h2>
              <a href="#">View all</a>
            </div>
            <div className="match-list">
              {watchlist.map((item) => (
                <div className="match-card" key={item.startup}>
                  <h3>{item.startup}</h3>
                  <p>{item.sector}</p>
                  <div className="match-meta">
                    <span>{item.traction}</span>
                    <span className={item.score === "High conviction" ? "tag strong" : "tag"}>
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Diligence queue</h2>
              <a href="#">Assign</a>
            </div>
            <ul className="task-list">
              {diligence.map((item) => (
                <li key={`${item.company}-${item.item}`}>
                  <div>
                    <p>{item.company}: {item.item}</p>
                    <small>Owner {item.owner} • Due {item.due}</small>
                  </div>
                  <span className="status-pill medium">Active</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Portfolio pulse</h2>
              <a href="#">Open reports</a>
            </div>
            <ul className="task-list">
              {portfolio.map((item) => (
                <li key={item.company}>
                  <div>
                    <p>{item.company}</p>
                    <small>{item.update}</small>
                  </div>
                  <span className={`status-pill ${item.status === "Strong" ? "low" : "high"}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
