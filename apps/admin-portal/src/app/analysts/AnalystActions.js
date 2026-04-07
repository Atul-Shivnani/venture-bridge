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

export function RemoveAnalystButton({ analystId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/analysts/${analystId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to remove analyst.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRemove}
        disabled={loading}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Removing…" : "Remove"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function AddAnalystForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/analysts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setEmail("");
      setPassword("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to add analyst.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
      >
        + Add Analyst
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 bg-white border border-border rounded-[18px]">
      <div className="grid gap-1">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="analyst@example.com"
          className="rounded-xl border border-border px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 w-56"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="Min 8 characters"
          className="rounded-xl border border-border px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 w-44"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full px-4 py-2 bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); }}
          className="rounded-full px-4 py-2 border border-border text-sm font-semibold text-ink-soft hover:text-ink transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
