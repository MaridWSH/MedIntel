"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Check, LayoutGrid, List } from "lucide-react";
import { SORT_LABELS, SortOption } from "@/types/types";

interface ResultsToolbarProps {
  total: number;
  validatedCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

const SORT_OPTIONS: SortOption[] = [
  "relevance",
  "newest",
  "most-cited",
  "grade",
  "practice-changing",
];

export default function ResultsToolbar({
  total,
  validatedCount,
  sort,
  onSortChange,
  view,
  onViewChange,
}: ResultsToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-ink/10">
      <div className="flex items-baseline gap-3">
        <div>
          <div className="text-[10.5px] mono-stat text-ink/45 mb-1">
            RESULTS
          </div>
          <div className="font-serif text-[28px] tracking-tight tnum">
            {total.toLocaleString()}{" "}
            <span className="text-ink/40 text-[20px]">papers found</span>
          </div>
        </div>
        <span className="hidden md:inline-flex px-2 h-6 rounded-md bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[9.5px] mono-stat items-center">
          VALIDATED ONLY · {validatedCount.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            onBlur={() => setTimeout(() => setSortOpen(false), 150)}
            className="flex items-center gap-2 px-3 h-9 rounded-md border border-ink/15 bg-paper text-[12.5px] font-medium transition-colors hover:bg-ink/5"
          >
            <ArrowUpDown className="text-teal" size={13} />
            <span className="text-ink/55">Sort:</span>
            <span className="text-ink-soft">{SORT_LABELS[sort]}</span>
            <ChevronDown className="text-ink/40" size={13} />
          </button>

          {sortOpen && (
            <div className="absolute top-[calc(100%+4px)] right-0 w-52 bg-paper border border-ink/15 rounded-xl shadow-[0_20px_50px_-12px_rgba(11,29,42,0.22)] p-1.5 z-50 text-[12.5px]">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSortChange(option);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-ink/5 ${
                    sort === option ? "bg-ink/[0.04] text-ink-soft font-medium" : "text-ink-soft"
                  }`}
                >
                  <span className="w-[13px]">
                    {sort === option && <Check className="text-teal" size={13} />}
                  </span>
                  {SORT_LABELS[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-md border border-ink/15 bg-paper">
          <button
            onClick={() => onViewChange("grid")}
            className={`w-7 h-7 rounded inline-flex items-center justify-center ${
              view === "grid" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`w-7 h-7 rounded inline-flex items-center justify-center ${
              view === "list" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
            }`}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
