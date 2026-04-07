import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import NewDealToggle from "./NewDealToggle";
import SearchFilterBar from "./SearchFilterBar";
import PaginationControls from "./PaginationControls";

const statusLabel = {
  pending:      "Pending",
  interested:   "Interested",
  passed:       "Passed",
  in_diligence: "In Diligence",
  term_sheet:   "Term Sheet",
  closed:       "Closed",
};

const statusOrder = ["pending", "interested", "in_diligence", "term_sheet", "closed", "passed"];

const statusCls = {
  pending:      "bg-gray-100 text-gray-700",
  interested:   "bg-orange-100 text-orange-700",
  in_diligence: "bg-blue-100 text-blue-700",
  term_sheet:   "bg-[rgba(45,122,94,0.12)] text-accent-2",
  closed:       "bg-green-100 text-green-700",
  passed:       "bg-red-100 text-red-700",
};

export default async function PipelinePage({ searchParams }) {
  await requireAuth();

  const skip   = parseInt(searchParams?.skip || "0", 10);
  const limit  = parseInt(searchParams?.limit || "50", 10);
  const search = searchParams?.search || "";

  const query = new URLSearchParams();
  query.append("skip", skip);
  query.append("limit", limit);
  if (search) query.append("search", search);

  const data = await apiGet(`/pipeline?${query.toString()}`);

  const companyName = data?.profile?.companyName ?? null;
  const groups = data?.groups ?? {};
  const pagination = data?.pagination ?? { skip: 0, limit: 50, total: 0 };

  const allMatches = statusOrder.flatMap((s) => groups[s] ?? []);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Pipeline CRM</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Fundraising Pipeline</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            {companyName ?? "Your"} Investor Pipeline
          </h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-ink">{pagination.total}</strong> total match{pagination.total !== 1 ? 'es' : ''}</span>
            <span><strong className="text-orange-600">{(groups.interested ?? []).length}</strong> interested</span>
          </div>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        {data && !data.profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            Complete your startup profile to see investor pipeline data.
          </div>
        )}

        {data?.profile && (
          <SearchFilterBar />
        )}

        <section className="grid gap-4 bg-card border border-border rounded-[22px] overflow-hidden flex flex-col">
          {statusOrder.map((status) => {
            const items = groups[status] ?? [];
            if (items.length === 0) return null;
            return (
              <article key={status} className="p-5 grid gap-4 border-b border-border last:border-0 last:pb-5 pb-5 pt-5 first:pt-5 bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-[1rem] font-semibold tracking-tight">{statusLabel[status]}</h2>
                  <span className="text-xs font-bold bg-black/8 text-ink-soft rounded-full px-2.5 py-1">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((m) => (
                    <div key={m.id} className="border border-border rounded-[14px] p-4 grid gap-2 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-sm">{m.firmName}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusCls[m.status]}`}>
                          {statusLabel[m.status]}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft">{m.investorType} · {m.ticketSizeLabel}</p>
                      <p className="text-xs text-ink-soft">Deal: {m.dealTitle}</p>
                      <div className="flex justify-between items-center text-xs mt-1 pt-2 border-t border-border">
                        <span className="text-ink-soft">Match score</span>
                        <strong className={m.matchScore >= 70 ? "text-accent-2" : "text-ink"}>{m.matchScore}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
          {allMatches.length === 0 && data?.profile && (
            <div className="p-8 text-center text-ink-soft text-sm bg-white">
              No investor matches found. Deals and matches will appear here once your startup profile is active and investors match your deals.
            </div>
          )}
          {data?.profile && (
             <PaginationControls skip={pagination.skip} limit={pagination.limit} total={pagination.total} />
          )}
        </section>

        <NewDealToggle />
      </div>
    </main>
  );
}
