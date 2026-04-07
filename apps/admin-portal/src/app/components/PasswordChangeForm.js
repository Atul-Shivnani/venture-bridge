"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink transition-all duration-200 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15";
const labelCls = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

function getToken() {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("vb_token="))
      ?.split("=")[1] ?? ""
  );
}

export default function PasswordChangeForm({ apiUrl }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Password changed successfully!
        </div>
      )}

      <div>
        <label className={labelCls}>Current Password</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>New Password</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          required
          minLength={8}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Confirm New Password</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          required
          minLength={8}
          className={inputCls}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[14px] px-5 py-2.5 bg-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Changing…" : "Change Password"}
        </button>
      </div>
    </form>
  );
}
