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

const typeOptions = [
  { value: "pitch_deck", label: "Pitch Deck" },
  { value: "financial_model", label: "Financial Model" },
  { value: "cap_table", label: "Cap Table" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
];

export default function AddDocumentForm({ onCancel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "", filename: "", url: "" });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${STARTUP_API_URL}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          type: form.type,
          filename: form.filename,
          url: form.url,
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
        <h2 className="text-[1rem] font-semibold tracking-tight">Add Document</h2>
        <button type="button" onClick={onCancel} className="text-xs font-medium text-ink-soft hover:text-ink transition-colors">Cancel</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div>
        <label className={labelCls}>Document Type *</label>
        <select value={form.type} onChange={(e) => update("type", e.target.value)} required className={inputCls}>
          <option value="">Select type</option>
          {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>File Name *</label>
        <input type="text" value={form.filename} onChange={(e) => update("filename", e.target.value)} required placeholder="e.g. Series_A_Deck.pdf" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Document URL *</label>
        <input type="url" value={form.url} onChange={(e) => update("url", e.target.value)} required placeholder="https://drive.google.com/..." className={inputCls} />
        <p className="text-xs text-ink-soft mt-1">Link to your document (Google Drive, Dropbox, etc.)</p>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Adding…" : "Add Document"}
        </button>
      </div>
    </form>
  );
}
