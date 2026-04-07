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

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink transition-all duration-200 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15";
const labelCls = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

const categoryOptions = [
  { value: "financial",  label: "Financial" },
  { value: "legal",      label: "Legal" },
  { value: "governance", label: "Governance" },
  { value: "market",     label: "Market" },
  { value: "team",       label: "Team" },
];

export default function AddTaskForm({ deals, onCancel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ category: "", title: "", notes: "", dealId: "" });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${STARTUP_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          category: form.category,
          title:    form.title,
          notes:    form.notes || null,
          dealId:   form.dealId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      router.refresh();
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[22px] p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-semibold tracking-tight">Add Task</h2>
        <button type="button" onClick={onCancel} className="text-xs font-medium text-ink-soft hover:text-ink transition-colors">Cancel</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div>
        <label className={labelCls}>Category *</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)} required className={inputCls}>
          <option value="">Select category</option>
          {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
          placeholder="e.g. Prepare Q4 financial statements"
          className={inputCls}
        />
      </div>

      {deals.length > 0 && (
        <div>
          <label className={labelCls}>Link to Deal</label>
          <select value={form.dealId} onChange={(e) => update("dealId", e.target.value)} className={inputCls}>
            <option value="">— No specific deal —</option>
            {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          placeholder="Optional context or description"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Adding…" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
