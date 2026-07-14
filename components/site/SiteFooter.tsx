import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="relative py-16 md:py-20 border-t border-ink/10 bg-paper-warm">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-10 md:gap-12 mb-14">
          {/* Logo + tagline */}
          <div className="col-span-12 md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-9 h-9 rounded-[10px] flex items-center justify-center overflow-hidden bg-ink">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
                <span className="text-paper text-xl font-medium tracking-tight relative serif">C</span>
                <div className="absolute w-1 h-1 rounded-full bottom-1.5 right-1.5 bg-teal-bright" />
              </div>
              <span className="text-xl font-medium tracking-tight serif text-ink">Claritas</span>
            </Link>
            <p className="text-[15px] leading-[1.55] max-w-[300px] mb-6 serif-body text-ink-soft">
              AI-assisted summaries and source-linked tools for reviewing open-access research.
            </p>
            <div className="mono-stat text-ink/45">CLOSED BETA · ENGLISH</div>
          </div>

          {/* Product */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">PRODUCT</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><Link href="/search" className="hover:text-teal-deep transition-colors">Search &amp; discovery</Link></li>
              <li><Link href="/paper" className="hover:text-teal-deep transition-colors">Paper detail view</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-deep transition-colors">Saved papers</Link></li>
              <li><Link href="/account" className="hover:text-teal-deep transition-colors">Account</Link></li>
              <li><Link href="/pricing" className="hover:text-teal-deep transition-colors">Beta access</Link></li>
            </ul>
          </div>

          {/* Evidence */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">EVIDENCE</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><Link href="/#methodology" className="hover:text-teal-deep transition-colors">Methodology</Link></li>
              <li><Link href="/#evidence-engine" className="hover:text-teal-deep transition-colors">The four AI agents</Link></li>
              <li><span>Model self-check, not peer review</span></li>
              <li><span>Source: PubMed Central</span></li>
            </ul>
          </div>
        

          {/* Institutional */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">INSTITUTIONAL</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><span>Institutional pilots are planned</span></li>
              <li><span>SSO and seat management are not yet available</span></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">COMPANY</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><span>Closed beta</span></li>
              <li><Link href="/research-survey" className="hover:text-teal-deep transition-colors">Research workflow survey</Link></li>
              <li><Link href="/feedback" className="hover:text-teal-deep transition-colors">Product feedback</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-deep transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-deep transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] mono-stat text-ink/55">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
            <span>&copy; 2026 CLARITAS</span>
            <Link href="/privacy" className="hover:text-teal-deep transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-teal-deep transition-colors">TERMS</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-ink" />
              BETA SERVICE
            </span>
            <span>&middot;</span>
            <span>CLOSED BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
