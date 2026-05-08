"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function PersonIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

export default function ProfileButton() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const token = getCookie("vb_token");
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) setUser(payload);
    }
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function signOut() {
    document.cookie = "vb_token=; path=/; max-age=0; samesite=lax";
    window.location.href = `${WEBSITE_URL}/signin`;
  }

  const initial = user?.email ? user.email[0].toUpperCase() : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-white border-none cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
      >
        <PersonIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="dropdown-animate absolute top-[calc(100%+10px)] right-0 min-w-[220px] bg-card border border-border rounded-[18px] shadow-[0_16px_40px_rgba(14,165,233,0.14)] p-2 z-50"
        >
          <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold text-base shrink-0">
              {initial ?? <PersonIcon className="w-5 h-5" />}
            </span>
            <div className="min-w-0">
              <p className="text-[0.84rem] font-semibold text-ink truncate">{user?.email ?? "—"}</p>
              <p className="text-[0.72rem] font-semibold uppercase tracking-widest text-accent mt-px">{user?.portal ?? ""}</p>
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-[0.875rem] font-medium text-ink no-underline transition-colors hover:bg-black/5"
          >
            <PersonIcon />
            Profile
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-[0.875rem] font-medium text-ink no-underline transition-colors hover:bg-black/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>

          <div className="h-px bg-border my-1" />

          <button
            role="menuitem"
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-[0.875rem] font-medium text-red-600 bg-transparent border-none cursor-pointer transition-colors hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
