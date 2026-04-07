import Link from "next/link";
import ProfileButton from "./components/ProfileButton";
import { apiGet } from "../lib/api";
import { requireAuth } from "@/lib/auth";

const urgencyCls = {
  Urgent:  "bg-red-100 text-red-700",
  Pending: "bg-purple-100 text-purple-700",
};

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://localhost:8003";

export default async function Home() {
  await requireAuth();
  const data = await apiGet("/dashboard");
  const apiDown = data === null;

  const kpisRaw      = data?.kpis         ?? {};
  const pendingUsers = data?.pendingUsers  ?? [];
  const openDiligence = data?.openDiligence ?? [];
  const analysts     = data?.analysts      ?? [];

  const kpis = [
    { label: "Approvals pending", value: String(kpisRaw.pendingApprovals ?? 0), delta: `${pendingUsers.filter((u) => u.portal === "investor").length} investors` },
    { label: "Active deals",      value: String(kpisRaw.activeDeals      ?? 0), delta: `${kpisRaw.liveDeals ?? 0} live` },
    { label: "Escalations",       value: String(kpisRaw.escalations      ?? 0), delta: (kpisRaw.escalations ?? 0) > 0 ? "Needs review" : "All clear" },
    { label: "Open diligence",    value: String(kpisRaw.openDiligence    ?? 0), delta: "Across all deals" },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        {/* ── Floating nav ─────────────────────────────────────────────── */}
        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <span className="text-[1.35rem] font-bold tracking-tight">VentureBridge</span>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft" aria-label="Admin sections">
              <Link className="nav-link" href="/approvals">Approvals</Link>
              <Link className="nav-link" href="/deals">Deals</Link>
              <Link className="nav-link" href="/diligence">Diligence</Link>
              <Link className="nav-link" href="/compliance">Compliance</Link>
              <Link className="nav-link" href="/analysts">Analysts</Link>
            </div>
            <div className="flex items-center justify-end gap-3">
              <a href={`${ADMIN_API_URL}/deals/export`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-4 py-1.5 bg-white/80 text-ink text-sm font-semibold cursor-pointer hover:bg-white transition-colors">
                Export report
              </a>
              <Link href="/approvals" className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold cursor-pointer border border-accent hover:opacity-90 transition-opacity">
                Review queue
              </Link>
              <ProfileButton />
            </div>
          </nav>
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">VentureBridge Admin Portal</p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-tight">
              Operations and compliance control center
            </h1>
            <p className="mt-3 max-w-xl text-ink-soft text-[1rem] leading-relaxed">
              Manage approvals, monitor analyst workload, and maintain compliance coverage across all active deals.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/approvals" className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-[0_10px_24px_rgba(124,58,237,0.28)] border-none cursor-pointer hover:opacity-90 transition-opacity">
              Process approvals
            </Link>
            <Link href="/deals" className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm cursor-pointer hover:bg-white/80 transition-colors">
              View deals
            </Link>
          </div>
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="bg-card border border-border rounded-[18px] p-4 grid gap-1.5">
              <p className="text-sm text-ink-soft">{kpi.label}</p>
              <strong className="text-[1.7rem] font-bold tracking-tight leading-none">{kpi.value}</strong>
              <span className="text-[0.82rem] font-semibold text-accent">{kpi.delta}</span>
            </article>
          ))}
        </section>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-3.5">

          {/* Approvals queue — spans 2 rows */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4 lg:row-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Approvals queue</h2>
              <Link href="/approvals" className="text-accent text-sm font-semibold">Process all</Link>
            </div>
            {pendingUsers.length > 0 ? (
              <ul className="grid gap-2.5">
                {pendingUsers.map((u) => {
                  const name    = u.name ?? u.email;
                  const type    = u.portal === "investor" ? "Investor onboarding" : "Startup registration";
                  const urgency = u.portal === "investor" ? "Urgent" : "Pending";
                  return (
                    <li key={u.id} className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-3 py-2.5">
                      <div>
                        <p className="text-sm leading-snug font-medium">{name}: {type}</p>
                        <small className="text-xs text-ink-soft">{u.email}</small>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${urgencyCls[urgency]}`}>
                        {urgency}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-ink-soft text-sm">No pending approvals.</p>
            )}
          </article>

          {/* Open diligence */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Open diligence</h2>
              <Link href="/diligence" className="text-accent text-sm font-semibold">Full view</Link>
            </div>
            {openDiligence.length > 0 ? (
              <div className="grid gap-3">
                {openDiligence.map((item) => (
                  <div key={item.id} className="grid gap-1.5">
                    <div className="flex justify-between items-center text-[0.9rem]">
                      <span className="truncate">{item.companyName}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                        item.status === "flagged" ? "text-red-600" : "text-orange-600"
                      }`}>{item.status}</span>
                    </div>
                    <p className="text-xs text-ink-soft truncate">{item.title} · {item.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No open diligence items.</p>
            )}
          </article>

          {/* Analyst workload */}
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold tracking-tight">Analyst workload</h2>
              <Link href="/analysts" className="text-accent text-sm font-semibold">Manage</Link>
            </div>
            {analysts.length > 0 ? (
              <ul className="grid gap-2.5">
                {analysts.map((a) => (
                  <li key={a.id} className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{a.email}</p>
                      <small className="text-xs text-ink-soft">
                        Deals {a.assignedDeals} · Open items {a.assignedItems}
                      </small>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                      a.assignedDeals > 4 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {a.assignedDeals > 4 ? "Heavy" : "Normal"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft text-sm">No analysts found.</p>
            )}
          </article>

        </section>
      </div>
    </main>
  );
}
