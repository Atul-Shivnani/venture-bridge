import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import DealStatusActions from "./DealStatusActions";
import RunMatchingButton from "./RunMatchingButton";
import AssignAnalystSelect from "./AssignAnalystSelect";
import SearchFilterBar from "./SearchFilterBar";
import PaginationControls from "./PaginationControls";
import DealNotesPanel from "./DealNotesPanel";

const statusCls = {
  draft:        "bg-gray-100 text-gray-700",
  under_review: "bg-orange-100 text-orange-700",
  approved:     "bg-blue-100 text-blue-700",
  live:         "bg-[rgba(45,122,94,0.12)] text-accent-2",
  closed:       "bg-purple-100 text-purple-700",
  rejected:     "bg-red-100 text-red-700",
};

const stageLabel = {
  idea:     "Idea",
  pre_seed: "Pre-seed",
  seed:     "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth:   "Growth",
};

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://localhost:8003";

export default async function DealsPage({ searchParams }) {
  await requireAuth();

  const skip   = parseInt(searchParams?.skip || "0", 10);
  const limit  = parseInt(searchParams?.limit || "50", 10);
  const search = searchParams?.search || "";

  const query = new URLSearchParams();
  query.append("skip", skip);
  query.append("limit", limit);
  if (search) query.append("search", search);

  const [dealsData, analystsData] = await Promise.all([
    apiGet(`/deals?${query.toString()}`),
    apiGet("/analysts"),
  ]);

  const deals    = dealsData?.deals ?? [];
  const pagination = dealsData?.pagination ?? { skip: 0, limit: 50, total: deals.length };
  const analysts = analystsData?.analysts ?? [];

  const underReview = deals.filter((d) => d.status === "under_review").length;
  const live        = deals.filter((d) => d.status === "live").length;

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Deals</span>
            <div className="flex items-center gap-3">
              <a
                href={`${ADMIN_API_URL}/deals/export`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-1.5 bg-white/80 text-ink text-sm font-semibold hover:bg-white transition-colors"
              >
                ↓ Export CSV
              </a>
              <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
            </div>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Deal Management</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">All Deals</h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-ink">{pagination.total}</strong> total</span>
            <span><strong className="text-orange-600">{underReview}</strong> under review</span>
            <span><strong className="text-accent-2">{live}</strong> live</span>
          </div>
        </header>

        {!dealsData && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        <SearchFilterBar />

        <article className="bg-card border border-border rounded-[22px] overflow-hidden flex flex-col">
          {deals.length > 0 ? (
            <ul className="divide-y divide-border">
              {deals.map((deal) => (
                <li key={deal.id} className="px-5 py-4 grid gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{deal.companyName}</p>
                        <span className="text-xs text-ink-soft">·</span>
                        <p className="text-sm text-ink-soft">{deal.title}</p>
                        <span className={`text-xs font-bold rounded-full px-2.5 py-1 capitalize ${statusCls[deal.status]}`}>
                          {deal.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft">
                        {stageLabel[deal.stage] ?? deal.stage} · ${Number(deal.targetAmount).toLocaleString()} {deal.currency}
                      </p>
                    </div>
                    <div className="flex gap-4 shrink-0 text-xs text-ink-soft">
                      <span><strong className="text-ink">{deal.matchCount ?? 0}</strong> matches</span>
                      <span><strong className="text-ink">{deal.diligenceCount ?? 0}</strong> diligence</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-ink-soft">Analyst:</span>
                    <AssignAnalystSelect
                      dealId={deal.id}
                      currentAnalystId={deal.analystId}
                      analysts={analysts}
                    />
                    <RunMatchingButton dealId={deal.id} />
                    <DealStatusActions dealId={deal.id} currentStatus={deal.status} />
                  </div>
                  <DealNotesPanel dealId={deal.id} noteCount={deal.noteCount ?? 0} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-ink-soft text-sm">No deals found matching your criteria.</div>
          )}
          <PaginationControls skip={pagination.skip} limit={pagination.limit} total={pagination.total} />
        </article>
      </div>
    </main>
  );
}
