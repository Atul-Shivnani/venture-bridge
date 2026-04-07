import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";
import PasswordChangeForm from "../components/PasswordChangeForm";

const INVESTOR_API_URL = process.env.INVESTOR_API_URL || "http://localhost:8001";

export default async function SettingsPage() {
  await requireAuth();
  const data = await apiGet("/settings");
  const user = data?.user ?? null;

  return (
    <main className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,20,18,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Settings</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Account Settings</p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-tight">Settings</h1>
        </header>

        <article className="bg-card border border-border rounded-[22px] p-6 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Account</h2>
          <dl className="grid gap-3">
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Email</dt>
              <dd className="text-sm">{user?.email ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Portal</dt>
              <dd className="text-sm capitalize">{user?.portal ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Approval status</dt>
              <dd className={`text-sm font-semibold ${user?.approved ? "text-accent-2" : "text-orange-600"}`}>
                {user?.approved ? "Approved" : "Pending approval"}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Member since</dt>
              <dd className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="bg-card border border-border rounded-[22px] p-6 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Change Password</h2>
          <PasswordChangeForm apiUrl={INVESTOR_API_URL} />
        </article>

        <Link href="/profile" className="text-accent text-sm font-semibold">
          View your investor profile →
        </Link>
      </div>
    </main>
  );
}
