"use client";

import { useState } from "react";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

const STATUS_CLS = {
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending:  "bg-amber-100 text-amber-700",
};

export default function MatchDecideRow({ match }) {
  const [status, setStatus]   = useState(match.status);
  const [loading, setLoading] = useState(false);

  async function decide(newStatus) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const token = getCookie("vb_token");
      const res = await fetch(`/api/matches/${match.id}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } finally {
      setLoading(false);
    }
  }

  const inv = match.investor;

  return (
    <li className="border border-border rounded-[14px] px-3 py-3 grid gap-2">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{inv.firmName}</p>
          <p className="text-xs text-ink-soft capitalize">{inv.investorType?.replace("_", " ")}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_CLS[status] ?? ""}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-ink-soft">
        ${Number(inv.ticketMin ?? 0).toLocaleString()} – ${Number(inv.ticketMax ?? 0).toLocaleString()}
        {" · "}Score {Math.round((match.matchScore ?? 0) * 100)}%
      </p>
      {status === "pending" && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => decide("approved")}
            disabled={loading}
            className="flex-1 rounded-[10px] py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => decide("rejected")}
            disabled={loading}
            className="flex-1 rounded-[10px] py-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </li>
  );
}
