import Link from "next/link";
import { Sun, Moon } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Search & discovery", href: "/search" },
      { label: "Paper detail view", href: "/paper/1" },
      { label: "CME module", href: "#cme" },
      { label: "Physician dashboard", href: "#" },
      { label: "Hospital admin portal", href: "#admin" },
      { label: "Mobile (iOS / Android)", href: "#mobile" },
    ],
  },
  {
    title: "Evidence",
    links: [
      { label: "Methodology", href: "#methodology" },
      { label: "The six agents", href: "#agents" },
      { label: "HITL review process", href: "#review" },
      { label: "GRADE framework", href: "#grade" },
      { label: "Corpus sources (17)", href: "#sources" },
    ],
  },
  {
    title: "Institutional",
    links: [
      { label: "Contact sales", href: "#sales" },
      { label: "SSO (SAML / OIDC)", href: "#sso" },
      { label: "Billing & seats", href: "/settings" },
      { label: "Bulk export API", href: "#bulk-api" },
      { label: "Uptime & SLAs", href: "#uptime" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Mission", href: "#mission" },
      { label: "Clinical team", href: "#team" },
      { label: "Careers · 7 open", href: "#careers" },
      { label: "Press & papers", href: "#press" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative py-16 md:py-20 border-t border-ink/10 bg-paper-warm">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-10 md:gap-12 mb-14">
          <div className="col-span-12 md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
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
            <p className="serif-body text-[15px] leading-[1.55] max-w-[300px] mb-6 text-ink-soft">
              Clinical literature, finally understood — and the physicians who
              read it, finally on time.
            </p>
            <div className="flex gap-1.5 mono-stat">
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center text-ink-soft">
                RTL · EN / ع
              </span>
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center gap-1 text-ink-soft">
                <Sun size={12} />
                <Moon size={12} />
                DARK MODE
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="col-span-6 md:col-span-2">
              <div className="text-[10px] mb-4 mono-stat text-ink/45">
                {col.title.toUpperCase()}
              </div>
              <ul className="space-y-2.5 text-[13px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-ink-soft hover:text-teal-deep transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] mono-stat text-ink/55">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
            <span>© 2024 CLARITAS MEDICAL, INC.</span>
            <Link href="#privacy" className="hover:text-teal-deep transition-colors">
              PRIVACY
            </Link>
            <Link href="#terms" className="hover:text-teal-deep transition-colors">
              TERMS
            </Link>
            <Link href="#hcp-license" className="hover:text-teal-deep transition-colors">
              HCP LICENSE
            </Link>
            <Link href="#phi-policy" className="hover:text-teal-deep transition-colors">
              PHI POLICY
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-deep animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </span>
            <span>·</span>
            <span>v0.9.4 · BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
