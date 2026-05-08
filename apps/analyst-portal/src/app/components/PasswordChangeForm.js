"use client";

import { useState } from "react";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function PasswordChangeForm() {
  const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [status, setStatus] = useState(null); // "success" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setStatus("error");
      setMessage("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const token = getCookie("vb_token");
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword:     form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "Password updated successfully.");
        setForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setStatus("error");
        setMessage(data.detail ?? "Failed to update password.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[22px] p-5 grid gap-4">
      <h2 className="text-[1.05rem] font-semibold">Change password</h2>

      {["currentPassword", "newPassword", "confirm"].map((field) => (
        <div key={field} className="grid gap-1.5">
          <label className="text-sm font-medium capitalize">
            {field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password" : "Confirm new password"}
          </label>
          <input
            type="password"
            value={form[field]}
            onChange={set(field)}
            required
            className="rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      ))}

      {status && (
        <p className={`text-xs font-medium ${status === "success" ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-[12px] px-5 py-2.5 bg-accent text-white font-semibold text-sm border-none cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
