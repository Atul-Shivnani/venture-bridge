"use client";

import { useState } from "react";

const API_BASE =
  typeof window !== "undefined"
    ? "" // relative fetch goes through Next.js route handler
    : (process.env.ANALYST_API_URL || "http://localhost:8004");

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function MetricRow({ label, value, format = "number" }) {
  if (value === null || value === undefined) return null;
  let display = value;
  if (format === "currency") display = `$${Number(value).toLocaleString()}`;
  else if (format === "percent") display = `${Number(value).toFixed(1)}%`;
  else if (format === "ratio")   display = Number(value).toFixed(2);
  else if (format === "months")  display = `${Number(value).toFixed(1)} mo`;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{display}</span>
    </div>
  );
}

const CONFIDENCE_CLS = {
  high:   "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-red-100 text-red-700",
};

export default function AnalyzePanel({ dealId, initialAnalysis }) {
  const [rawInput, setRawInput]   = useState("");
  const [analysis, setAnalysis]   = useState(initialAnalysis ?? null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function handleAnalyze() {
    if (!rawInput.trim()) {
      setError("Paste the financial statements before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = getCookie("vb_token");
      const res = await fetch(`/api/analyze/${dealId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rawInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `HTTP ${res.status}`);
      }
      const result = await res.json();
      setAnalysis(result);
      setRawInput("");
    } catch (err) {
      setError(err.message ?? "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">

      {/* Input card */}
      <div className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.05rem] font-semibold tracking-tight">Financial statement analysis</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Claude AI
          </span>
        </div>
        <p className="text-xs text-ink-soft -mt-2">
          Paste income statement, balance sheet, or cash flow data in any format. Claude will extract all available metrics.
        </p>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste raw financial data here — CSV exports, PDF text, spreadsheet data, or plain numbers..."
          rows={8}
          className="w-full rounded-[14px] border border-border bg-bg text-ink text-sm px-3.5 py-3 resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-ink-soft/60"
        />
        {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="self-start rounded-[12px] px-5 py-2.5 bg-accent text-white font-semibold text-sm border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing with Claude…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {analysis ? "Re-analyze" : "Analyze with Claude"}
            </>
          )}
        </button>
      </div>

      {/* Results card */}
      {analysis && (
        <div className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-[1.05rem] font-semibold tracking-tight">Extracted metrics</h3>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${CONFIDENCE_CLS[analysis.confidence] ?? ""}`}>
                {analysis.confidence} confidence
              </span>
              <span className="text-xs text-ink-soft">{analysis.aiModel}</span>
            </div>
          </div>

          {analysis.aiNotes && (
            <div className="bg-sky-50 border border-sky-200 rounded-[14px] px-3.5 py-3 text-xs text-sky-800 leading-relaxed">
              <strong className="font-semibold">AI notes:</strong> {analysis.aiNotes}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <p className="text-[0.75rem] font-bold uppercase tracking-widest text-ink-soft mb-2">Income statement</p>
              <MetricRow label="Revenue"          value={analysis.revenue}          format="currency" />
              <MetricRow label="Revenue growth"   value={analysis.revenueGrowthPct} format="percent" />
              <MetricRow label="Gross profit"     value={analysis.grossProfit}      format="currency" />
              <MetricRow label="Gross margin"     value={analysis.grossMargin}      format="percent" />
              <MetricRow label="Operating profit" value={analysis.operatingProfit}  format="currency" />
              <MetricRow label="Net profit"       value={analysis.netProfit}        format="currency" />
              <MetricRow label="Net margin"       value={analysis.netMargin}        format="percent" />
              <MetricRow label="EBITDA"           value={analysis.ebitda}           format="currency" />
              <MetricRow label="EBITDA margin"    value={analysis.ebitdaMargin}     format="percent" />
            </div>
            <div>
              <p className="text-[0.75rem] font-bold uppercase tracking-widest text-ink-soft mb-2">Balance sheet &amp; cash</p>
              <MetricRow label="Cash on hand"       value={analysis.cashOnHand}       format="currency" />
              <MetricRow label="Total debt"         value={analysis.totalDebt}        format="currency" />
              <MetricRow label="Total equity"       value={analysis.totalEquity}      format="currency" />
              <MetricRow label="Debt / equity"      value={analysis.debtToEquity}     format="ratio" />
              <MetricRow label="Working capital"    value={analysis.workingCapital}   format="currency" />
              <MetricRow label="Current ratio"      value={analysis.currentRatio}     format="ratio" />
              <MetricRow label="Quick ratio"        value={analysis.quickRatio}       format="ratio" />
              <MetricRow label="Operating cash flow" value={analysis.operatingCashFlow} format="currency" />
              <MetricRow label="Burn rate / mo"     value={analysis.burnRate}         format="currency" />
              <MetricRow label="Runway"             value={analysis.runwayMonths}     format="months" />
            </div>
          </div>

          {analysis.createdAt && (
            <p className="text-xs text-ink-soft text-right">
              Last analyzed {new Date(analysis.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
