"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalResults);

  const pageButtons = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

  return (
    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-ink/10">
      <div className="text-[11px] mono-stat text-ink/55">
        SHOWING <span className="text-ink-soft font-semibold tnum">{start} – {end}</span>{" "}
        OF <span className="text-ink-soft font-semibold tnum">{totalResults.toLocaleString()}</span>{" "}
        · <span className="tnum">{totalPages}</span> PAGES
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-9 h-9 rounded-md border border-ink/15 inline-flex items-center justify-center text-ink/55 hover:bg-ink/5 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pageButtons.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-9 h-9 rounded-md text-[12.5px] font-semibold inline-flex items-center justify-center ${
              page === n
                ? "bg-ink text-paper"
                : "border border-ink/15 text-ink-soft font-medium hover:bg-ink/5"
            }`}
          >
            {n}
          </button>
        ))}

        {totalPages > 4 && (
          <>
            <span className="px-2 text-ink/40">…</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-md border border-ink/15 text-ink-soft text-[12.5px] font-medium inline-flex items-center justify-center hover:bg-ink/5"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-9 h-9 rounded-md border border-ink/15 inline-flex items-center justify-center text-ink-soft hover:bg-ink/5 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  );
}
