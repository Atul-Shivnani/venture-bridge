import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";

const categoryLabel = {
  financial:  "Financial",
  legal:      "Legal",
  governance: "Governance",
  market:     "Market",
  team:       "Team",
};

const typeLabel = {
  pitch_deck:      "Pitch Deck",
  financial_model: "Financial Model",
  cap_table:       "Cap Table",
  legal:           "Legal",
  other:           "Other",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function CompliancePage() {
  await requireAuth();
  const data = await apiGet("/compliance");

  const counts           = data?.counts           ?? { flaggedDiligence: 0, flaggedDocuments: 0 };
  const flaggedDiligence = data?.flaggedDiligence  ?? [];
  const flaggedDocuments = data?.flaggedDocuments  ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Compliance</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Compliance</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Flagged Items
          </h1>
          <div className="flex gap-6 mt-3 text-sm text-ink-soft">
            <span><strong className="text-red-600">{counts.flaggedDiligence}</strong> diligence flags</span>
            <span><strong className="text-red-600">{counts.flaggedDocuments}</strong> document flags</span>
          </div>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the admin API is running and try again.
          </div>
        )}

        {/* Flagged Diligence Items */}
        <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Flagged Diligence Items</h2>
          {flaggedDiligence.length > 0 ? (
            <ul className="divide-y divide-border">
              {flaggedDiligence.map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0 grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.companyName}: {item.title}</p>
                    <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-red-100 text-red-700">
                      Flagged
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft capitalize">
                    {categoryLabel[item.category] ?? item.category} · {item.dealTitle} · {item.investorFirm}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-ink-soft line-clamp-2">{item.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft text-sm">No flagged diligence items.</p>
          )}
        </article>

        {/* Flagged Documents */}
        <article className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Flagged Documents</h2>
          {flaggedDocuments.length > 0 ? (
            <ul className="divide-y divide-border">
              {flaggedDocuments.map((doc) => (
                <li key={doc.id} className="flex justify-between items-start gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{doc.companyName}: {doc.filename}</p>
                    <p className="text-xs text-ink-soft">
                      {typeLabel[doc.type] ?? doc.type} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold rounded-full px-2.5 py-1 bg-red-100 text-red-700">
                    Flagged
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft text-sm">No flagged documents.</p>
          )}
        </article>
      </div>
    </main>
  );
}
