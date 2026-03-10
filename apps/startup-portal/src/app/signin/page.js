"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function SignIn() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const status = useMemo(() => {
    if (!token) {
      return "No token found. Please sign in on the main site.";
    }
    return "Signing you in...";
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    document.cookie = `vb_token=${token}; path=/; max-age=604800; samesite=lax`;
    window.location.href = "/";
  }, [token]);

  return (
    <main className="portal-page">
      <div className="shell">
        <header className="site-header site-header--website">
          <nav className="nav nav-website">
            <div className="logo">VentureBridge</div>
            <div className="nav-center" aria-label="Startup sections">
              <Link className="nav-link" href="#">Security</Link>
              <Link className="nav-link" href="#">Access</Link>
              <Link className="nav-link" href="#">Support</Link>
            </div>
            <div className="nav-right">
              <Link className="pill" href={`${WEBSITE_URL}/signin`}>
                Main sign-in
              </Link>
            </div>
          </nav>
        </header>

        <div className="portal-top">
          <div>
            <p className="eyebrow">Startup Access</p>
            <h1>Secure sign-in handoff</h1>
            <p className="lead">
              We are validating your VentureBridge token and routing you into your
              startup workspace.
            </p>
          </div>
        </div>

        <div className="card">
          <p style={{ marginBottom: "12px", color: "#4e4741" }}>{status}</p>
          <a href={`${WEBSITE_URL}/signin`} style={{ color: "#e96f3a", fontWeight: 600 }}>
            Go to main sign-in
          </a>
        </div>
      </div>
    </main>
  );
}
