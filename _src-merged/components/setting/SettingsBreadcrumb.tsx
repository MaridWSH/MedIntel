import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SettingsBreadcrumbProps {
  section: string;
  savedNote?: string;
}

export default function SettingsBreadcrumb({
  section,
  savedNote = "SAVED TO CLARITAS CLOUD · 0.2S AGO",
}: SettingsBreadcrumbProps) {
  return (
    <div className="border-b border-ink/10 bg-paper-warm/40">
      <div className="max-w-[1280px] mx-auto px-6 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11.5px] mono-stat text-ink/55">
          <Link href="/account" className="hover:text-teal-deep">
            ACCOUNT
          </Link>
          <ChevronRight size={11} className="text-ink/30" />
          <span className="text-ink-soft font-semibold">{section}</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] mono-stat text-ink/45">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="text-teal" size={12} />
            {savedNote}
          </span>
        </div>
      </div>
    </div>
  );
}
