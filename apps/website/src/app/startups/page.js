import PortalLayout from "../components/PortalLayout";

export const metadata = {
  title: "Startup Portal | VentureBridge",
  description:
    "Startup funding portal for equity, bank loans, and government schemes.",
};

const modules = [
  {
    title: "Equity Raise",
    body: "Pitch to global VCs and family offices with curated exposure.",
    items: ["Upload traction metrics", "Match to investor mandates", "Live term sheet tracking"],
    stroke: "#E96F3A",
    path: "M4 36C28 30 56 28 84 20C112 12 140 14 168 18C186 20 194 16 196 14",
  },
  {
    title: "Bank & Venture Debt",
    body: "Receive cross-border lending offers based on credit readiness.",
    items: ["Credit score simulation", "Collateral checklist", "Repayment modeling"],
    stroke: "#2E6B5D",
    path: "M6 34C34 28 56 20 78 22C100 24 120 30 142 26C164 22 182 16 196 12",
  },
  {
    title: "Government Schemes",
    body: "Auto-match national and state incentives with eligibility checks.",
    items: ["Sector eligibility scan", "Compliance reminders", "Grant documentation tracker"],
    stroke: "#193A5B",
    path: "M6 36C28 32 50 30 72 28C94 26 114 22 132 18C150 14 170 18 196 22",
  },
];

const validationSteps = [
  { step: "Step 1", body: "Upload pitch deck, model, and cap table." },
  { step: "Step 2", body: "Receive feedback, red-flag notes, and improvements." },
  { step: "Step 3", body: "Get published to investor pipelines once approved." },
];

const kpis = [
  { value: "92%", label: "Profiles approved" },
  { value: "3.4x", label: "Faster feedback loop" },
  { value: "6", label: "Analyst touchpoints" },
];

export default function Startups() {
  const navLinks = [
    { href: "#funding-options", label: "Funding Options" },
    { href: "#validation", label: "Validation" },
    { href: "/investors", label: "For Investors" },
  ];

  return (
    <PortalLayout
      navLinks={navLinks}
      tag="Founder launchpad"
      title="Startup Funding Hub"
      description="Build a single profile and unlock equity, venture debt, and scheme funding with validation by experienced advisors."
      cta="Create Startup Profile"
      footerNote="Success-fee commissions apply only after a closed deal."
    >
      <section id="funding-options" className="py-14">
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

      <section id="validation" className="py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Validation workflow
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          Analysts validate your financials and narrative before investor distribution,
          improving credibility and funding speed.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {validationSteps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <h3 className="font-display text-base font-semibold text-ink">{s.step}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-5 text-center">
              <strong className="block font-display text-2xl font-semibold text-ink">{k.value}</strong>
              <span className="mt-0.5 text-sm text-ink-soft">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Deal preview card */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Pitch Preview: CrediWeave</h3>
              <p className="mt-1 text-sm text-ink-soft">Embedded credit underwriting stack.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Awaiting Review
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-soft">
            <div>Runway: 14 months</div>
            <div>Monthly Revenue: ₹42L</div>
            <div>Target Raise: $1.2M</div>
            <div>Preferred Terms: SAFE</div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-xl border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:shadow-sm">
              Upload New Metrics
            </button>
            <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft transition-all hover:text-ink">
              View Analyst Notes
            </button>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
