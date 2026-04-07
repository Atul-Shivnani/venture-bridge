import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import ProfileEditToggle from "./ProfileEditToggle";

export default async function ProfilePage() {
  await requireAuth();
  const data = await apiGet("/profile");
  const apiDown = data === null;

  const user    = data?.user    ?? null;
  const profile = data?.profile ?? null;

  const fields = profile
    ? [
        { label: "Firm name",         value: profile.firmName },
        { label: "Investor type",     value: profile.investorType?.replace("_", " ") },
        { label: "Ticket size",       value: profile.ticketSizeLabel },
        { label: "Geographies",       value: Array.isArray(profile.geographies) ? profile.geographies.join(", ") : String(profile.geographies ?? "") },
        { label: "Sectors",           value: profile.sectors ? (Array.isArray(profile.sectors) ? profile.sectors.join(", ") : String(profile.sectors)) : null },
        { label: "Stages",            value: profile.stagesAllowed ? (Array.isArray(profile.stagesAllowed) ? profile.stagesAllowed.join(", ") : String(profile.stagesAllowed)) : null },
        { label: "Instruments",       value: profile.instrumentTypesAllowed ? (Array.isArray(profile.instrumentTypesAllowed) ? profile.instrumentTypesAllowed.join(", ") : String(profile.instrumentTypesAllowed)) : null },
        { label: "Revenue floor",     value: profile.revenueFloor ? `$${Number(profile.revenueFloor).toLocaleString()}` : null },
        { label: "Profitability",     value: profile.profitabilityPreference },
        { label: "ESG exclusions",    value: profile.esgExclusions ? (Array.isArray(profile.esgExclusions) ? profile.esgExclusions.join(", ") : String(profile.esgExclusions)) : null },
        { label: "Regulatory excl.",  value: profile.regulatoryExclusions ? (Array.isArray(profile.regulatoryExclusions) ? profile.regulatoryExclusions.join(", ") : String(profile.regulatoryExclusions)) : null },
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
              {(profile?.firmName ?? user?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Investor Profile</p>
            <h1 className="mt-1 text-[clamp(1.4rem,2.5vw,2rem)] font-bold leading-tight">
              {profile?.firmName ?? "Profile not set up"}
            </h1>
            <p className="text-sm text-ink-soft mt-1">{user?.email}</p>
          </div>
          {user?.approved && (
            <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-[rgba(45,122,94,0.12)] text-accent-2">
              Approved
            </span>
          )}
        </header>

        {apiDown && (
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-5 text-red-800 text-sm font-medium">
            Unable to connect to the server. Please ensure the investor API is running and try again.
          </div>
        )}

        {!apiDown && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-5 text-amber-800 text-sm font-medium">
            Your investor profile is not set up. Please contact support or re-register.
          </div>
        )}

        {profile && (
          <ProfileEditToggle profile={profile} fields={fields} approved={user?.approved} />
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
