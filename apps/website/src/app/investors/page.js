import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Investor Portal | VentureBridge",
  description:
    "Invite-only investor portal with validated Indian startup opportunities.",
};

const modules = [
  {
    title: "Portfolio Match Index",
    body: "86% alignment with your climate + fintech thesis.",
    items: ["AlphaGrid · Series A · $4M", "CrediWeave · Pre-seed · $600K", "SolarStack · Growth · $8M + debt"],
    stroke: "#E96F3A",
    path: "M4 40C28 22 52 20 76 26C100 32 124 18 148 14C172 10 188 16 196 20",
  },
  {
    title: "Due Diligence Snapshot",
    body: "11 checks complete, 2 follow-ups pending.",
    items: ["Revenue Quality: Strong", "Governance: Mature", "Legal: Standardized"],
    stroke: "#2E6B5D",
    path: "M6 34C32 30 56 26 82 18C108 10 132 12 156 18C180 24 190 16 196 12",
  },
  {
    title: "Deal Room Updates",
    body: "Track term sheets, syndicates, and live milestones.",
    items: ["2 new term sheets this week", "5 active co-investors", "Avg. close time: 21 days"],
    stroke: "#193A5B",
    path: "M4 36C28 34 48 26 72 20C96 14 124 10 156 16C176 20 188 22 196 18",
  },
];

const howItWorks = [
  {
    title: "Screen",
    body: "Receive a curated list filtered by ticket size, sector, and stage.",
  },
  {
    title: "Analyze",
    body: "Review banker commentary, unit economics, and red-flag flags.",
  },
  {
    title: "Commit",
    body: "Execute term sheets with guided workflows and milestone alerts.",
  },
];

const tableRows = [
  { name: "AlphaGrid", stage: "Series A", ticket: "$4M", status: "DD Pack Ready" },
  { name: "CrediWeave", stage: "Pre-seed", ticket: "$600K", status: "Term Sheet Draft" },
  { name: "SolarStack", stage: "Growth", ticket: "$8M + Debt", status: "Co-investor Review" },
];

export default function Investors() {
  const navLinks = [
    { href: "#deal-flow", label: "Deal Flow" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "/startups", label: "For Startups" },
  ];

  return (
    <PortalLayout
      navLinks={navLinks}
      tag="Invite-only access"
      title="Investor Opportunity Desk"
      description="View vetted Indian startups matched to your mandate. Each deal is pre-scored, with banker notes and structured diligence packs."
      cta="Request Admin Access"
      footerNote="Access is granted only after admin validation and mandate approval."
    >
      <section id="deal-flow" className="py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {modules.map((m) => (
            <div key={m.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <h4 className="font-display text-base font-semibold text-ink">{m.title}</h4>
              <p className="mt-1 text-sm text-ink-soft">{m.body}</p>
              <div className="mt-4 space-y-2">
                {m.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    {item}
                  </div>
                ))}
              </div>
              <svg className="mt-5 w-full" viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={m.path} stroke={m.stroke} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          How investors use VentureBridge
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {howItWorks.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <h3 className="font-display text-base font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Deal table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Opportunity
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Stage
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Ticket
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={row.name} className={i < tableRows.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-5 py-4 font-medium text-ink">{row.name}</td>
                  <td className="px-5 py-4 text-ink-soft">{row.stage}</td>
                  <td className="px-5 py-4 text-ink-soft">{row.ticket}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-accent-2/10 px-2.5 py-0.5 text-xs font-medium text-accent-2">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deal spotlight card */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Deal Spotlight: AlphaGrid</h3>
              <p className="mt-1 text-sm text-ink-soft">Climate analytics platform for utilities.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Live DD
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-soft">
            <div>ARR: $1.8M · 120% YoY</div>
            <div>Gross Margin: 74%</div>
            <div>Round Target: $4M</div>
            <div>Lead: Pending</div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-xl border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:shadow-sm">
              Open Data Room
            </button>
            <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition-all hover:text-ink">
              Invite Co-Investor
            </button>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
