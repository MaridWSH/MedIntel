"use client";

import { Search, Sparkles, Zap, Globe, ChevronRight, Plus, X } from "lucide-react";

export interface ActiveChip {
  key: string;
  label: string;
  emphasized?: boolean;
  onRemove: () => void;
}

interface SearchHeroProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  chips: ActiveChip[];
  resultCount: number;
}

export default function SearchHero({
  query,
  onQueryChange,
  onSubmit,
  chips,
  resultCount,
}: SearchHeroProps) {
  return (
    <section className="relative border-b border-ink/10 bg-paper-warm/40 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60" />
      <div
        className="absolute inset-x-0 top-0 h-[280px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 30% 20%, rgba(20, 184, 166, 0.10) 0%, rgba(20, 184, 166, 0.03) 40%, rgba(246, 243, 234, 0) 70%)",
        }}
      />

      <div className="max-w-[1380px] mx-auto px-6 pt-8 pb-6 relative">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45 mb-3">
              <a href="#" className="hover:text-teal-deep">
                CLARITAS
              </a>
              <ChevronRight size={11} className="text-ink/30" />
              <span>SEARCH</span>
              <ChevronRight size={11} className="text-ink/30" />
              <span className="text-ink-soft">CARDIOLOGY</span>
            </div>
            <h1 className="display text-[36px] md:text-[48px] tracking-tight">
              Search <span className="italic text-teal">&amp; discovery</span>
            </h1>
          </div>

          <div
            className="animate-fade-up hidden md:flex items-center gap-2 text-[10.5px] mono-stat text-ink/50"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-ink/15 bg-paper">
              <Zap size={11} className="text-teal" />
              <span className="tnum">HYBRID SEARCH</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-ink/15 bg-paper">
              <Globe size={11} className="text-teal" />
              <span>EN + AR CORPUS</span>
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="animate-fade-up relative" style={{ animationDelay: "0.16s" }}>
          <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-bright/30 via-teal-deep/20 to-teal-bright/20 blur-2xl opacity-40 rounded-[26px]" />
          <div className="relative bg-paper border border-ink/15 rounded-[22px] shadow-[0_24px_60px_-30px_rgba(11,29,42,0.35),0_2px_8px_-4px_rgba(11,29,42,0.1)] overflow-hidden">
            <form
              className="flex items-center gap-3 pl-5 pr-3 py-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <Search className="text-teal shrink-0" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[15.5px] placeholder:text-ink/35 w-full"
                placeholder="Search 50M+ medical papers, understood in seconds"
              />
              <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">
                ⌘K
              </span>
              <button
                type="submit"
                className="h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-all duration-200 hover:bg-teal-deep hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(11,125,114,0.55)]"
              >
                Synthesise
                <Sparkles size={14} className="text-teal-bright" />
              </button>
            </form>

            {/* Active filter rail */}
            <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60 overflow-x-auto">
              <span className="text-[10px] mono-stat text-ink/45 shrink-0">
                ACTIVE
              </span>

              {chips.length === 0 && (
                <span className="text-ink/40 shrink-0">No filters applied</span>
              )}

              {chips.map((chip) => (
                <div
                  key={chip.key}
                  className={`flex items-center gap-1 px-2.5 h-7 rounded-full shrink-0 ${
                    chip.emphasized
                      ? "bg-ink text-paper"
                      : "border border-teal-deep/30 bg-teal-deep/8"
                  }`}
                >
                  <span className={chip.emphasized ? "" : "text-ink-soft"}>
                    {chip.label}
                  </span>
                  <button
                    onClick={chip.onRemove}
                    className={`ml-1 w-4 h-4 rounded-full inline-flex items-center justify-center ${
                      chip.emphasized ? "hover:bg-paper/15" : "hover:bg-ink/10"
                    }`}
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X size={11} className={chip.emphasized ? "text-paper/60" : "text-ink/50"} />
                  </button>
                </div>
              ))}

              <button className="shrink-0 text-[11px] text-teal-deep font-medium hover:underline px-2 h-7 inline-flex items-center gap-1">
                <Plus size={12} />
                Add filter
              </button>

              <div className="ml-auto shrink-0 flex items-center gap-2 pl-3 border-l border-ink/10 text-ink/55">
                <span className="mono-stat text-ink/45">N</span>
                <span className="tnum font-semibold text-ink-soft">
                  {resultCount.toLocaleString()}
                </span>
                <span>papers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
