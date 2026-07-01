"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-[6px] sticky top-0">
      <div className="max-w-[1380px] mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent"></div>
            <span className="font-serif text-paper text-xl font-medium tracking-tight relative">C</span>
            <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5"></div>
          </div>
          <span className="font-serif text-xl font-medium tracking-tight">Claritas</span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          <Link href="#how-it-works" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            How it works
          </Link>
          <Link href="#evidence" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            Evidence Engine
          </Link>
          <Link href="#proof" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            For institutions
          </Link>
          <Link href="#pricing" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            Pricing
          </Link>
          <Link href="#" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            CME credits
          </Link>
          <Link href="#" className="px-3 py-2 rounded-md text-ink-soft hover-tint">
            Docs
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language dropdown */}
          <div
            className="dropdown-wrap relative"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              className="flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover-tint"
              aria-haspopup="true"
              aria-expanded={langOpen}
            >
              <iconify-icon icon="lucide:globe" className="text-[14px] text-teal"></iconify-icon>
              <span>EN</span>
              <span className="text-ink/30">·</span>
              <span className="text-ink/55">ع</span>
              <iconify-icon icon="lucide:chevron-down" className="text-[13px] text-ink/40"></iconify-icon>
            </button>
            {langOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-56 bg-paper border border-ink/15 rounded-xl shadow-[0_20px_50px_-12px_rgba(11,29,42,0.22)] p-1.5 z-50">
                <div className="px-2 py-1.5 text-[10px] mono-stat text-ink/45">INTERFACE LANGUAGE</div>
                <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover-tint bg-ink/[0.04]">
                  <span className="flex items-center gap-2.5 text-[13px] font-medium">
                    <span className="text-base">EN</span>
                    <span>English</span>
                  </span>
                  <iconify-icon icon="lucide:check" className="text-teal text-[14px]"></iconify-icon>
                </button>
                <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover-tint">
                  <span className="flex items-center gap-2.5 text-[13px] font-medium">
                    <span className="text-base">ع</span>
                    <span>العربية · Arabic (RTL)</span>
                  </span>
                </button>
                <div className="h-px bg-ink/8 my-1.5"></div>
                <div className="px-2 py-1.5 text-[10px] mono-stat text-ink/45">SEARCH CONTENT</div>
                <label className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover-tint cursor-pointer text-[12.5px]">
                  <input type="checkbox" defaultChecked className="accent-teal-deep w-3.5 h-3.5" />
                  <span>English corpus</span>
                </label>
                <label className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover-tint cursor-pointer text-[12.5px]">
                  <input type="checkbox" defaultChecked className="accent-teal-deep w-3.5 h-3.5" />
                  <span>Arabic abstracts</span>
                </label>
              </div>
            )}
          </div>

          {/* Sign in */}
          <Link
            href="/auth/signin"
            className="hidden md:inline-flex items-center px-3 h-9 rounded-md text-[12.5px] font-medium hover-tint"
          >
            Sign in
          </Link>

          {/* Try Free */}
          <Link
            href="/auth/signup"
            className="btn-primary inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold"
          >
            Try Free
            <iconify-icon icon="lucide:arrow-right" className="text-[14px]"></iconify-icon>
          </Link>
        </div>
      </div>
    </header>
  );
}
