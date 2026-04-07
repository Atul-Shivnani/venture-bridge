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

export default function AssignAnalystSelect({ dealId, currentAnalystId, analysts }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const analystId = e.target.value || null;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/deals/${dealId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ analystId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError("Failed to assign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-1">
      <select
        value={currentAnalystId ?? ""}
        onChange={handleChange}
        disabled={loading}
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-ink disabled:opacity-50 cursor-pointer"
      >
        <option value="">Unassigned</option>
        {analysts.map((a) => (
          <option key={a.id} value={a.id}>{a.email}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
