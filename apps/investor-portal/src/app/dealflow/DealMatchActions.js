"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INVESTOR_API_URL = process.env.NEXT_PUBLIC_INVESTOR_API_URL || "http://localhost:8001";

function getToken() {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("vb_token="))
      ?.split("=")[1] ?? ""
  );
}

const statusOptions = [
  { value: "interested", label: "Interested" },
  { value: "in_diligence", label: "In Diligence" },
  { value: "term_sheet", label: "Term Sheet" },
  { value: "closed", label: "Closed" },
  { value: "passed", label: "Pass" },
];

const statusCls = {
  interested:   "bg-orange-100 text-orange-700 hover:bg-orange-200",
  in_diligence: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  term_sheet:   "bg-[rgba(45,122,94,0.12)] text-accent-2 hover:bg-[rgba(45,122,94,0.2)]",
  closed:       "bg-green-100 text-green-700 hover:bg-green-200",
  passed:       "bg-red-100 text-red-700 hover:bg-red-200",
};

export default function DealMatchActions({ matchId, currentStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function handleAction(newStatus) {
    setLoading(newStatus);
    setError("");
    try {
      const res = await fetch(`${INVESTOR_API_URL}/dealflow/${matchId}`, {
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
      console.error(`[dealflow] update ${matchId} failed:`, err?.message);
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
