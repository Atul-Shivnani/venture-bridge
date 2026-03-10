import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Admin Console | VentureBridge",
  description:
    "Admin console for approvals, validation workflows, and policy controls.",
};

const dashboardCards1 = [
  {
    title: "Daily Snapshot",
    sub: "16 approvals pending · 3 escalations · 2 policy updates",
    statusItems: [
      { label: "Investor approvals", count: "4" },
      { label: "Startup approvals", count: "12" },
      { label: "Analyst tasks", count: "8" },
    ],
  },
];

const complianceBars = [
  { label: "KYC", pct: "88%" },
  { label: "AML", pct: "71%" },
  { label: "ESG", pct: "64%" },
];

const workloadRows = [
  { team: "Analyst", cases: 18 },
  { team: "Legal", cases: 7 },
  { team: "Risk", cases: 5 },
];

const queueModules = [
  {
    title: "Approvals Queue",
    items: [
      "OceanGrid · Compliance review",
      "Vale Capital · Mandate verification",
      "Nova Health · Analyst assignment",
    ],
    stroke: "#E96F3A",
    path: "M6 36C30 30 54 26 76 20C98 14 120 16 142 18C164 20 182 16 196 12",
  },
  {
    title: "Analyst Workbench",
    items: ["Financial model review", "Market size validation", "Governance checklist"],
    stroke: "#2E6B5D",
    path: "M6 34C26 32 46 28 66 24C86 20 108 22 132 24C156 26 178 20 196 16",
  },
  {
    title: "Risk & Policy",
    items: ["Auto-flagged anomalies: 2", "Policy updates: 1 pending", "Weekly audit log export"],
    stroke: "#193A5B",
    path: "M6 36C34 30 60 26 86 24C112 22 136 18 156 16C176 14 188 18 196 22",
  },
];

const sideNavItems = [
  "Overview",
  "Approvals Queue",
  "Analyst Workbench",
  "Risk & Policy",
  "Deal Oversight",
  "Reports",
];

export default function Admin() {
  const navLinks = [
    { href: "#overview", label: "Overview" },
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
      footerNote="Admin console view for internal operations and compliance."
    >
      <section id="overview" className="py-14">
        <div className="flex gap-6">
          {/* Side nav */}
          <aside className="hidden w-44 flex-shrink-0 lg:block">
            <nav className="sticky top-24 rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-soft">Admin Menu</p>
              <ul className="space-y-1">
                {sideNavItems.map((item, i) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                        i === 0
                          ? "bg-accent/10 font-semibold text-accent"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-5">
            {/* Row 1 */}
            <div className="grid gap-5 sm:grid-cols-3">
              {/* Daily snapshot */}
              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                <h4 className="font-display text-base font-semibold text-ink">Daily Snapshot</h4>
                <p className="mt-1 text-sm text-ink-soft">
                  16 approvals pending · 3 escalations · 2 policy updates
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Investor approvals", count: "4" },
                    { label: "Startup approvals", count: "12" },
                    { label: "Analyst tasks", count: "8" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-sm text-ink-soft">
                      <span>{s.label}</span>
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent/10 px-1.5 text-xs font-semibold text-accent">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance bars */}
              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                <h4 className="font-display text-base font-semibold text-ink">Compliance Coverage</h4>
                <div className="mt-4 space-y-3">
                  {complianceBars.map((b) => (
                    <div key={b.label} className="flex items-center gap-3 text-sm text-ink-soft">
                      <span className="w-10 flex-shrink-0">{b.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-ink/8">
                        <div className="h-2 rounded-full bg-accent-2" style={{ width: b.pct }} />
                      </div>
                      <span className="text-xs">{b.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workload table */}
              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                <h4 className="font-display text-base font-semibold text-ink">Weekly Workload</h4>
                <div className="mt-4 overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                          Team
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                          Cases
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workloadRows.map((row, i) => (
                        <tr key={row.team} className={i < workloadRows.length - 1 ? "border-b border-border" : ""}>
                          <td className="px-3 py-3 text-ink">{row.team}</td>
                          <td className="px-3 py-3 text-ink-soft">{row.cases}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid gap-5 sm:grid-cols-3">
              {queueModules.map((m) => (
                <div key={m.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                  <h4 className="font-display text-base font-semibold text-ink">{m.title}</h4>
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

            {/* Policy review card */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Policy Review: New Lending Partner
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">Cross-border debt provider onboarding.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-accent-3/10 px-3 py-1 text-xs font-semibold text-accent-3">
                  In Review
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-soft">
                <div>KYC Status: 92% complete</div>
                <div>Jurisdiction: Singapore</div>
                <div>Risk Tier: Medium</div>
                <div>Advisor Owner: R. Sharma</div>
              </div>
              <div className="mt-5 flex gap-3">
                <button className="rounded-xl border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:shadow-sm">
                  Request Missing Docs
                </button>
                <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition-all hover:text-ink">
                  Approve Conditionally
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
