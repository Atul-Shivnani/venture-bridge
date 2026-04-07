import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";

export default async function PortfolioPage() {
  await requireAuth();
  const data = await apiGet("/portfolio");

  const profile   = data?.profile   ?? null;
  const portfolio = data?.portfolio ?? [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Portfolio</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Portfolio</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">
            {profile?.firmName ?? "Your"} Portfolio
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            {portfolio.length} closed investment{portfolio.length !== 1 ? "s" : ""}
          </p>
        </header>

        {!data && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the investor API is running and try again.
          </div>
        )}

        {data && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            Your investor profile is not set up yet.
          </div>
        )}

        {portfolio.length === 0 ? (
          <div className="bg-card border border-border rounded-[22px] p-10 text-center grid gap-2">
            <p className="text-ink font-semibold">No closed investments yet.</p>
            <p className="text-ink-soft text-sm">Companies where deals have been closed will appear here.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.map((company) => (
              <article key={company.id} className="bg-card border border-border rounded-[18px] p-5 grid gap-3">
                <div>
                  <p className="font-semibold text-[1rem]">{company.companyName}</p>
                  <p className="text-sm text-ink-soft mt-0.5">{company.sector}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-black/5 text-ink-soft px-2.5 py-1 font-medium">
                    {company.fundingStage}
                  </span>
                  <span className="rounded-full bg-black/5 text-ink-soft px-2.5 py-1 font-medium">
                    ${Number(company.targetAmount).toLocaleString()} {company.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">Match score</span>
                  <strong className={company.matchScore >= 70 ? "text-accent-2" : "text-ink"}>
                    {company.matchScore}
                  </strong>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
