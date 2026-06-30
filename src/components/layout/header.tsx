"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-30 border-b border-black/10 bg-paper/95 backdrop-blur-[6px] sticky top-0">
      <div className="max-w-[1380px] mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <span className="text-paper text-xl font-medium tracking-tight font-serif">C</span>
          </div>
          <span className="text-xl font-medium tracking-tight font-serif">Claritas</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          <Link href="/#how-it-works" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5">How it works</Link>
          <Link href="/search" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5">Evidence Engine</Link>
          <Link href="/#pricing" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/signin" className="hidden md:inline-flex items-center px-3 h-9 rounded-md text-[12.5px] font-medium hover:bg-ink/5">
            Sign in
          </Link>
          <Link href="/signup" className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Try Free
          </Link>
        </div>
      </div>
    </header>
  );
}
