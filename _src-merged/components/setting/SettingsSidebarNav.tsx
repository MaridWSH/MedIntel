"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Award,
  SlidersHorizontal,
  Lock,
  User,
  HelpCircle,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { SETTINGS_TABS } from "@/lib/settings-data";

const ICONS: Record<string, LucideIcon> = {
  "credit-card": CreditCard,
  award: Award,
  "sliders-horizontal": SlidersHorizontal,
  lock: Lock,
  user: User,
};

export default function SettingsSidebarNav() {
  const [activeId, setActiveId] = useState(SETTINGS_TABS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = SETTINGS_TABS.map((tab) =>
      document.getElementById(tab.id)
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <aside className="col-span-12 md:col-span-3 lg:col-span-3">
      <nav className="md:sticky md:top-[88px] flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        <div className="text-[10px] mono-stat text-ink/40 mb-1 px-2 hidden md:block">
          SECTIONS
        </div>

        {SETTINGS_TABS.map((tab) => {
          const Icon = ICONS[tab.icon];
          const active = activeId === tab.id;
          return (
            <Link
              key={tab.id}
              href={`#${tab.id}`}
              className={`flex items-center gap-2.5 px-3 h-10 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors duration-150 ${
                active
                  ? "bg-teal-deep/10 text-teal-deep"
                  : "text-ink-soft hover:bg-ink/5"
              }`}
            >
              {Icon && (
                <Icon
                  size={15}
                  className={active ? "text-teal-deep" : "text-ink/50"}
                />
              )}
              {tab.label}
              {tab.badge && (
                <span className="ml-auto px-1.5 h-5 rounded text-[9px] mono-stat bg-teal-deep/12 text-teal-deep inline-flex items-center">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="hidden md:block mt-6 pt-5 border-t border-ink/10 px-2">
          <div className="text-[10px] mono-stat text-ink/40 mb-3">SUPPORT</div>
          <Link
            href="#"
            className="flex items-center gap-2 text-[12px] text-ink-soft hover:text-teal-deep transition-colors px-2 py-1.5 rounded-md hover:bg-ink/5"
          >
            <HelpCircle size={14} />
            Talk to a physician
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-[12px] text-ink-soft hover:text-teal-deep transition-colors px-2 py-1.5 rounded-md hover:bg-ink/5"
          >
            <BookOpen size={14} />
            Documentation
          </Link>
        </div>
      </nav>
    </aside>
  );
}
