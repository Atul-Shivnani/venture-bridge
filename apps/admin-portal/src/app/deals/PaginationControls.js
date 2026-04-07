"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PaginationControls({ skip = 0, limit = 50, total = 0 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNext = () => {
    if (skip + limit >= total) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("skip", (skip + limit).toString());
    router.push(`?${params.toString()}`);
  };

  const handlePrev = () => {
    if (skip <= 0) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("skip", Math.max(0, skip - limit).toString());
    router.push(`?${params.toString()}`);
  };

  if (total <= limit && skip === 0) return null;

  return (
    <div className="flex items-center justify-between p-5 border-t border-border bg-gray-50/50 rounded-b-[22px]">
      <p className="text-sm text-ink-soft">
        Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} deals
      </p>
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={skip <= 0}
          className="rounded-[14px] border border-border bg-white px-4 py-1.5 text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={skip + limit >= total}
          className="rounded-[14px] border border-border bg-white px-4 py-1.5 text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
