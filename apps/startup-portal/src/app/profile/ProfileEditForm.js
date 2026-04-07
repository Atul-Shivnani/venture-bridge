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

const stageOptions = [
  { value: "idea", label: "Idea" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "growth", label: "Growth" },
];

export default function ProfileEditForm({ profile, onCancel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: profile?.companyName ?? "",
    sector: profile?.sector ?? "",
    subSector: profile?.subSector ?? "",
    country: profile?.country ?? "",
    fundingStage: profile?.fundingStage ?? "",
    foundedYear: profile?.foundedYear ?? "",
    teamSize: profile?.teamSize ?? "",
    website: profile?.website ?? "",
    description: profile?.description ?? "",
    businessModel: profile?.businessModel ?? "",
    customersServed: profile?.customersServed ?? "",
    amountRaising: profile?.amountRaising ?? "",
    instrumentType: profile?.instrumentType ?? "",
    useOfFunds: profile?.useOfFunds ?? "",
    arr: profile?.arr ?? "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = {
        companyName: form.companyName || undefined,
        sector: form.sector || undefined,
        subSector: form.subSector || null,
        country: form.country || undefined,
        fundingStage: form.fundingStage || undefined,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear, 10) : null,
        teamSize: form.teamSize ? parseInt(form.teamSize, 10) : null,
        website: form.website || null,
        description: form.description || null,
        businessModel: form.businessModel || null,
        customersServed: form.customersServed || null,
        amountRaising: form.amountRaising ? parseFloat(form.amountRaising) : null,
        instrumentType: form.instrumentType || null,
        useOfFunds: form.useOfFunds || null,
        arr: form.arr ? parseFloat(form.arr) : null,
      };

      const res = await fetch(`${STARTUP_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        if (onCancel) onCancel();
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[22px] p-6 grid gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-semibold tracking-tight">Edit Profile</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-ink-soft hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile updated successfully!
        </div>
      )}

      {/* Company basics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Company Name *</label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sector *</label>
          <input
            type="text"
            value={form.sector}
            onChange={(e) => update("sector", e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Sub-sector</label>
          <input
            type="text"
            value={form.subSector}
            onChange={(e) => update("subSector", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Country *</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Funding Stage *</label>
          <select
            value={form.fundingStage}
            onChange={(e) => update("fundingStage", e.target.value)}
            required
            className={inputCls}
          >
            <option value="">Select stage</option>
            {stageOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Founded Year</label>
          <input
            type="number"
            value={form.foundedYear}
            onChange={(e) => update("foundedYear", e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Team Size</label>
          <input
            type="number"
            value={form.teamSize}
            onChange={(e) => update("teamSize", e.target.value)}
            min="1"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://yourcompany.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Short Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Business Model</label>
          <input
            type="text"
            value={form.businessModel}
            onChange={(e) => update("businessModel", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Customers Served</label>
          <input
            type="text"
            value={form.customersServed}
            onChange={(e) => update("customersServed", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Amount Raising (USD)</label>
          <input
            type="number"
            value={form.amountRaising}
            onChange={(e) => update("amountRaising", e.target.value)}
            min="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Instrument Type</label>
          <input
            type="text"
            value={form.instrumentType}
            onChange={(e) => update("instrumentType", e.target.value)}
            placeholder="e.g. SAFE, Equity"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Use of Funds</label>
        <textarea
          value={form.useOfFunds}
          onChange={(e) => update("useOfFunds", e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className={labelCls}>Annual Recurring Revenue (USD)</label>
        <input
          type="number"
          value={form.arr}
          onChange={(e) => update("arr", e.target.value)}
          min="0"
          className={inputCls}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || success}
          className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving…" : success ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
