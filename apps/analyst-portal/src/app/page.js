import Link from "next/link";
import ProfileButton from "./components/ProfileButton";
import { apiGet } from "../lib/api";
import { requireAuth } from "@/lib/auth";

const stageBadge = (stage) => {
  const map = {
    pre_seed: "bg-violet-100 text-violet-700",
    seed:     "bg-blue-100 text-blue-700",
    series_a: "bg-sky-100 text-sky-700",
    series_b: "bg-cyan-100 text-cyan-700",
  };
  return map[stage] ?? "bg-gray-100 text-gray-600";
};

export default async function Home() {
  await requireAuth();
  const data = await apiGet("/dashboard");
  const apiDown = data === null;

  const kpis          = data?.kpis          ?? {};
  const pendingList   = data?.pendingAnalysis ?? [];
  const recentDeals   = data?.recentDeals    ?? [];

  const kpiCards = [
    { label: "Assigned deals",    value: String(kpis.assignedDeals   ?? 0), sub: "total in pipeline" },
    { label: "Pending analysis",  value: String(kpis.pendingAnalysis  ?? 0), sub: "awaiting Claude" },
    { label: "Matches to review", value: String(kpis.matchesToReview  ?? 0), sub: "investor introductions" },
    { label: "Analyzed",          value: String(kpis.analyzed         ?? 0), sub: "completed diligence" },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        {/* Nav */}
        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
            <span className="text-[1.35rem] font-bold tracking-tight">VentureBridge</span>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft">
              <Link className="nav-link" href="/deals">Deals</Link>
              <Link className="nav-link" href="/profile">Profile</Link>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/deals"
                className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold border border-accent hover:opacity-90 transition-opacity"
              >
                Open deals
              </Link>
              <ProfileButton />
            </div>
          </nav>
        </header>

        {/* Hero */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">VentureBridge Analyst Portal</p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-tight">
              Deal diligence workspace
            </h1>
            <p className="mt-3 max-w-xl text-ink-soft text-[1rem] leading-relaxed">
              Paste financial statements and let Claude extract structured metrics instantly. Review investor matches and move deals forward.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/deals"
              className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-[0_10px_24px_rgba(14,165,233,0.28)] border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Start analyzing
            </Link>
          </div>
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the analyst API. Please ensure the service is running and try again.
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {kpiCards.map((k) => (
            <article key={k.label} className="bg-card border border-border rounded-[18px] p-4 grid gap-1.5">
              <p className="text-sm text-ink-soft">{k.label}</p>
              <strong className="text-[1.7rem] font-bold tracking-tight leading-none">{k.value}</strong>
              <span className="text-[0.82rem] font-semibold text-accent">{k.sub}</span>
            </article>
          ))}
        </section>

        {/* Content grid */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-3.5">

          {/* Recent deals */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Recent deals</h2>
              <Link href="/deals" className="text-accent text-sm font-semibold">All deals</Link>
            </div>
            {recentDeals.length > 0 ? (
              <ul className="grid gap-2.5">
                {recentDeals.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/deals/${d.id}`}
                      className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-3 py-2.5 no-underline text-ink hover:bg-sky-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.companyName}</p>
                        <p className="text-xs text-ink-soft truncate">{d.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${stageBadge(d.stage)}`}>
                          {d.stage?.replace("_", " ")}
                        </span>
                        {d.analyzed ? (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700">Analyzed</span>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700">Pending</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft text-sm">No deals assigned yet.</p>
            )}
          </article>

          {/* Pending analysis queue */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Needs analysis</h2>
              <Link href="/deals" className="text-accent text-sm font-semibold">View all</Link>
            </div>
            {pendingList.length > 0 ? (
              <ul className="grid gap-2.5">
                {pendingList.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/deals/${d.id}`}
                      className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-3 py-2.5 no-underline text-ink hover:bg-sky-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.companyName}</p>
                        <p className="text-xs text-ink-soft truncate">{d.title}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold rounded-full px-2.5 py-1 bg-amber-100 text-amber-700">
                        Analyze
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <span className="text-2xl">✓</span>
                <p className="text-ink-soft text-sm">All deals analyzed!</p>
              </div>
            )}
          </article>

        </section>
      </div>
    </main>
  );
}
