import Icon from '../ui/Icon';

export default function SiteFooter() {
  return (
    <footer className="relative py-16 md:py-20 border-t border-ink/10 bg-paper-warm">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-10 md:gap-12 mb-14">
          {/* Logo + tagline */}
          <div className="col-span-12 md:col-span-4">
            <a href="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-9 h-9 rounded-[10px] flex items-center justify-center overflow-hidden bg-ink">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
                <span className="text-paper text-xl font-medium tracking-tight relative serif">C</span>
                <div className="absolute w-1 h-1 rounded-full bottom-1.5 right-1.5 bg-teal-bright" />
              </div>
              <span className="text-xl font-medium tracking-tight serif text-ink">Claritas</span>
            </a>
            <p className="text-[15px] leading-[1.55] max-w-[300px] mb-6 serif-body text-ink-soft">
              Clinical literature, finally understood &mdash; and the physicians who read it, finally on time.
            </p>
            <div className="flex gap-1.5 mono-stat">
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center text-ink-soft">
                RTL &middot; EN / AR
              </span>
              <span className="px-2 h-7 rounded-md border border-ink/15 inline-flex items-center gap-1 text-ink-soft">
                <Icon icon="lucide:sun" className="text-[12px]" />
                <Icon icon="lucide:moon" className="text-[12px]" />
                DARK MODE
              </span>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">PRODUCT</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><a href="/search" className="hover:text-teal-deep transition-colors">Search &amp; discovery</a></li>
              <li><a href="/paper" className="hover:text-teal-deep transition-colors">Paper detail view</a></li>
              <li><a href="/account#cme" className="hover:text-teal-deep transition-colors">CME module</a></li>
              <li><a href="/account" className="hover:text-teal-deep transition-colors">Physician dashboard</a></li>
              <li><a href="/hospital-admin" className="hover:text-teal-deep transition-colors">Hospital admin portal</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="/mobile" className="hover:text-teal-deep transition-colors">Mobile (iOS / Android)</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
            </ul>
          </div>

          {/* Evidence */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">EVIDENCE</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><a href="/#methodology" className="hover:text-teal-deep transition-colors">Methodology</a></li>
              <li><a href="/#six-agents" className="hover:text-teal-deep transition-colors">The six agents</a></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">HITL review process</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">GRADE framework</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Corpus sources (17)</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
            </ul>
          </div>
        

          {/* Institutional */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">INSTITUTIONAL</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><a href="#" className="hover:text-teal-deep transition-colors">Contact sales</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">SSO (SAML / OIDC)</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Billing &amp; seats</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Bulk export API</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Uptime &amp; SLAs</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-6 md:col-span-2">
            <div className="text-[10px] mb-4 mono-stat text-ink/45">COMPANY</div>
            <ul className="space-y-2.5 text-[13px] text-ink-soft">
              <li><a href="#" className="hover:text-teal-deep transition-colors">Mission</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Clinical team</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Careers &middot; 7 open</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Press &amp; papers</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
              <li><a href="#" className="hover:text-teal-deep transition-colors">Contact</a> <span className="text-[10px] text-teal-deep">(soon)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-ink/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] mono-stat text-ink/55">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
            <span>&copy; 2026 CLARITAS MEDICAL, INC.</span>
            <a href="#" className="hover:text-teal-deep transition-colors">PRIVACY</a> <span className="text-[10px] text-teal-deep">(soon)</span>
            <a href="#" className="hover:text-teal-deep transition-colors">TERMS</a> <span className="text-[10px] text-teal-deep">(soon)</span>
            <a href="#" className="hover:text-teal-deep transition-colors">HCP LICENSE</a> <span className="text-[10px] text-teal-deep">(soon)</span>
            <a href="#" className="hover:text-teal-deep transition-colors">PHI POLICY</a> <span className="text-[10px] text-teal-deep">(soon)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </span>
            <span>&middot;</span>
            <span>v0.9.4 &middot; BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
