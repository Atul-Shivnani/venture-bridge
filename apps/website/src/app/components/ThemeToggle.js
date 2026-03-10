"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vb-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={dark}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur-sm transition-all hover:text-ink"
    >
      {/* Track */}
      <span className="relative h-4 w-7 rounded-full bg-ink/15 transition-colors">
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-accent shadow-sm transition-all duration-200 ${dark ? "left-3.5" : "left-0.5"}`}
        />
      </span>
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}
