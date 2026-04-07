"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function SignIn() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;
    document.cookie = `vb_token=${token}; path=/; max-age=604800; samesite=lax`;
    window.location.href = "/";
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6 flex flex-col items-center gap-6">
        <span className="text-2xl font-bold tracking-tight">VentureBridge</span>
        <div className="w-full rounded-2xl border border-border bg-card shadow-sm p-7 flex flex-col items-center gap-4 text-center">
          {token ? (
            <>
              <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-sm text-ink-soft font-medium">Signing you in…</p>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-soft">No token found. Please sign in on the main site.</p>
              <a href={`${WEBSITE_URL}/signin`} className="text-sm font-semibold text-accent hover:underline">
                Go to main sign-in
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
