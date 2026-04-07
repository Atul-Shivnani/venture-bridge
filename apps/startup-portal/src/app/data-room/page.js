import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import AddDocumentToggle from "./AddDocumentToggle";

const typeLabel = {
  pitch_deck:      "Pitch Deck",
  financial_model: "Financial Model",
  cap_table:       "Cap Table",
  legal:           "Legal",
  other:           "Other",
};

const typeOrder = ["pitch_deck", "financial_model", "cap_table", "legal", "other"];

const statusCls = {
  pending:  "bg-gray-100 text-gray-700",
  approved: "bg-[rgba(45,122,94,0.12)] text-accent-2",
  flagged:  "bg-red-100 text-red-700",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DataRoomPage() {
  await requireAuth();
  const data = await apiGet("/documents");
  const documents = data?.documents ?? [];

  // Group by type
  const grouped = {};
  for (const doc of documents) {
    const key = doc.type in typeLabel ? doc.type : "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Data Room</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Data Room</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            Documents
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {documents.length} document{documents.length !== 1 ? "s" : ""} · secure storage
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        <AddDocumentToggle />

        {documents.length === 0 ? (
          <div className="bg-card border border-border rounded-[22px] p-10 text-center grid gap-2">
            <p className="text-ink font-semibold">No documents uploaded yet.</p>
            <p className="text-ink-soft text-sm">Your pitch deck, financial models, and other documents will appear here once uploaded by your admin.</p>
          </div>
        ) : (
          <section className="grid gap-4">
            {typeOrder.map((type) => {
              const docs = grouped[type];
              if (!docs || docs.length === 0) return null;
              return (
                <article key={type} className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[1rem] font-semibold tracking-tight">{typeLabel[type]}</h2>
                    <span className="text-xs font-bold bg-black/8 text-ink-soft rounded-full px-2.5 py-1">
                      {docs.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {docs.map((doc) => (
                      <li key={doc.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="grid gap-1">
                          <p className="text-sm font-medium">{doc.filename}</p>
                          {doc.dealTitle && (
                            <p className="text-xs text-ink-soft">Deal: {doc.dealTitle}</p>
                          )}
                          <p className="text-xs text-ink-soft">{formatDate(doc.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold rounded-full px-2.5 py-1 capitalize ${statusCls[doc.status] ?? statusCls.pending}`}>
                            {doc.status}
                          </span>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
