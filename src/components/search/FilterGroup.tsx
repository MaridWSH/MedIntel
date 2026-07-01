"use client";

import { useState } from "react";
import { ChevronDown, Search, LucideIcon } from "lucide-react";
import { FilterOption } from "../../types/types";

interface FilterGroupProps {
  title: string;
  icon: LucideIcon;
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
  searchable?: boolean;
  initialVisible?: number;
}

export default function FilterGroup({
  title,
  icon: Icon,
  options,
  selected,
  onToggle,
  defaultOpen = true,
  searchable = false,
  initialVisible,
}: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const visible =
    initialVisible && !showAll ? filtered.slice(0, initialVisible) : filtered;
  const remaining = initialVisible ? filtered.length - visible.length : 0;

  return (
    <div className="bg-paper border border-ink/12 rounded-2xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 h-11 transition-colors hover:bg-ink/5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
          <Icon className="text-teal-deep" size={15} />
          {title}
        </span>
        <ChevronDown
          className={`text-ink/45 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          size={14}
        />
      </button>

      {open && (
        <div className="px-3 pb-4 pt-1">
          {searchable && (
            <div className="flex items-center gap-2 px-2 h-8 rounded-md bg-ink/[0.04] border border-ink/10 mb-3">
              <Search className="text-ink/40" size={13} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}`}
                className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-ink/40"
              />
            </div>
          )}

          <ul className="space-y-0.5">
            {visible.map((option) => {
              const checked = selected.includes(option.id);
              return (
                <li key={option.id}>
                  <label className="flex items-center justify-between gap-2 px-2 h-8 rounded-md hover:bg-ink/[0.04] cursor-pointer text-[12.5px]">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(option.id)}
                        className="accent-teal-deep w-3.5 h-3.5"
                      />
                      <span
                        className={checked ? "text-ink-soft font-medium" : "text-ink-soft"}
                      >
                        {option.label}
                      </span>
                    </span>
                    <span className="text-[10px] mono-stat text-ink/45 tnum">
                      {option.count}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {initialVisible && remaining > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-2 w-full text-[11px] mono-stat text-teal-deep hover:underline py-1"
            >
              SHOW {remaining} MORE
            </button>
          )}
        </div>
      )}
    </div>
  );
}
