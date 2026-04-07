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

const flagCls = {
  positive: "bg-green-100 text-green-700",
  warning:  "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const flagOptions = [
  { value: "positive", label: "Positive" },
  { value: "warning",  label: "Warning" },
  { value: "critical", label: "Critical" },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DealNotesPanel({ dealId, noteCount = 0 }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [content, setContent] = useState("");
  const [flagType, setFlagType] = useState("warning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchNotes() {
    setFetching(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/deals/${dealId}/notes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      setNotes(data.notes ?? []);
    } catch {
      setNotes([]);
    } finally {
      setFetching(false);
    }
  }

  function handleToggle() {
    if (!open && notes === null) fetchNotes();
    setOpen((v) => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API_URL}/deals/${dealId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content, flagType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setNotes((prev) => [...(prev ?? []), data.note]);
      setContent("");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to add note.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        className="text-xs text-ink-soft hover:text-ink transition-colors font-medium"
      >
        {open ? "▲ Hide notes" : `▼ Notes (${notes !== null ? notes.length : noteCount})`}
      </button>

      {open && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3">
          {fetching && <p className="text-xs text-ink-soft">Loading…</p>}
          {!fetching && notes && notes.length > 0 ? (
            <ul className="grid gap-2">
              {notes.map((note) => (
                <li key={note.id} className="flex gap-3 items-start">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold capitalize ${flagCls[note.flagType]}`}>
                    {note.flagType}
                  </span>
                  <div className="grid gap-0.5 min-w-0">
                    <p className="text-sm text-ink leading-snug">{note.content}</p>
                    <p className="text-xs text-ink-soft">
                      {note.authorEmail ?? "Admin"} · {formatDate(note.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !fetching && <p className="text-xs text-ink-soft">No notes yet.</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              placeholder="Add a note…"
              required
              className="flex-1 min-w-[180px] rounded-xl border border-border px-3 py-2 text-sm text-ink bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <div className="flex flex-col gap-1.5">
              <select
                value={flagType}
                onChange={(e) => setFlagType(e.target.value)}
                className="rounded-xl border border-border px-2 py-1.5 text-xs text-ink bg-white cursor-pointer"
              >
                {flagOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="rounded-full px-3 py-1.5 bg-accent text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                {loading ? "…" : "Add"}
              </button>
            </div>
            {error && <p className="w-full text-xs text-red-600">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
