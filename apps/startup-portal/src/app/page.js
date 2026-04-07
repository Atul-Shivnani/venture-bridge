import Link from "next/link";
import ProfileButton from "./components/ProfileButton";
import { apiGet } from "../lib/api";
import { requireAuth } from "@/lib/auth";

export default async function Home() {
  await requireAuth();
  const [data, taskData] = await Promise.all([apiGet("/dashboard"), apiGet("/tasks")]);
  const apiDown = data === null;
  const { profile, kpis = {}, pipeline = [], topMatches = [] } = data ?? {};
  const taskCounts = taskData?.counts ?? { open: 0, flagged: 0, complete: 0 };
  const recentTasks = (taskData?.items ?? []).slice(0, 3);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        {/* ── Floating nav ─────────────────────────────────────────────── */}
        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <span className="text-[1.35rem] font-bold tracking-tight">VentureBridge</span>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft">
              <Link className="nav-link" href="/pipeline">Pipeline</Link>
              <Link className="nav-link" href="/investors">Investors</Link>
              <Link className="nav-link" href="/tasks">Tasks</Link>
              <Link className="nav-link" href="/data-room">Data Room</Link>
            </div>
            <div className="flex items-center justify-end gap-3">
              <a href={`mailto:?subject=${encodeURIComponent('Join our VentureBridge team')}&body=${encodeURIComponent('I\'d like to invite you to collaborate on our fundraising through VentureBridge.')}`} className="rounded-full border border-border px-4 py-1.5 bg-white/80 text-ink text-sm font-semibold hover:bg-white transition-colors">Invite teammate</a>
              <Link href="/investors" className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold border border-accent hover:opacity-90 transition-opacity">New outreach</Link>
              <ProfileButton />
            </div>
          </nav>
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">VentureBridge Startup Portal</p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-tight">
              {profile ? `${profile.companyName} — Fundraising command center` : "Fundraising command center for your team"}
            </h1>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/investors" className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-[0_10px_24px_rgba(233,111,58,0.28)] hover:opacity-90 transition-opacity">Add investor</Link>
            <Link href="/data-room" className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">Data Room</Link>
          </div>
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        {!apiDown && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium flex items-center justify-between">
            <span>Your startup profile is not complete yet.</span>
            <Link href="/profile" className="rounded-[10px] px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-amber-700 transition-colors">Complete Profile</Link>
          </div>
        )}

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: "Active investors",  value: kpis.activeInvestors  ?? 0, delta: `${kpis.totalMatches ?? 0} total matches` },
            { label: "Replies received",  value: kpis.repliesReceived  ?? 0, delta: kpis.totalMatches ? `${Math.round(((kpis.repliesReceived ?? 0) / kpis.totalMatches) * 100)}% reply rate` : "No matches yet" },
            { label: "Meetings booked",   value: kpis.meetingsBooked   ?? 0, delta: "In diligence" },
            { label: "Warm intros found", value: kpis.warmIntros       ?? 0, delta: "Interested" },
          ].map((k) => (
            <article key={k.label} className="bg-card border border-border rounded-[18px] p-4 grid gap-1.5">
              <p className="text-sm text-ink-soft">{k.label}</p>
              <strong className="text-[1.7rem] font-bold tracking-tight leading-none">{k.value}</strong>
              <span className="text-[0.82rem] font-semibold text-accent-2">{k.delta}</span>
            </article>
          ))}
        </section>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-3.5">

          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4 lg:row-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold">Fundraising pipeline</h2>
              <Link href="/pipeline" className="text-accent text-sm font-semibold">View CRM</Link>
            </div>
            {pipeline.length > 0 ? (
              <div className="grid gap-3">
                {pipeline.map((item) => (
                  <div key={item.stage} className="grid gap-1.5">
                    <div className="flex justify-between text-[0.9rem]">
                      <span>{item.stage}</span><strong>{item.count}</strong>
                    </div>
                    <div className="h-2 bg-black/8 rounded-full overflow-hidden">
                      <div className="pipeline-fill" style={{ width: `${Math.min((item.count / Math.max(...pipeline.map((p) => p.count), 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No deals yet.</p>
            )}
          </article>

          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold">Investor matches</h2>
              <Link href="/investors" className="text-accent text-sm font-semibold">See all</Link>
            </div>
            {topMatches.length > 0 ? (
              <div className="grid gap-2.5">
                {topMatches.map((m) => (
                  <div key={m.id} className="border border-border rounded-[14px] p-3 grid gap-2">
                    <p className="font-semibold text-sm">{m.firmName}</p>
                    <p className="text-ink-soft text-[0.85rem]">{m.ticketSizeLabel}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-soft capitalize">{m.status.replace("_", " ")}</span>
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${m.matchScore >= 70 ? "bg-[rgba(45,122,94,0.12)] text-accent-2" : "bg-black/8 text-ink-soft"}`}>
                        {m.matchScore >= 70 ? "Strong fit" : "Medium fit"} ({m.matchScore})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">No investor matches yet.</p>
            )}
          </article>

          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[1.1rem] font-semibold">Priority tasks</h2>
              <Link href="/tasks" className="text-accent text-sm font-semibold">Manage</Link>
            </div>
            <div className="flex gap-4 text-sm text-ink-soft">
              <span><strong className="text-ink">{taskCounts.open}</strong> open</span>
              <span><strong className="text-red-600">{taskCounts.flagged}</strong> flagged</span>
              <span><strong className="text-accent-2">{taskCounts.complete}</strong> done</span>
            </div>
            {recentTasks.length > 0 ? (
              <ul className="grid gap-2">
                {recentTasks.map((t) => (
                  <li key={t.id} className="flex justify-between items-center gap-2 border border-border rounded-[12px] px-3 py-2">
                    <p className="text-sm leading-snug line-clamp-1">{t.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      t.status === "flagged" ? "bg-red-100 text-red-700" :
                      t.status === "complete" ? "bg-[rgba(45,122,94,0.12)] text-accent-2" :
                      t.status === "in_progress" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{t.status.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft text-sm">No diligence tasks yet.</p>
            )}
          </article>

        </section>
      </div>
    </main>
  );
}
