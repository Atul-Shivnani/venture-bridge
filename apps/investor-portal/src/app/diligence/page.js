import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import DiligenceStatusActions from "./DiligenceStatusActions";

const statusCls = {
  pending:     "bg-gray-100 text-gray-700",
  in_progress: "bg-orange-100 text-orange-700",
  complete:    "bg-green-100 text-green-700",
  flagged:     "bg-red-100 text-red-700",
};

export default async function DiligencePage() {
  await requireAuth();
  const data = await apiGet("/diligence");

  const items  = data?.items  ?? [];
  const counts = data?.counts ?? { open: 0, flagged: 0, complete: 0 };

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Diligence</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Due Diligence</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Diligence Queue
          </h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-ink">{counts.open}</strong> open</span>
            <span><strong className="text-red-600">{counts.flagged}</strong> flagged</span>
            <span><strong className="text-accent-2">{counts.complete}</strong> complete</span>
          </div>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the investor API is running and try again.
          </div>
        )}

        <article className="bg-card border border-border rounded-[22px] overflow-hidden">
          {items.length > 0 ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-snug">
                        {item.companyName}: {item.title}
                      </p>
                      <p className="text-xs text-ink-soft capitalize">
                        {item.category} ·{" "}
                        {item.assignedTo ? `Assigned to ${item.assignedTo}` : "Unassigned"}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-ink-soft mt-1 line-clamp-2">{item.notes}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusCls[item.status]}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <DiligenceStatusActions itemId={item.id} currentStatus={item.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-ink-soft text-sm">
              No diligence items found.
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
