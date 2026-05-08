import Link from "next/link";
import { notFound } from "next/navigation";
import ProfileButton from "../../components/ProfileButton";
import { apiGet } from "../../../lib/api";
import { requireAuth } from "@/lib/auth";
import AnalyzePanel from "./AnalyzePanel";
import MatchDecideRow from "./MatchDecideRow";

const confidenceCls = {
  high:   "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-red-100 text-red-700",
};

function fmt(n, type = "currency") {
  if (n === null || n === undefined) return "—";
  if (type === "currency") return `$${Number(n).toLocaleString()}`;
  if (type === "percent")  return `${Number(n).toFixed(1)}%`;
  if (type === "ratio")    return Number(n).toFixed(2);
  if (type === "months")   return `${Number(n).toFixed(1)} mo`;
  return n;
}

export default async function DealPage({ params }) {
  await requireAuth();
  const { id } = await params;
  const data = await apiGet(`/deals/${id}`);
  if (!data) notFound();

  const { deal, startup, analysis, matches, documents, notes } = data;

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        {/* Nav */}
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

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/deals" className="hover:text-accent transition-colors">Deals</Link>
          <span>/</span>
          <span className="text-ink font-medium">{startup?.companyName}</span>
        </div>

        {/* Hero card */}
        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7 grid gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">{deal.status} · {deal.stage?.replace("_", " ")}</p>
              <h1 className="mt-1 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-tight">
                {startup?.companyName}
              </h1>
              <p className="mt-1 text-ink-soft text-sm max-w-lg">{startup?.description}</p>
            </div>
            <div className="grid gap-1 shrink-0 text-right">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.15em] text-ink-soft">Target raise</p>
              <p className="text-[1.6rem] font-bold tracking-tight">
                {deal.currency} {Number(deal.targetAmount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              ["Sector",   startup?.sector],
              ["Country",  startup?.country],
              ["Stage",    startup?.fundingStage?.replace("_", " ")],
              ["Team",     startup?.teamSize ? `${startup.teamSize} people` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="bg-bg rounded-[12px] px-3 py-2.5">
                <p className="text-[0.7rem] font-bold uppercase tracking-widest text-ink-soft">{label}</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4">

          {/* Left column */}
          <div className="grid gap-4">

            {/* AI Analysis */}
            <AnalyzePanel dealId={id} initialAnalysis={analysis} />

            {/* Startup details */}
            <div className="bg-card border border-border rounded-[22px] p-5 grid gap-3">
              <h2 className="text-[1.05rem] font-semibold tracking-tight">Startup profile</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ["Business model",  startup?.businessModel],
                  ["ARR",             startup?.arr ? fmt(startup.arr) : "—"],
                  ["Amount raising",  startup?.amountRaising ? fmt(startup.amountRaising) : "—"],
                  ["Instrument",      startup?.instrumentType],
                  ["Website",         startup?.website],
                  ["Sub-sector",      startup?.subSector],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5 py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-ink-soft">{label}</span>
                    <span className="text-sm font-medium">{value ?? "—"}</span>
                  </div>
                ))}
              </div>
              {startup?.useOfFunds && (
                <div className="bg-bg rounded-[12px] px-3 py-2.5">
                  <p className="text-xs text-ink-soft mb-1">Use of funds</p>
                  <p className="text-sm">{startup.useOfFunds}</p>
                </div>
              )}
            </div>

          </div>

          {/* Right column */}
          <div className="grid gap-4 content-start">

            {/* Investor matches */}
            <div className="bg-card border border-border rounded-[22px] p-5 grid gap-3">
              <h2 className="text-[1.05rem] font-semibold tracking-tight">Investor matches</h2>
              {matches?.length > 0 ? (
                <ul className="grid gap-2.5">
                  {matches.map((m) => (
                    <MatchDecideRow key={m.id} match={m} />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-soft text-sm">No matches generated yet.</p>
              )}
            </div>

            {/* Documents */}
            {documents?.length > 0 && (
              <div className="bg-card border border-border rounded-[22px] p-5 grid gap-3">
                <h2 className="text-[1.05rem] font-semibold tracking-tight">Documents</h2>
                <ul className="grid gap-2">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="truncate">{doc.filename}</span>
                        <span className="text-xs text-ink-soft shrink-0">{doc.type}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analyst notes */}
            {notes?.length > 0 && (
              <div className="bg-card border border-border rounded-[22px] p-5 grid gap-3">
                <h2 className="text-[1.05rem] font-semibold tracking-tight">Notes</h2>
                <ul className="grid gap-2">
                  {notes.map((n) => (
                    <li key={n.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                      {n.flagType && (
                        <span className="text-[0.7rem] font-bold uppercase tracking-widest text-amber-600">{n.flagType}</span>
                      )}
                      <p className="text-sm mt-0.5">{n.content}</p>
                      <p className="text-xs text-ink-soft mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
