import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import DiligenceAdminActions from "./DiligenceAdminActions";

const statusCls = {
  pending:     "bg-gray-100 text-gray-700",
  in_progress: "bg-orange-100 text-orange-700",
  complete:    "bg-green-100 text-green-700",
  flagged:     "bg-red-100 text-red-700",
};

export default async function AdminDiligencePage({ searchParams }) {
  await requireAuth();

  const statusFilter = searchParams?.status ?? "";
  const query = statusFilter ? `?status=${statusFilter}` : "";
  const data = await apiGet(`/diligence${query}`);

  const items    = data?.items    ?? [];
  const counts   = data?.counts   ?? { pending: 0, in_progress: 0, complete: 0, flagged: 0 };
  const analysts = data?.analysts ?? [];

  const filterTabs = [
    { label: "All",         value: "" },
    { label: "Pending",     value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Flagged",     value: "flagged" },
    { label: "Complete",    value: "complete" },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <div className="flex gap-6 justify-center text-[0.9rem] text-ink-soft">
              <Link className="nav-link" href="/approvals">Approvals</Link>
              <Link className="nav-link" href="/deals">Deals</Link>
              <Link className="nav-link font-semibold text-ink" href="/diligence">Diligence</Link>
              <Link className="nav-link" href="/compliance">Compliance</Link>
              <Link className="nav-link" href="/analysts">Analysts</Link>
            </div>
            <div className="flex justify-end">
              <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
            </div>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Due Diligence</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Diligence Queue
          </h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-ink">{counts.pending}</strong> pending</span>
            <span><strong className="text-orange-600">{counts.in_progress}</strong> in progress</span>
            <span><strong className="text-red-600">{counts.flagged}</strong> flagged</span>
            <span><strong className="text-accent-2">{counts.complete}</strong> complete</span>
          </div>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/diligence?status=${tab.value}` : "/diligence"}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <article className="bg-card border border-border rounded-[22px] overflow-hidden">
          {items.length > 0 ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-semibold leading-snug">
                        {item.companyName}
                      </p>
                      <p className="text-sm text-ink-soft leading-snug">
                        {item.dealTitle}: {item.title}
                      </p>
                      <p className="text-xs text-ink-soft capitalize">
                        {item.category}
                        {item.investorFirm ? ` · ${item.investorFirm}` : ""}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-ink-soft mt-1 line-clamp-2">{item.notes}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusCls[item.status]}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <DiligenceAdminActions
                    itemId={item.id}
                    currentStatus={item.status}
                    analysts={analysts}
                    assignedToId={item.assignedToId}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-ink-soft text-sm">
              No diligence items found{statusFilter ? ` with status "${statusFilter.replace("_", " ")}"` : ""}.
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
