"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("semaglutide cardiovascular outcomes 2024");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching:", searchQuery);
  };

  return (
    <section id="how-it-works" className="relative pt-12 lg:pt-16 pb-20">
      {/* Atmospheric layers */}
      <div className="absolute inset-0 grid-bg pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-[640px] halo pointer-events-none"></div>

      <div className="max-w-[1380px] mx-auto px-6 relative">
        {/* Eyebrow */}
        <div className="fade-up flex justify-center mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink/12 bg-paper/80 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink"></span>
              <span className="mono-stat">Live</span>
            </span>
            <span className="text-ink/30">—</span>
            <span className="text-[11.5px] text-ink-soft">
              Evidence Engine v0.9 · 6 agents · 1.2M papers processed this month
            </span>
          </div>
        </div>

        {/* Hero headline */}
        <div className="fade-up delay-1 text-center max-w-[1100px] mx-auto">
          <h1 className="display text-[56px] md:text-[80px] lg:text-[112px] tracking-[-0.03em]">
            Medical literature,
            <br />
            <span className="relative inline-block">
              finally <span className="italic text-teal">understood</span>.
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="10"
                viewBox="0 0 600 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q 150 1, 300 5 T 598 4"
                  stroke="#0d9488"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
        </div>

        {/* Subhead */}
        <div className="fade-up delay-2 mt-7 text-center max-w-[620px] mx-auto">
          <p className="serif-body text-[18px] md:text-[20px] text-ink-soft leading-[1.5]">
            Six specialised agents read every trial, review, and case report — and return a PICO
            summary, mind map, infographic, and clinical bottom line in under twelve seconds.
          </p>
        </div>

        {/* Search bar */}
        <div className="fade-up delay-3 mt-10 max-w-[760px] mx-auto">
          <form onSubmit={handleSearch} className="relative">
            {/* Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-bright/40 via-teal-deep/30 to-teal-bright/30 blur-2xl opacity-50 rounded-[26px]"></div>

            {/* Input shell */}
            <div className="relative bg-paper border border-ink/15 rounded-[22px] shadow-[0_30px_70px_-30px_rgba(11,29,42,0.35),0_2px_8px_-4px_rgba(11,29,42,0.1)] overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 pl-5 pr-3 py-3.5">
                <iconify-icon icon="lucide:search" className="text-[20px] text-teal shrink-0"></iconify-icon>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[15.5px] placeholder:text-ink/35"
                  placeholder="Search 50M+ medical papers, understood in seconds"
                />
                <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">
                  ⌘K
                </span>
                <button
                  type="submit"
                  className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5"
                >
                  Synthesise
                  <iconify-icon icon="lucide:sparkles" className="text-[14px] text-teal-bright"></iconify-icon>
                </button>
              </div>

              {/* Filter rail */}
              <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60">
                <div className="flex items-center gap-1 px-2.5 h-7 rounded-full border border-ink/12 hover-tint cursor-pointer">
                  <iconify-icon icon="lucide:stethoscope" className="text-[12px] text-teal"></iconify-icon>
                  <span>Cardiology</span>
                  <iconify-icon icon="lucide:chevron-down" className="text-[11px] text-ink/40"></iconify-icon>
                </div>
                <div className="flex items-center gap-1 px-2.5 h-7 rounded-full border border-ink/12 hover-tint cursor-pointer">
                  <span>Systematic review</span>
                  <iconify-icon icon="lucide:chevron-down" className="text-[11px] text-ink/40"></iconify-icon>
                </div>
                <div className="flex items-center gap-1 px-2.5 h-7 rounded-full border border-ink/12 hover-tint cursor-pointer">
                  <span>2022 — 2024</span>
                  <iconify-icon icon="lucide:chevron-down" className="text-[11px] text-ink/40"></iconify-icon>
                </div>
                <div className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-ink text-paper">
                  <span>Level I ≥</span>
                  <iconify-icon icon="lucide:chevron-down" className="text-[11px] text-paper/60"></iconify-icon>
                </div>
                <div className="ml-auto hidden md:flex items-center gap-1.5 text-ink/55">
                  <span className="mono-stat text-ink/45">N</span>
                  <span className="font-medium text-ink-soft" style={{ fontVariantNumeric: "tabular-nums" }}>
                    1,847
                  </span>
                  <span>papers ·</span>
                  <button type="button" className="text-teal font-medium hover:underline">
                    filters ▾
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Hero CTAs */}
        <div className="fade-up delay-4 mt-7 flex flex-col md:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="btn-primary inline-flex items-center justify-center gap-2 px-6 h-12 bg-ink text-paper rounded-[14px] text-[14px] font-semibold w-full md:w-auto"
          >
            Sign up — free for physicians
            <iconify-icon icon="lucide:arrow-right" className="text-[15px]"></iconify-icon>
          </Link>
          <Link
            href="/paper/demo"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-paper border border-ink/15 text-ink rounded-[14px] text-[14px] font-semibold hover-tint w-full md:w-auto"
          >
            <iconify-icon icon="lucide:play" className="text-[14px] text-teal"></iconify-icon>
            Try a paper — no signup
          </Link>
        </div>

        <div className="fade-up delay-5 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] text-ink/55">
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:check" className="text-teal text-[13px]"></iconify-icon>
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:check" className="text-teal text-[13px]"></iconify-icon>
            First 5 papers free, every month
          </span>
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:check" className="text-teal text-[13px]"></iconify-icon>
            Physician-verified before publication
          </span>
        </div>
      </div>
    </section>
  );
}
