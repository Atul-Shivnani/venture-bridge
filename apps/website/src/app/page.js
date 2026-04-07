import Link from "next/link";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Header
        variant="website"
        centerLinks={[
            { href: "/investors", label: "For Investors" },
            { href: "/startups", label: "For Startups" },
            {
              label: "Explore",
              dropdown: [
                { href: "#explorers", label: "What we do" },
                { href: "#contact", label: "Reach us" },
              ],
            },
          ]}
        />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        {/* Hero */}
        <section className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              Direct capital for Indian founders
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Replace intermediaries with verified, data-led funding.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
              VentureBridge connects Indian startups directly to global VCs,
              family offices, and cross-border lenders, with investment banking
              grade validation and analytics baked in.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/startups"
                className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(233,111,58,0.25)] transition-all hover:opacity-90"
              >
                Launch Startup Profile
              </Link>
              <Link
                href="/investors"
                className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-ink transition-all hover:shadow-sm"
              >
                Explore Opportunities
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <strong className="block font-display text-2xl font-semibold text-ink">320+</strong>
                <span className="mt-0.5 text-xs text-ink-soft">Active investor mandates</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <strong className="block font-display text-2xl font-semibold text-ink">11</strong>
                <span className="mt-0.5 text-xs text-ink-soft">Validation checkpoints</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <strong className="block font-display text-2xl font-semibold text-ink">48 hrs</strong>
                <span className="mt-0.5 text-xs text-ink-soft">Typical response window</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_20px_50px_rgba(24,20,18,0.08)]">
            <h3 className="font-display text-lg font-semibold text-ink">Live Deal Board</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Curated opportunities matched by sector thesis, ticket size, and credit-readiness.
            </p>
            <div className="mt-5 space-y-2">
              {[
                "Clean energy SaaS · Series A · $6M",
                "Healthtech diagnostics · Pre-seed · $750K",
                "Logistics AI · Growth · $12M + debt",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-ink-soft"
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { value: "34", label: "Active raises" },
                { value: "18", label: "Bank-ready" },
                { value: "9", label: "Schemes matched" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl bg-bg px-3 py-3 text-center">
                  <strong className="block font-display text-xl font-semibold text-ink">{k.value}</strong>
                  <span className="text-xs text-ink-soft">{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three lanes */}
        <section className="py-14" id="explorers">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Three lanes. One trusted network.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                A single platform for equity, venture debt, and government or
                bank-backed schemes. Every startup passes commercial, compliance,
                and credit scoring before investors see it.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Equity Capital",
                  body: "VCs and family offices see validated pitches with clean cap-tables, traction, and diligence notes.",
                },
                {
                  title: "Bank Loans",
                  body: "Cross-border lenders evaluate credit-ready businesses through standardized risk packs.",
                },
                {
                  title: "Govt. Schemes",
                  body: "Auto-matched grants and incentives for eligible sectors with a guided compliance path.",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                  <h3 className="font-display text-base font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency & speed */}
        <section className="py-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Built for transparency and speed.
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Investment bankers and advisors validate key metrics before investors
            receive access, reducing noise and accelerating decisions.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Confidence Scores",
                body: "Every startup is graded across revenue quality, unit economics, and governance maturity.",
              },
              {
                title: "Verified Documents",
                body: "Structured data rooms with red-flag indicators and audit trails.",
              },
              {
                title: "Deal Orchestration",
                body: "Centralized term sheet workflow, updates, and milestone tracking.",
              },
              {
                title: "Commission Logic",
                body: "Transparent success-fee rules shared across investors and founders.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                <h3 className="font-display text-base font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Bar chart insight */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <strong className="text-sm font-semibold text-ink">Top interest sectors</strong>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Climate", pct: "86%" },
                  { label: "Fintech", pct: "74%" },
                  { label: "Health", pct: "62%" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className="w-14 flex-shrink-0">{b.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-ink/8">
                      <div className="h-2 rounded-full bg-accent" style={{ width: b.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* KPI insight */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
              <strong className="text-sm font-semibold text-ink">Deal pipeline</strong>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { value: "34", label: "Active raises" },
                  { value: "18", label: "Bank-ready" },
                  { value: "9", label: "Schemes matched" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-bg px-3 py-4 text-center">
                    <strong className="block font-display text-2xl font-semibold text-ink">{k.value}</strong>
                    <span className="mt-0.5 text-xs text-ink-soft">{k.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Choose your portal */}
        <section className="py-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Choose your portal.
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Investor Portal",
                body: "Invite-only access to sector-matched opportunities and diligence dashboards.",
                href: "/investors",
                cta: "Open Investor View",
              },
              {
                title: "Startup Portal",
                body: "Build a pitch profile, select funding lanes, and get matched to capital.",
                href: "/startups",
                cta: "Open Startup View",
              },
              {
                title: "Admin Console",
                body: "Control approvals, analyst assignments, and policy compliance.",
                href: "/admin",
                cta: "Open Admin View",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(24,20,18,0.08)]">
                <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
                <Link
                  href={c.href}
                  className="mt-5 inline-flex rounded-full border border-border bg-bg/60 px-4 py-1.5 text-sm font-medium text-ink-soft transition-all hover:border-ink/20 hover:text-ink hover:shadow-sm"
                >
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <Footer note="Prototype showcase for VentureBridge. Success-fee commissions applied only on closed deals." />
      </div>
    </div>
  );
}
