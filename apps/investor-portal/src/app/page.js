import Link from "next/link";
import ProfileButton from "./components/ProfileButton";
import { apiGet } from "../lib/api";
import { requireAuth } from "@/lib/auth";

const matchStatusLabel = {
  pending:      "New",
  interested:   "Interested",
  passed:       "Passed",
  in_diligence: "Diligence",
  term_sheet:   "Term Sheet",
  closed:       "Closed",
};

export default async function Home() {
  await requireAuth();
  const data = await apiGet("/dashboard");
  const apiDown = data === null;

  const profile       = data?.profile ?? null;
  const kpisRaw       = data?.kpis ?? {};
  const dealflow      = data?.dealflow ?? [];
  const topMatches    = data?.topMatches ?? [];
  const diligenceItems = data?.diligenceItems ?? [];

  const kpis = [
    { label: "Startups in pipeline", value: String(kpisRaw.totalMatches   ?? 0), delta: `${kpisRaw.newMatches ?? 0} new matches` },
    { label: "Partner calls",        value: String(kpisRaw.partnerCalls   ?? 0), delta: "In diligence" },
    { label: "Live diligences",      value: String(kpisRaw.liveDiligences ?? 0), delta: "Open items" },
    { label: "Warm intros",          value: String(kpisRaw.warmIntros     ?? 0), delta: `${kpisRaw.termSheets ?? 0} term sheets` },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        {/* ── Floating nav ─────────────────────────────────────────────── */}
        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <span className="text-[1.35rem] font-bold tracking-tight">VentureBridge</span>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft" aria-label="Investor sections">
              <Link className="nav-link" href="/dealflow">Dealflow</Link>
              <Link className="nav-link" href="/watchlist">Watchlist</Link>
              <Link className="nav-link" href="/diligence">Diligence</Link>
              <Link className="nav-link" href="/portfolio">Portfolio</Link>
            </div>
            <div className="flex items-center justify-end gap-3">
              <a href={`mailto:?subject=${encodeURIComponent('Investment Memo')}&body=${encodeURIComponent('Draft investment memo for review.')}`} className="rounded-full border border-border px-4 py-1.5 bg-white/80 text-ink text-sm font-semibold cursor-pointer hover:bg-white transition-colors">
                Create memo
              </a>
              <Link href="/dealflow" className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold cursor-pointer border border-accent hover:opacity-90 transition-opacity">
                Add deal
              </Link>
              <ProfileButton />
            </div>
          </nav>
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">VentureBridge Investor Portal</p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-tight">
              {profile ? `${profile.firmName} — Dealflow and diligence` : "Dealflow and diligence in one operating view"}
            </h1>
            <p className="mt-3 max-w-xl text-ink-soft text-[1rem] leading-relaxed">
              Source companies, run evaluations with your team, and move high-fit opportunities faster through IC.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dealflow" className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-[0_10px_24px_rgba(233,111,58,0.28)] border-none cursor-pointer hover:opacity-90 transition-opacity">
              Review matches
            </Link>
            <Link href="/diligence" className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm cursor-pointer hover:bg-white/80 transition-colors">
              Open diligence
            </Link>
          </div>
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the investor API is running and try again.
          </div>
        )}

        {!apiDown && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium flex items-center justify-between">
            <span>Your investor profile is not complete yet.</span>
            <Link href="/profile" className="rounded-[10px] px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-amber-700 transition-colors">Complete Profile</Link>
          </div>
        )}

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="bg-card border border-border rounded-[18px] p-4 grid gap-1.5">
              <p className="text-sm text-ink-soft">{kpi.label}</p>
              <strong className="text-[1.7rem] font-bold tracking-tight leading-none">{kpi.value}</strong>
              <span className="text-[0.82rem] font-semibold text-accent-2">{kpi.delta}</span>
            </article>
          ))}
        </section>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-3.5">

          {/* Dealflow stages — spans 2 rows */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4 lg:row-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Dealflow stages</h2>
              <Link href="/dealflow" className="text-accent text-sm font-semibold">Open pipeline</Link>
            </div>
            {dealflow.length > 0 ? (
              <div className="grid gap-3">
                {dealflow.map((item) => (
                  <div key={item.stage} className="grid gap-1.5">
                    <div className="flex justify-between items-center text-[0.9rem]">
                      <span>{item.stage}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <div className="h-2 bg-black/8 rounded-full overflow-hidden">
                      <div className="pipeline-fill" style={{ width: `${Math.min((item.count / Math.max(...dealflow.map((d) => d.count), 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No deals in your pipeline yet.</p>
            )}
          </article>

          {/* Top matches */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Top matches</h2>
              <Link href="/dealflow" className="text-accent text-sm font-semibold">View all</Link>
            </div>
            {topMatches.length > 0 ? (
              <div className="grid gap-2.5">
                {topMatches.map((m) => (
                  <div key={m.id} className="border border-border rounded-[14px] p-3 grid gap-2">
                    <p className="font-semibold text-sm">{m.companyName}</p>
                    <p className="text-ink-soft text-[0.85rem]">{m.sector}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-soft capitalize">{m.status}</span>
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${
                        m.matchScore >= 70
                          ? "bg-[rgba(45,122,94,0.12)] text-accent-2"
                          : "bg-black/8 text-ink-soft"
                      }`}>
                        Score {m.matchScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No active matches yet.</p>
            )}
          </article>

          {/* Diligence queue */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Diligence queue</h2>
              <Link href="/diligence" className="text-accent text-sm font-semibold">View all</Link>
            </div>
            {diligenceItems.length > 0 ? (
              <ul className="grid gap-2.5">
                {diligenceItems.map((d) => (
                  <li key={d.id} className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-3 py-2.5">
                    <div>
                      <p className="text-sm leading-snug">{d.companyName}: {d.title}</p>
                      <small className="text-xs text-ink-soft capitalize">
                        {d.assignedTo ? `Owner ${d.assignedTo}` : "Unassigned"} · {d.category}
                      </small>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                      d.status === "flagged" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {d.status === "flagged" ? "Flagged" : "Active"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft text-sm">No open diligence items.</p>
            )}
          </article>

        </section>
      </div>
    </main>
  );
}
