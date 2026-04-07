"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STARTUP_API_URL = process.env.NEXT_PUBLIC_STARTUP_API_URL || "http://localhost:8002";

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

export default function TaskStatusActions({ taskId, currentStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function handleAction(newStatus) {
    setLoading(newStatus);
    setError("");
    try {
      const res = await fetch(`${STARTUP_API_URL}/tasks/${taskId}/status`, {
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
      setError("Failed to update.");
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
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors disabled:opacity-50 ${statusCls[s.value]}`}
            >
              {loading === s.value ? "…" : s.label}
            </button>
          ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
