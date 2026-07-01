"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Search & discovery", href: "/search" },
    { label: "Paper detail view", href: "/paper" },
    { label: "CME module", href: "/cme" },
    { label: "Physician dashboard", href: "/dashboard" },
    { label: "Hospital admin portal", href: "/admin" },
    { label: "Mobile (iOS / Android)", href: "/mobile" },
  ],
  evidence: [
    { label: "Methodology", href: "/methodology" },
    { label: "The six agents", href: "#evidence" },
    { label: "HITL review process", href: "/hitl" },
    { label: "GRADE framework", href: "/grade" },
    { label: "Corpus sources (17)", href: "/sources" },
  ],
  institutional: [
    { label: "Contact sales", href: "/contact" },
    { label: "SSO (SAML / OIDC)", href: "/sso" },
    { label: "Billing & seats", href: "/billing" },
    { label: "Bulk export API", href: "/api" },
    { label: "Uptime & SLAs", href: "/uptime" },
  ],
  company: [
    { label: "Mission", href: "/about" },
    { label: "Clinical team", href: "/team" },
    { label: "Careers · 7 open", href: "/careers" },
    { label: "Press & papers", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative py-16 md:py-20 bg-paper-warm border-t border-ink/10">
      <div className="max-w-[1380px] mx-auto px-6">
        {/* Top */}
        <div className="grid grid-cols-12 gap-10 md:gap-12 mb-14">
          <div className="col-span-12 md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent"></div>
                <span className="font-serif text-paper text-xl font-medium tracking-tight relative">C</span>
                <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5"></div>
              </div>
              <span className="font-serif text-xl font-medium tracking-tight">Claritas</span>
            </Link>
            <p className="serif-body text-[15px] text-ink-soft leading-[1.55] max-w-[300px] mb-6">
              Clinical literature, finally understood — and the physicians who read it, finally on
              time.
            </p>
            <div className="flex gap-1.5 text-[10.5px] mono-stat">
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center text-ink-soft">
                RTL · EN / ع
              </span>
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center gap-1 text-ink-soft">
                <iconify-icon icon="lucide:sun" className="text-[12px]"></iconify-icon>
                <iconify-icon icon="lucide:moon" className="text-[12px]"></iconify-icon>
                DARK MODE
              </span>
            </div>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mono-stat text-ink/45 mb-4">PRODUCT</div>
            <ul className="space-y-2.5 text-[13px]">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-soft hover:text-teal-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mono-stat text-ink/45 mb-4">EVIDENCE</div>
            <ul className="space-y-2.5 text-[13px]">
              {footerLinks.evidence.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-soft hover:text-teal-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mono-stat text-ink/45 mb-4">INSTITUTIONAL</div>
            <ul className="space-y-2.5 text-[13px]">
              {footerLinks.institutional.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-soft hover:text-teal-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mono-stat text-ink/45 mb-4">COMPANY</div>
            <ul className="space-y-2.5 text-[13px]">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-soft hover:text-teal-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] mono-stat text-ink/55">
          <div className="flex items-center gap-4">
            <span>© 2024 CLARITAS MEDICAL, INC.</span>
            <Link href="/privacy" className="hover:text-teal-deep">PRIVACY</Link>
            <Link href="/terms" className="hover:text-teal-deep">TERMS</Link>
            <Link href="/hcp-license" className="hover:text-teal-deep">HCP LICENSE</Link>
            <Link href="/phi-policy" className="hover:text-teal-deep">PHI POLICY</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-deep cursor-blink"></span>
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
