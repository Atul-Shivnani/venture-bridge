import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import AddTaskToggle from "./AddTaskToggle";
import TaskStatusActions from "./TaskStatusActions";

const statusCls = {
  pending:     "bg-gray-100 text-gray-700",
  in_progress: "bg-orange-100 text-orange-700",
  complete:    "bg-[rgba(45,122,94,0.12)] text-accent-2",
  flagged:     "bg-red-100 text-red-700",
};

const categoryLabel = {
  financial:   "Financial",
  legal:       "Legal",
  governance:  "Governance",
  market:      "Market",
  team:        "Team",
};

export default async function TasksPage() {
  await requireAuth();
  const data = await apiGet("/tasks");

  const items  = data?.items  ?? [];
  const counts = data?.counts ?? { open: 0, flagged: 0, complete: 0 };
  const deals  = data?.deals  ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Tasks</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Due Diligence</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Tasks
          </h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-ink">{counts.open}</strong> open</span>
            <span><strong className="text-red-600">{counts.flagged}</strong> flagged</span>
            <span><strong className="text-accent-2">{counts.complete}</strong> complete</span>
          </div>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        {data && deals.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium flex items-center justify-between">
            <span>Create a deal in your pipeline first before adding tasks.</span>
            <Link href="/pipeline" className="rounded-[10px] px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-amber-700 transition-colors">Go to Pipeline</Link>
          </div>
        )}

        {data && deals.length > 0 && <AddTaskToggle deals={deals} />}

        <article className="bg-card border border-border rounded-[22px] overflow-hidden">
          {items.length > 0 ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      <p className="text-xs text-ink-soft capitalize">
                        {categoryLabel[item.category] ?? item.category}
                        {item.dealTitle ? ` · ${item.dealTitle}` : ""}
                        {item.investorFirm ? ` · ${item.investorFirm}` : ""}
                      </p>
                      {item.assignedTo && (
                        <p className="text-xs text-ink-soft">Assigned to {item.assignedTo}</p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-ink-soft mt-1 line-clamp-2">{item.notes}</p>
                      )}
                    </div>
                    <span className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusCls[item.status] ?? statusCls.pending}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <TaskStatusActions taskId={item.id} currentStatus={item.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center grid gap-2">
              <p className="text-ink font-semibold">No tasks yet.</p>
              <p className="text-ink-soft text-sm">Add your own action items, or tasks assigned by investors and analysts will appear here.</p>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
