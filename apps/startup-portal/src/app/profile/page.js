import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import ProfileEditToggle from "./ProfileEditToggle";

const stageLabel = {
  idea:     "Idea",
  pre_seed: "Pre-seed",
  seed:     "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth:   "Growth",
};

export default async function ProfilePage() {
  await requireAuth();
  const data = await apiGet("/profile");
  const apiDown = data === null;

  const user = data?.user ?? null;
  const profile = data?.profile ?? null;

  const fields = profile
    ? [
        { label: "Company name",   value: profile.companyName },
        { label: "Sector",         value: profile.sector },
        { label: "Sub-sector",     value: profile.subSector },
        { label: "Country",        value: profile.country },
        { label: "Funding stage",  value: stageLabel[profile.fundingStage] ?? profile.fundingStage },
        { label: "Founded year",   value: profile.foundedYear },
        { label: "Team size",      value: profile.teamSize },
        { label: "Website",        value: profile.website },
        { label: "Business model", value: profile.businessModel },
        { label: "Customers",      value: profile.customersServed },
        { label: "Raising",        value: profile.amountRaising ? `$${Number(profile.amountRaising).toLocaleString()}` : null },
        { label: "Instrument",     value: profile.instrumentType },
        { label: "ARR",            value: profile.arr ? `$${Number(profile.arr).toLocaleString()}` : null },
        { label: "Description",    value: profile.description },
        { label: "Use of funds",   value: profile.useOfFunds },
      ].filter((f) => f.value != null)
    : [];

  return (
    <main className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Profile</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-[1.4rem] font-bold text-accent">
              {(profile?.companyName ?? user?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Startup Profile</p>
            <h1 className="mt-1 text-[clamp(1.4rem,2.5vw,2rem)] font-bold leading-tight">
              {profile?.companyName ?? "Profile not set up"}
            </h1>
            <p className="text-sm text-ink-soft mt-1">{user?.email}</p>
          </div>
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the startup API is running and try again.
          </div>
        )}

        {!apiDown && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            Your startup profile is not set up yet. Please contact support or re-register.
          </div>
        )}

        {profile && (
          <ProfileEditToggle profile={profile} fields={fields} />
        )}

        <div className="flex gap-3">
          <Link href="/settings" className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">
            Account Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
