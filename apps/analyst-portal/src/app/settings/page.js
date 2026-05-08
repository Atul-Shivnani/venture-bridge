import Link from "next/link";
import ProfileButton from "../components/ProfileButton";
import { requireAuth } from "@/lib/auth";
import PasswordChangeForm from "../components/PasswordChangeForm";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-6 py-12 pb-20 grid gap-6">

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

        <div className="max-w-lg">
          <header className="border border-border bg-white/75 backdrop-blur-md rounded-[26px] p-7 mb-4">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-soft">Account</p>
            <h1 className="mt-1 text-[clamp(1.4rem,2.5vw,2rem)] font-bold tracking-tight">Settings</h1>
          </header>
          <PasswordChangeForm />
        </div>
      </div>
    </main>
  );
}
