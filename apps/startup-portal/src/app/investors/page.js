import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";

const statusLabel = {
  pending:      "Pending",
  interested:   "Interested",
  passed:       "Passed",
  in_diligence: "In Diligence",
  term_sheet:   "Term Sheet",
  closed:       "Closed",
};

const statusCls = {
  pending:      "bg-gray-100 text-gray-700",
  interested:   "bg-orange-100 text-orange-700",
  in_diligence: "bg-blue-100 text-blue-700",
  term_sheet:   "bg-[rgba(45,122,94,0.12)] text-accent-2",
  closed:       "bg-green-100 text-green-700",
  passed:       "bg-red-100 text-red-700",
};

export default async function InvestorsPage() {
  await requireAuth();
  const data = await apiGet("/investors");

  const matches = data?.matches ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Investors</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Investor Matches</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            All Investors
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {matches.length} matched investors · sorted by fit score
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        {data && data.matches?.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            No investor matches yet. Matches will appear once your deals are set up.
          </div>
        )}

        <section className="grid gap-3">
          {matches.length > 0 ? (
            matches.map((m) => (
              <article key={m.id} className="bg-card border border-border rounded-[18px] p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[1rem] font-semibold">{m.firmName}</h2>
                    <span className="text-xs text-ink-soft capitalize bg-black/5 rounded-full px-2.5 py-1">
                      {m.investorType.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${statusCls[m.status]}`}>
                      {statusLabel[m.status]}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft">Ticket: {m.ticketSizeLabel}</p>
                  <p className="text-xs text-ink-soft">Deal: {m.dealTitle} · {m.dealStage.replace("_", " ")}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <strong className={`text-[1.4rem] font-bold ${m.matchScore >= 70 ? "text-accent-2" : "text-ink"}`}>
                    {m.matchScore}
                  </strong>
                  <span className="text-xs text-ink-soft">match score</span>
                </div>
              </article>
            ))
          ) : (
            <div className="bg-card border border-border rounded-[22px] p-8 text-center text-ink-soft text-sm">
              No investor matches yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
