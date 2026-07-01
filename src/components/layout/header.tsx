"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Check,
  Globe,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "how", label: "How it works", href: "/search#how-it-works" },
  { id: "evidence", label: "Evidence Engine", href: "/search" },
  { id: "institutions", label: "For institutions", href: "/search#proof" },
  { id: "pricing", label: "Pricing", href: "/search#pricing" },
  { id: "cme", label: "CME credits", href: "/search#cme" },
  { id: "docs", label: "Docs", href: "/search#docs" },
];

type Lang = "EN" | "AR";

export default function Header() {
  const [activeItem] = useState("evidence");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Lang>("EN");
  const [searchEnglish, setSearchEnglish] = useState(true);
  const [searchArabic, setSearchArabic] = useState(true);

  return (
    <header className="relative z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-[6px] sticky top-0">
      <div className="max-w-[1380px] mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
            <span className="text-paper text-xl font-medium tracking-tight relative font-serif">
              C
            </span>
            <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5" />
          </div>
          <span className="text-xl font-medium tracking-tight font-serif">
            Claritas
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3 py-2 rounded-md transition-all duration-200 ${
                activeItem === item.id
                  ? "text-teal font-semibold"
                  : "text-ink-soft hover:bg-ink/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
              className="flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors"
              aria-haspopup="true"
              aria-expanded={langMenuOpen}
            >
              <Globe className="text-teal" size={14} />
              <span>{currentLang}</span>
              <span className="text-ink/30">·</span>
              <span className="text-ink/55">ع</span>
              <ChevronDown className="text-ink/40" size={13} />
            </button>

            {langMenuOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-56 bg-paper border border-ink/15 rounded-xl shadow-[0_20px_50px_-12px_rgba(11,29,42,0.22)] p-1.5 z-50">
                <div className="px-2 py-1.5 text-[10px] text-ink/45 uppercase font-medium tracking-wider font-mono">
                  Interface Language
                </div>
                {(["EN", "AR"] as Lang[]).map((lang) => (
                  <button
                    key={lang}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCurrentLang(lang);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-ink/5 transition-colors ${
                      currentLang === lang ? "bg-ink/[0.04]" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-medium">
                      <span className="text-base">{lang === "EN" ? "EN" : "ع"}</span>
                      <span>{lang === "EN" ? "English" : "العربية · Arabic"}</span>
                    </span>
                    {currentLang === lang && (
                      <Check className="text-teal" size={14} />
                    )}
                  </button>
                ))}

                <div className="h-px bg-ink/10 my-1.5" />
                <div className="px-2 py-1.5 text-[10px] text-ink/45 uppercase font-medium tracking-wider font-mono">
                  Search Content
                </div>
                <label className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-ink/5 transition-colors cursor-pointer text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={searchEnglish}
                    onChange={(e) => setSearchEnglish(e.target.checked)}
                    className="accent-teal-deep w-3.5 h-3.5"
                  />
                  <span>English corpus</span>
                </label>
                <label className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-ink/5 transition-colors cursor-pointer text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={searchArabic}
                    onChange={(e) => setSearchArabic(e.target.checked)}
                    className="accent-teal-deep w-3.5 h-3.5"
                  />
                  <span>Arabic abstracts</span>
                </label>
              </div>
            )}
          </div>

          {/* Sign in */}
          <Link
            href="/signin"
            className="hidden md:inline-flex items-center px-3 h-9 rounded-md text-[12.5px] font-medium hover:bg-ink/5 transition-colors"
          >
            Sign in
          </Link>

          {/* Try Free */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            Try Free
            <ArrowRight size={14} />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-ink/15 hover:bg-ink/5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-ink/10 bg-paper px-6 py-3 flex flex-col gap-1 text-[14px]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-md ${
                activeItem === item.id
                  ? "text-teal font-semibold"
                  : "text-ink-soft hover:bg-ink/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
