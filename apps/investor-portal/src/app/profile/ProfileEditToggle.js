"use client";

import { useState } from "react";
import InvestorProfileEditForm from "./InvestorProfileEditForm";

export default function ProfileEditToggle({ profile, fields, approved }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <InvestorProfileEditForm profile={profile} onCancel={() => setEditing(false)} />;
  }

  return (
    <article className="bg-card border border-border rounded-[22px] p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-semibold tracking-tight">Investment criteria</h2>
        <button
          onClick={() => setEditing(true)}
          className="rounded-[10px] px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          Edit Profile
        </button>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {fields.map((f) => (
          <div key={f.label} className="grid gap-0.5">
            <dt className="text-xs text-ink-soft font-medium uppercase tracking-wide">{f.label}</dt>
            <dd className="text-sm capitalize">{String(f.value)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
