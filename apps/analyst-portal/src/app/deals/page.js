import Link from "next/link";
import ProfileButton from "../components/ProfileButton";
import { apiGet } from "../../lib/api";
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

export default async function DealsPage() {
  await requireAuth();
  const data = await apiGet("/deals");
  const deals = data?.deals ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight no-underline text-ink">VentureBridge</Link>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft">
              <Link className="nav-link" href="/deals">Deals</Link>
              <Link className="nav-link" href="/profile">Profile</Link>
            </div>
            <div className="flex items-center justify-end">
              <ProfileButton />
            </div>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Deal pipeline</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Assigned deals
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} assigned · click any row to open analysis workspace
          </p>
        </header>

        {deals.length === 0 ? (
          <div className="bg-card border border-border rounded-[22px] p-10 text-center text-ink-soft text-sm">
            No deals assigned yet. Check back later or contact your admin.
          </div>
        ) : (
          <div className="grid gap-3">
            {deals.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="bg-card border border-border rounded-[18px] px-5 py-4 flex items-center justify-between gap-4 no-underline text-ink hover:shadow-[0_4px_20px_rgba(14,165,233,0.12)] hover:-translate-y-px transition-all"
              >
                <div className="min-w-0 grid gap-0.5">
                  <p className="font-semibold text-[0.95rem] truncate">{d.companyName}</p>
                  <p className="text-xs text-ink-soft truncate">{d.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className="text-xs text-ink-soft">{d.sector}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${stageBadge(d.stage)}`}>
                    {d.stage?.replace("_", " ")}
                  </span>
                  {d.analyzed ? (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-700">Analyzed</span>
                  ) : (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700">Pending</span>
                  )}
                  {d.pendingMatches > 0 && (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-700">
                      {d.pendingMatches} match{d.pendingMatches !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
