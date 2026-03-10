"use client";

import { useState } from "react";
import Link from "next/link";

const getPortalUrl = (portal) => {
  const map = {
    investor: process.env.NEXT_PUBLIC_INVESTOR_PORTAL_URL,
    startup: process.env.NEXT_PUBLIC_STARTUP_PORTAL_URL,
    admin: process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL,
  };
  return map[portal] || "/";
};

const inputCls =
  "w-full rounded-xl border border-border bg-ink/[0.04] px-5 py-4 text-sm text-ink placeholder:text-ink-soft/40 transition-all duration-200 focus:border-accent/60 focus:bg-ink/[0.06] focus:outline-none focus:ring-2 focus:ring-accent/15";

const selectCls =
  "w-full appearance-none rounded-xl border border-border bg-ink/[0.04] px-5 py-4 text-sm text-ink transition-all duration-200 focus:border-accent/60 focus:bg-ink/[0.06] focus:outline-none focus:ring-2 focus:ring-accent/15 cursor-pointer";

const labelCls = "block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2";

function Field({ label, required, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/50 transition-colors hover:text-ink-soft"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function RoleSelector({ onChange }) {
  const roles = [
    {
      id: "startup",
      label: "Startup",
      description: "Raise funding from verified investors",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "investor",
      label: "Investor",
      description: "Access curated, analyst-validated deal flow",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">I am registering as a…</p>
      <div className="space-y-2.5">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className="group flex w-full items-center gap-4 rounded-xl border border-border px-5 py-4 text-left transition-all duration-200 hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-ink-soft shadow-sm transition-all duration-200 group-hover:border-accent/30 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(233,111,58,0.25)]">
              {role.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{role.label}</p>
              <p className="text-xs text-ink-soft">{role.description}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-ink-soft/40 transition-colors group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      <div className="h-px w-full bg-border" />
      <p className="text-center text-xs text-ink-soft">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function StartupForm({ formState, onChange }) {
  return (
    <div className="space-y-5">
      <Field label="Company Name" required>
        <input
          type="text"
          value={formState.companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
          placeholder="Acme Inc."
          required
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business Email" required>
          <input
            type="email"
            value={formState.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="founder@company.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </Field>
        <Field label="Password" required>
          <PasswordInput
            id="reg-password"
            value={formState.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sector / Niche" required>
          <input
            type="text"
            value={formState.niche}
            onChange={(e) => onChange("niche", e.target.value)}
            placeholder="e.g. FinTech"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Country" required>
          <input
            type="text"
            value={formState.incorporationCountry}
            onChange={(e) => onChange("incorporationCountry", e.target.value)}
            placeholder="e.g. India"
            required
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Funding Stage" required>
        <SelectWrapper>
          <select
            value={formState.stage}
            onChange={(e) => onChange("stage", e.target.value)}
            required
            className={selectCls}
          >
            <option value="">Select stage</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="growth">Growth</option>
          </select>
        </SelectWrapper>
      </Field>
    </div>
  );
}

function InvestorForm({ formState, onChange }) {
  return (
    <div className="space-y-5">
      <Field label="Firm Name" required>
        <input
          type="text"
          value={formState.firmName}
          onChange={(e) => onChange("firmName", e.target.value)}
          placeholder="Sequoia Capital"
          required
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business Email" required>
          <input
            type="email"
            value={formState.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="partner@vc.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </Field>
        <Field label="Password" required>
          <PasswordInput
            id="reg-password"
            value={formState.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Investor Type" required>
          <SelectWrapper>
            <select
              value={formState.investorType}
              onChange={(e) => onChange("investorType", e.target.value)}
              required
              className={selectCls}
            >
              <option value="">Select type</option>
              <option value="vc">VC Fund</option>
              <option value="angel">Angel Investor</option>
              <option value="family-office">Family Office</option>
              <option value="corporate-vc">Corporate VC</option>
              <option value="other">Other</option>
            </select>
          </SelectWrapper>
        </Field>
        <Field label="Ticket Size" required>
          <input
            type="text"
            value={formState.ticketSize}
            onChange={(e) => onChange("ticketSize", e.target.value)}
            placeholder="e.g. $250k – $2M"
            required
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Preferred Geography" required>
        <input
          type="text"
          value={formState.geography}
          onChange={(e) => onChange("geography", e.target.value)}
          placeholder="e.g. India, Southeast Asia"
          required
          className={inputCls}
        />
      </Field>
    </div>
  );
}

export default function RegistrationFlow() {
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    companyName: "",
    niche: "",
    incorporationCountry: "",
    stage: "",
    firmName: "",
    investorType: "",
    ticketSize: "",
    geography: "",
  });

  const updateField = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const details =
        portal === "investor"
          ? {
              firmName: formState.firmName,
              investorType: formState.investorType,
              ticketSize: formState.ticketSize,
              geography: formState.geography,
            }
          : {
              companyName: formState.companyName,
              niche: formState.niche,
              incorporationCountry: formState.incorporationCountry,
              stage: formState.stage,
            };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formState.email, password: formState.password, portal, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const portalUrl = getPortalUrl(data.portal);
      window.location.href = `${portalUrl}/signin?token=${encodeURIComponent(data.token)}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1: role selector ── */
  if (!portal) {
    return <RoleSelector onChange={setPortal} />;
  }

  /* ── Step 2: form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Role badge */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-bg/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
            {portal === "startup" ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </span>
          <span className="text-sm font-semibold capitalize text-ink">{portal}</span>
        </div>
        <button
          type="button"
          onClick={() => { setPortal(null); setError(""); }}
          className="text-xs font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Change
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Form fields */}
      {portal === "investor" ? (
        <InvestorForm formState={formState} onChange={updateField} />
      ) : (
        <StartupForm formState={formState} onChange={updateField} />
      )}

      {/* Divider */}
      <div className="h-px w-full bg-border" />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,111,58,0.30)] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-ink-soft">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>

    </form>
  );
}
