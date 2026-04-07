"use client";

import { useState } from "react";
import AddTaskForm from "./AddTaskForm";

export default function AddTaskToggle({ deals }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full px-4 py-1.5 bg-accent text-white text-sm font-semibold border border-accent hover:opacity-90 transition-opacity"
        >
          + Add task
        </button>
      </div>
    );
  }

  return <AddTaskForm deals={deals} onCancel={() => setOpen(false)} />;
}
