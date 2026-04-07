"use client";

import { useState } from "react";
import CreateDealForm from "./CreateDealForm";

export default function NewDealToggle() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <CreateDealForm onCancel={() => setShowForm(false)} />;
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full rounded-[18px] border-2 border-dashed border-border p-5 text-center text-sm font-semibold text-ink-soft hover:border-accent/40 hover:text-accent transition-colors cursor-pointer bg-transparent"
    >
      + Create New Deal
    </button>
  );
}
