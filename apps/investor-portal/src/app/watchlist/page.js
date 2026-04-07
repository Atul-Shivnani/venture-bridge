import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function WatchlistPage() {
  await requireAuth();
  const data = await apiGet("/watchlist");

  const profile   = data?.profile   ?? null;
  const watchlist = data?.watchlist ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Watchlist</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Watchlist</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            {profile?.firmName ?? "Your"} Watchlist
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {watchlist.length} interested deal{watchlist.length !== 1 ? "s" : ""} · tracking
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the investor API is running and try again.
          </div>
        )}

        {data && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            Your investor profile is not set up yet.
          </div>
        )}

        {watchlist.length === 0 ? (
          <div className="bg-card border border-border rounded-[22px] p-10 text-center grid gap-2">
            <p className="text-ink font-semibold">No companies on your watchlist yet.</p>
            <p className="text-ink-soft text-sm">Deals you mark as interested will appear here.</p>
          </div>
        ) : (
          <article className="bg-card border border-border rounded-[22px] overflow-hidden">
            <ul className="divide-y divide-border">
              {watchlist.map((item) => (
                <li key={item.id} className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4">
                  <div className="flex-1 grid gap-1">
                    <p className="text-sm font-semibold">{item.companyName}</p>
                    <p className="text-xs text-ink-soft">
                      {item.sector} · {item.fundingStage} · ${Number(item.targetAmount).toLocaleString()} {item.currency}
                    </p>
                    <p className="text-xs text-ink-soft">Added {formatDate(item.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-ink-soft">Match score</span>
                    <strong className={`text-sm ${item.matchScore >= 70 ? "text-accent-2" : "text-ink"}`}>
                      {item.matchScore}
                    </strong>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </main>
  );
}
