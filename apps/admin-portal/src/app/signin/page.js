"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function SignIn() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Waiting for token...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("No token found. Please sign in on the main site.");
      return;
    }

    document.cookie = `vb_token=${token}; path=/; max-age=604800; samesite=lax`;
    setStatus("Signing you in...");
    window.location.href = "/";
  }, [searchParams]);

  return (
    <div className="shell">
      <h1>Admin Portal Sign In</h1>
      <p>{status}</p>
      <div className="card">
        <a href={`${WEBSITE_URL}/signin`}>Go to main sign-in</a>
      </div>
    </div>
  );
}
