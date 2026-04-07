import Link from "next/link";
import RegistrationFlow from "./registration-flow";

export const metadata = {
  title: "Register | VentureBridge",
  description: "Create your VentureBridge account as a startup or investor.",
};

export default function Register() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-5 py-16 sm:px-8">
      {/* Subtle top accent bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(233,111,58,0.10),transparent_65%)] blur-3xl" />

      {/* Back link — top-left fixed */}
      <div className="absolute left-6 top-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          VentureBridge
        </Link>
      </div>

      {/* Centered content column */}
      <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-5 inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-soft backdrop-blur-sm">
            Create account
          </span>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Join VentureBridge
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Choose your path — startup or investor.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 p-9 shadow-[0_0_48px_rgba(233,111,58,0.10)] backdrop-blur-xl sm:p-11">
          <RegistrationFlow />
        </div>

      </div>
    </div>
  );
}
