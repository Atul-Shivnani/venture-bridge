import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import { AddAnalystForm, RemoveAnalystButton } from "./AnalystActions";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AnalystsPage() {
  await requireAuth();
  const data = await apiGet("/analysts");

  const analysts = data?.analysts ?? [];
  const total    = data?.total    ?? 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Analysts</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Team</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Analysts
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {total} analyst{total !== 1 ? "s" : ""} · admin team
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        <div className="flex justify-end">
          <AddAnalystForm />
        </div>

        <article className="bg-card border border-border rounded-[22px] overflow-hidden">
          {analysts.length > 0 ? (
            <ul className="divide-y divide-border">
              {analysts.map((analyst) => (
                <li key={analyst.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">{analyst.email}</p>
                    <p className="text-xs text-ink-soft">Member since {formatDate(analyst.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-black/5 text-ink-soft px-3 py-1.5 text-xs font-medium">
                      <strong className="text-ink">{analyst.assignedDealCount}</strong> deal{analyst.assignedDealCount !== 1 ? "s" : ""} assigned
                    </span>
                    <RemoveAnalystButton analystId={analyst.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center grid gap-3">
              <p className="text-ink font-semibold">No analysts yet.</p>
              <p className="text-ink-soft text-sm">Use the "Add Analyst" button above to invite a team member.</p>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
