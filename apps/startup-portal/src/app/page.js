import Link from "next/link";

const kpis = [
  { label: "Active investors", value: "42", delta: "+8 this week" },
  { label: "Replies received", value: "11", delta: "26% reply rate" },
  { label: "Meetings booked", value: "4", delta: "2 this week" },
  { label: "Warm intros found", value: "9", delta: "3 pending" },
];

const pipeline = [
  { stage: "Research", count: 21 },
  { stage: "Outreach sent", count: 14 },
  { stage: "Reply received", count: 11 },
  { stage: "Partner call", count: 4 },
  { stage: "Due diligence", count: 2 },
];

const tasks = [
  { title: "Send follow-up to Arcadia Ventures", due: "Today", priority: "High" },
  { title: "Update traction slide (MRR + churn)", due: "Tomorrow", priority: "Medium" },
  { title: "Prepare data room for diligence", due: "Mar 10", priority: "High" },
  { title: "Review 7 new investor matches", due: "Mar 11", priority: "Low" },
];

const matches = [
  {
    name: "Pine Crest Capital",
    focus: "B2B SaaS, fintech infra",
    checkSize: "$500k - $2M",
    fit: "Strong fit",
  },
  {
    name: "Northline Angels",
    focus: "Pre-seed marketplaces",
    checkSize: "$50k - $250k",
    fit: "Medium fit",
  },
  {
    name: "Orion Early",
    focus: "AI workflow tools",
    checkSize: "$250k - $1M",
    fit: "Strong fit",
  },
];

const checklist = [
  { item: "Deck uploaded and tracked", done: true },
  { item: "Data room linked", done: false },
  { item: "Target investor thesis defined", done: true },
  { item: "Outreach sequence configured", done: false },
  { item: "Weekly pipeline review set", done: true },
];

export default function Home() {
  return (
    <main className="portal-page">
      <div className="shell portal-shell">
        <header className="site-header site-header--website">
          <nav className="nav nav-website">
            <div className="logo">VentureBridge</div>
            <div className="nav-center" aria-label="Startup sections">
              <Link className="nav-link" href="#">Pipeline</Link>
              <Link className="nav-link" href="#">Investors</Link>
              <Link className="nav-link" href="#">Tasks</Link>
              <Link className="nav-link" href="#">Data Room</Link>
            </div>
            <div className="nav-right">
              <button className="pill">Invite teammate</button>
              <button className="pill pill-primary">New outreach</button>
            </div>
          </nav>
        </header>

        <header className="portal-top">
          <div>
            <p className="eyebrow">VentureBridge Startup Portal</p>
            <h1>Fundraising command center for your team</h1>
            <p className="lead">
              Track investors, manage outreach, and keep your raise moving from
              first contact to close.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary">Add investor</button>
            <button className="btn btn-secondary">Upload deck</button>
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
              <h2>Fundraising pipeline</h2>
              <a href="#">View CRM</a>
            </div>
            <div className="pipeline-list">
              {pipeline.map((item) => (
                <div key={item.stage} className="pipeline-row">
                  <div className="pipeline-meta">
                    <span>{item.stage}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="pipeline-track">
                    <div
                      className="pipeline-fill"
                      style={{ width: `${Math.min((item.count / 21) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Readiness checklist</h2>
              <a href="#">Open onboarding</a>
            </div>
            <ul className="check-list">
              {checklist.map((row) => (
                <li key={row.item} className={row.done ? "done" : ""}>
                  <span>{row.done ? "Done" : "Todo"}</span>
                  <p>{row.item}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Investor matches</h2>
              <a href="#">See all</a>
            </div>
            <div className="match-list">
              {matches.map((match) => (
                <div className="match-card" key={match.name}>
                  <h3>{match.name}</h3>
                  <p>{match.focus}</p>
                  <div className="match-meta">
                    <span>{match.checkSize}</span>
                    <span className={match.fit === "Strong fit" ? "tag strong" : "tag"}>
                      {match.fit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Priority tasks</h2>
              <a href="#">Manage</a>
            </div>
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.title}>
                  <div>
                    <p>{task.title}</p>
                    <small>Due {task.due}</small>
                  </div>
                  <span className={`status-pill ${task.priority.toLowerCase()}`}>
                    {task.priority}
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
