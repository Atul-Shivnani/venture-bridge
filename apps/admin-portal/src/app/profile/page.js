import Link from "next/link";
import { apiGet } from "../../lib/api";
import { requireAuth } from "@/lib/auth";

export default async function ProfilePage() {
  await requireAuth();
  const data = await apiGet("/profile");
  const user = data?.user ?? null;

  return (
    <main className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 pb-20 grid gap-6">

        <header className="sticky top-4 z-10">
          <nav className="flex items-center justify-between px-6 py-3 rounded-full border border-border bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(60,40,120,0.12)]">
            <Link href="/" className="text-[1.35rem] font-bold tracking-tight">VentureBridge</Link>
            <span className="text-sm font-medium text-ink-soft">Profile</span>
            <Link href="/" className="text-accent text-sm font-semibold">← Dashboard</Link>
          </nav>
        </header>

        <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-[1.4rem] font-bold text-accent">
              {(user?.email ?? "A")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Admin Profile</p>
            <h1 className="mt-1 text-[clamp(1.4rem,2.5vw,2rem)] font-bold leading-tight">
              {user?.email ?? "—"}
            </h1>
          </div>
          <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-accent/10 text-accent">
            Admin
          </span>
        </header>

        <article className="bg-card border border-border rounded-[22px] p-6 grid gap-4">
          <h2 className="text-[1rem] font-semibold tracking-tight">Account details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Email</dt>
              <dd className="text-sm">{user?.email ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Portal</dt>
              <dd className="text-sm capitalize">{user?.portal ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Role</dt>
              <dd className="text-sm capitalize">{user?.role ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">Member since</dt>
              <dd className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
            </div>
          </dl>
        </article>

        <div className="flex gap-3">
          <Link href="/settings" className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">
            Account Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
