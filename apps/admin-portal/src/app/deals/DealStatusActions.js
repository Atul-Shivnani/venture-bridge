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

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "live", label: "Live" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
];

const statusCls = {
  draft:        "bg-gray-100 text-gray-700 hover:bg-gray-200",
  under_review: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  approved:     "bg-blue-100 text-blue-700 hover:bg-blue-200",
  live:         "bg-[rgba(45,122,94,0.12)] text-accent-2 hover:bg-[rgba(45,122,94,0.2)]",
  closed:       "bg-purple-100 text-purple-700 hover:bg-purple-200",
  rejected:     "bg-red-100 text-red-700 hover:bg-red-200",
};

export default function DealStatusActions({ dealId, currentStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function handleAction(newStatus) {
    setLoading(newStatus);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/deals/${dealId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      console.error(`[deals] status update ${dealId} failed:`, err?.message);
      setError("Failed to update status.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap gap-1.5">
        {statusOptions
          .filter((s) => s.value !== currentStatus)
          .map((s) => (
            <button
              key={s.value}
              onClick={() => handleAction(s.value)}
              disabled={loading !== null}
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors disabled:opacity-50 ${statusCls[s.value] ?? "bg-gray-100 text-gray-700"}`}
            >
              {loading === s.value ? "…" : s.label}
            </button>
          ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
