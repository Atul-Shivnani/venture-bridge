"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:8003";

function getToken() {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("vb_token="))
      ?.split("=")[1] ?? ""
  );
}

export default function RunMatchingButton({ dealId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${ADMIN_API_URL}/deals/${dealId}/match`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(`${data.matchesCreated} new match${data.matchesCreated !== 1 ? "es" : ""} created`);
      router.refresh();
    } catch (err) {
      setResult("Failed to run matching");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full px-3 py-1 text-xs font-bold bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Matching…" : "⚡ Match"}
      </button>
      {result && <span className="text-xs text-ink-soft">{result}</span>}
    </div>
  );
}
