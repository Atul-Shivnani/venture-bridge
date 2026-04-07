"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("skip", "0"); // Reset pagination on search
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by company or deal title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-[14px] border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 w-full max-w-sm"
      />
      <button type="submit" className="rounded-[14px] bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
        Search
      </button>
      {searchParams.get("search") && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("search");
            params.set("skip", "0");
            router.push(`?${params.toString()}`);
          }}
          className="rounded-[14px] bg-gray-100 px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-gray-200 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  );
}
