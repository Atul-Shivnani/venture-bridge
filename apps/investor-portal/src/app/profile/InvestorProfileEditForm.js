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

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink transition-all duration-200 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15";

const labelCls = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

const investorTypeOptions = [
  { value: "vc", label: "VC Fund" },
  { value: "angel", label: "Angel Investor" },
  { value: "family_office", label: "Family Office" },
  { value: "corporate_vc", label: "Corporate VC" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
];

const profitabilityOptions = [
  { value: "", label: "No preference" },
  { value: "pre-revenue-ok", label: "Pre-revenue OK" },
  { value: "path-to-profitability", label: "Path to profitability" },
  { value: "profitable", label: "Must be profitable" },
];

export default function InvestorProfileEditForm({ profile, onCancel }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const arrToStr = (val) => (Array.isArray(val) ? val.join(", ") : val ?? "");

  const [form, setForm] = useState({
    firmName: profile?.firmName ?? "",
    investorType: profile?.investorType ?? "",
    ticketSizeLabel: profile?.ticketSizeLabel ?? "",
    geographies: arrToStr(profile?.geographies),
    sectors: arrToStr(profile?.sectors),
    stagesAllowed: arrToStr(profile?.stagesAllowed),
    instrumentTypesAllowed: arrToStr(profile?.instrumentTypesAllowed),
    revenueFloor: profile?.revenueFloor ?? "",
    profitabilityPreference: profile?.profitabilityPreference ?? "",
    esgExclusions: arrToStr(profile?.esgExclusions),
    regulatoryExclusions: arrToStr(profile?.regulatoryExclusions),
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function parseList(str) {
    if (!str) return [];
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = {
        firmName: form.firmName || undefined,
        investorType: form.investorType || undefined,
        ticketSizeLabel: form.ticketSizeLabel || undefined,
        geographies: parseList(form.geographies),
        sectors: parseList(form.sectors),
        stagesAllowed: parseList(form.stagesAllowed),
        instrumentTypesAllowed: parseList(form.instrumentTypesAllowed),
        revenueFloor: form.revenueFloor ? parseFloat(form.revenueFloor) : null,
        profitabilityPreference: form.profitabilityPreference || null,
        esgExclusions: parseList(form.esgExclusions),
        regulatoryExclusions: parseList(form.regulatoryExclusions),
      };

      const res = await fetch(`${INVESTOR_API_URL}/profile`, {
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
        <button type="button" onClick={onCancel} className="text-xs font-medium text-ink-soft hover:text-ink transition-colors">Cancel</button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Profile updated successfully!</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Firm Name *</label>
          <input type="text" value={form.firmName} onChange={(e) => update("firmName", e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Investor Type *</label>
          <select value={form.investorType} onChange={(e) => update("investorType", e.target.value)} required className={inputCls}>
            <option value="">Select type</option>
            {investorTypeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Ticket Size Range *</label>
        <input type="text" value={form.ticketSizeLabel} onChange={(e) => update("ticketSizeLabel", e.target.value)} required placeholder='e.g. "$250k – $2M"' className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Geographies (comma-separated) *</label>
        <input type="text" value={form.geographies} onChange={(e) => update("geographies", e.target.value)} required placeholder="e.g. India, Southeast Asia" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Sectors (comma-separated)</label>
        <input type="text" value={form.sectors} onChange={(e) => update("sectors", e.target.value)} placeholder="e.g. FinTech, SaaS" className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Stages Allowed (comma-separated)</label>
          <input type="text" value={form.stagesAllowed} onChange={(e) => update("stagesAllowed", e.target.value)} placeholder="e.g. pre-seed, seed" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Instrument Types (comma-separated)</label>
          <input type="text" value={form.instrumentTypesAllowed} onChange={(e) => update("instrumentTypesAllowed", e.target.value)} placeholder="e.g. SAFE, Equity" className={inputCls} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Revenue Floor (USD)</label>
          <input type="number" value={form.revenueFloor} onChange={(e) => update("revenueFloor", e.target.value)} min="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Profitability Preference</label>
          <select value={form.profitabilityPreference} onChange={(e) => update("profitabilityPreference", e.target.value)} className={inputCls}>
            {profitabilityOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>ESG Exclusions (comma-separated)</label>
        <input type="text" value={form.esgExclusions} onChange={(e) => update("esgExclusions", e.target.value)} placeholder="e.g. Tobacco, Weapons" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Regulatory Exclusions (comma-separated)</label>
        <input type="text" value={form.regulatoryExclusions} onChange={(e) => update("regulatoryExclusions", e.target.value)} placeholder="e.g. Crypto, Cannabis" className={inputCls} />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="rounded-[14px] px-5 py-2.5 bg-white border border-border text-ink font-semibold text-sm hover:bg-white/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading || success} className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Saving…" : success ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
