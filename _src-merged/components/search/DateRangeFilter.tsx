"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const YEAR_HISTOGRAM = [45, 52, 65, 78, 85, 92, 88, 75, 82, 90, 95, 100];
const YEAR_LABELS = ["2012", "2014", "2016", "2018", "2020", "2022"];

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangeFilter({
  from,
  to,
  onChange,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-paper border border-ink/12 rounded-2xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 h-11 transition-colors hover:bg-ink/5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
          <Calendar className="text-teal-deep" size={15} />
          Date Range
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
          <div className="px-2 mb-3">
            <div className="text-[10px] mono-stat text-ink/45 mb-2">
              PUBLISHED
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <input
                type="text"
                value={from}
                onChange={(e) => onChange(e.target.value, to)}
                className="flex-1 bg-ink/[0.04] border border-ink/10 rounded-md px-2 h-8 outline-none focus:border-teal-deep tnum text-ink-soft"
              />
              <span className="text-ink/30">—</span>
              <input
                type="text"
                value={to}
                onChange={(e) => onChange(from, e.target.value)}
                className="flex-1 bg-ink/[0.04] border border-ink/10 rounded-md px-2 h-8 outline-none focus:border-teal-deep tnum text-ink-soft"
              />
            </div>
          </div>

          <div className="px-2">
            <div className="text-[10px] mono-stat text-ink/45 mb-2">
              DISTRIBUTION BY YEAR
            </div>
            <div className="flex items-end gap-1 h-12">
              {YEAR_HISTOGRAM.map((height, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    height >= 80 ? "bg-teal-deep" : "bg-ink/20"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] mono-stat text-ink/40 tnum">
              {YEAR_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
