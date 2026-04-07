import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import ApprovalActions from "./ApprovalActions";

export default async function ApprovalsPage() {
  await requireAuth();
  const data = await apiGet("/approvals");

  const pendingUsers      = data?.pending          ?? [];
  const recentlyApproved  = data?.recentlyApproved ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Approvals</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">User Approvals</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Approvals Queue
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {pendingUsers.length} pending · {pendingUsers.filter((u) => u.portal === "investor").length} investors
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        {/* Pending approvals */}
        <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Pending approvals</h2>
          {pendingUsers.length > 0 ? (
            <ul className="grid gap-3">
              {pendingUsers.map((u) => {
                const name = u.name ?? "—";
                const type = u.portal === "investor" ? "Investor" : "Startup";
                return (
                  <li key={u.id} className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border border-border rounded-[14px] p-4">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{name}</p>
                        <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                          u.portal === "investor" ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {type}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft">{u.email}</p>
                      {u.detail && (
                        <p className="text-xs text-ink-soft capitalize">{u.detail}</p>
                      )}
                    </div>
                    <ApprovalActions userId={u.id} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-ink-soft text-sm">No pending approvals.</p>
          )}
        </article>

        {/* Recently approved */}
        {recentlyApproved.length > 0 && (
          <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
            <h2 className="text-[1rem] font-semibold tracking-tight text-ink-soft">Recently approved</h2>
            <ul className="grid gap-2.5">
              {recentlyApproved.map((u) => {
                const name = u.name ?? u.email;
                return (
                  <li key={u.id} className="flex justify-between items-center gap-3 border border-border rounded-[14px] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <small className="text-xs text-ink-soft capitalize">{u.portal} · {u.email}</small>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-[rgba(45,122,94,0.12)] text-accent-2">
                      Approved
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        )}
      </div>
    </main>
  );
}
