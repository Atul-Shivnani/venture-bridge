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
  { value: "pending",     label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "complete",    label: "Complete" },
  { value: "flagged",     label: "Flagged" },
];

const statusCls = {
  pending:     "bg-gray-100 text-gray-700 hover:bg-gray-200",
  in_progress: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  complete:    "bg-[rgba(45,122,94,0.12)] text-accent-2 hover:bg-[rgba(45,122,94,0.2)]",
  flagged:     "bg-red-100 text-red-700 hover:bg-red-200",
};

export default function DiligenceAdminActions({ itemId, currentStatus, analysts, assignedToId }) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(newStatus) {
    setLoadingStatus(newStatus);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/diligence/${itemId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      setError("Failed to update status.");
    } finally {
      setLoadingStatus(null);
    }
  }

  async function handleAssign(analystId) {
    setLoadingAssign(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/diligence/${itemId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ analystId: analystId || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      setError("Failed to assign analyst.");
    } finally {
      setLoadingAssign(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {statusOptions
          .filter((s) => s.value !== currentStatus)
          .map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={loadingStatus !== null || loadingAssign}
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors disabled:opacity-50 ${statusCls[s.value]}`}
            >
              {loadingStatus === s.value ? "…" : s.label}
            </button>
          ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-soft">Assign:</span>
        <select
          value={assignedToId ?? ""}
          onChange={(e) => handleAssign(e.target.value)}
          disabled={loadingAssign}
          className="text-xs rounded-lg border border-border bg-white px-2 py-1 text-ink cursor-pointer disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {analysts.map((a) => (
            <option key={a.id} value={a.id}>{a.email}</option>
          ))}
        </select>
        {loadingAssign && <span className="text-xs text-ink-soft">…</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
