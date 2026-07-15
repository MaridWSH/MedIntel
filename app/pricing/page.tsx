import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Beta access · Claritas',
  description: 'Claritas is free during closed beta. Paid plans and billing are not yet enabled.',
};

const PLANS = [
  {
    name: 'Closed Beta',
    tier: 'AVAILABLE NOW',
    price: 'Free',
    period: ' during beta',
    description: 'The complete feature set that is implemented today, with no payment details required.',
    features: [
      'Browse AI-generated paper summaries',
      'Semantic search with keyword fallback',
      'Mind map, fidelity, and source-text panes',
      'Saved-paper library',
      'Citation, BibTeX, and RIS export',
    ],
    cta: 'Create beta account',
    ctaStyle: 'bg-ink text-paper btn-primary',
    highlight: true,
    badge: 'CURRENT',
  },
  {
    name: 'Individual',
    tier: 'ROADMAP',
    price: 'Planned',
    period: '',
    description: 'A future paid plan. Pricing, limits, and launch timing have not been set.',
    features: [
      'Everything in the closed beta',
      'Saved searches and alerts are planned',
      'No billing or usage limits are active today',
    ],
    cta: 'Join beta first',
    ctaStyle: 'border border-ink/15 text-ink hover-tint',
    highlight: false,
  },
  {
    name: 'Institutional',
    tier: 'ROADMAP',
    price: 'Planned',
    period: '',
    description: 'Institutional controls are a roadmap item, not an available product tier.',
    features: [
      'SSO and seat management are planned',
      'Usage analytics and SLAs are not yet available',
      'Institutional pricing has not been set',
    ],
    cta: 'Join beta first',
    ctaStyle: 'border border-ink/15 text-ink hover-tint',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative overflow-hidden">
        {/* Atmospheric */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 65% at 50% 30%, rgba(20,184,166,0.12) 0%, rgba(246,243,234,0) 70%)',
          }}
        />

        <div className="relative max-w-[1100px] mx-auto px-6 pt-12 pb-20">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <div className="mono-stat text-teal-deep mb-3">BETA ACCESS</div>
            <h1 className="display text-[44px] md:text-[64px] tracking-tight mb-4">
              Free while we validate
              <br />
              <span className="italic text-teal">the product.</span>
            </h1>
            <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.55] max-w-[520px] mx-auto">
              Billing, subscriptions, trials, and usage limits are not implemented yet.
              Closed-beta accounts receive the currently available features at no charge.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`fade-in d-${PLANS.indexOf(plan) + 1} relative rounded-2xl p-6 transition-all ${
                  plan.highlight
                    ? 'bg-ink text-paper border border-ink shadow-[0_24px_60px_-20px_rgba(11,29,42,0.4)]'
                    : 'bg-paper border border-ink/12'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 h-6 rounded-full bg-teal-bright text-ink text-[9.5px] mono-stat font-semibold inline-flex items-center">
                    {plan.badge}
                  </div>
                )}

                <div className={`text-[9.5px] mono-stat mb-2 ${plan.highlight ? 'text-paper/55' : 'text-ink/45'}`}>
                  {plan.tier}
                </div>
                <div className={`serif text-[24px] tracking-tight mb-1 ${plan.highlight ? 'text-paper' : ''}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`serif text-[40px] leading-none tracking-tight ${plan.highlight ? 'text-paper' : ''}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[12px] ${plan.highlight ? 'text-paper/55' : 'text-ink/55'}`}>
                    {plan.period}
                  </span>
                </div>

                <p className={`text-[12.5px] leading-[1.5] mb-6 ${plan.highlight ? 'text-paper/70' : 'text-ink-soft'}`}>
                  {plan.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-[12px] ${plan.highlight ? 'text-paper/85' : 'text-ink-soft'}`}>
                      <Icon
                        icon="lucide:check"
                        className={`text-[13px] mt-0.5 shrink-0 ${plan.highlight ? 'text-teal-bright' : 'text-teal'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full h-11 rounded-[12px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${plan.ctaStyle}`}
                >
                  {plan.cta}
                  <Icon icon="lucide:arrow-right" className="text-[14px]" />
                </Link>
              </div>
            ))}
          </div>

          {/* Institutional */}
          <div className="fade-in rounded-2xl border border-ink/12 bg-paper-warm/40 p-8 md:p-10 text-center">
            <div className="mono-stat text-ink/45 mb-2">FOR INSTITUTIONS</div>
            <h2 className="serif text-[24px] md:text-[30px] tracking-tight mb-3">
              Institutional roadmap<span className="italic text-teal">.</span>
            </h2>
            <p className="text-[14px] text-ink-soft leading-[1.55] max-w-[480px] mx-auto mb-6">
              SSO, centralised billing, usage analytics, and service-level agreements are not
              available in the beta. They remain possible post-beta work, not current promises.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[14px] bg-teal-deep text-paper text-[13px] font-semibold btn-primary"
            >
              Join the beta
              <Icon icon="lucide:arrow-right" className="text-[14px]" />
            </Link>
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-[700px] mx-auto">
            <h2 className="serif text-[22px] tracking-tight text-center mb-8">
              Common questions<span className="italic text-teal">.</span>
            </h2>
            <div className="space-y-0 divide-y divide-ink/8">
              {[
                {
                  q: 'Will beta access stay free?',
                  a: 'Beta access is free today. Future pricing has not been decided; we will communicate material changes before they take effect.',
                },
                {
                  q: 'Do I need a credit card?',
                  a: 'No. Claritas does not currently collect payment details or enforce paid plans.',
                },
                {
                  q: 'Are these summaries reviewed by a clinician?',
                  a: 'No. Every summary is generated by AI and automatically checked against the source paper; no clinician reviews them before publication. Treat them as a way into the literature, not a replacement for reading it.',
                },
                {
                  q: 'Can my institution buy access?',
                  a: 'Not yet. Institutional authentication, billing, administration, and support commitments are not implemented in the beta.',
                },
              ].map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[14px] font-medium text-ink">{q}</span>
                    <Icon icon="lucide:chevron-down" className="text-[16px] text-ink/40 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-[13px] text-ink-soft leading-[1.55] mt-3 pr-8">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
