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

export default function ApprovalActions({ userId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function handleAction(action) {
    setLoading(action);
    setError("");
    try {
      const endpoint = action === "approve"
        ? `${ADMIN_API_URL}/approvals/${userId}/approve`
        : `${ADMIN_API_URL}/approvals/${userId}/reject`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      console.error(`[approvals] ${action} ${userId} failed:`, err?.message ?? err);
      setError(`Failed to ${action} user.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="rounded-[10px] px-3.5 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="rounded-[10px] px-3.5 py-2 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
