import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Pricing · Claritas',
  description: 'Simple pricing for physicians. 14-day free trial, no credit card required.',
};

const PLANS = [
  {
    name: 'Free',
    tier: 'ALWAYS FREE',
    price: '$0',
    period: '/ mo',
    description: 'For occasional readers who want a taste of AI-synthesised evidence.',
    features: [
      '5 syntheses / month',
      'TLDR + infographic panes',
      'Basic search',
      'Email digest (monthly)',
    ],
    cta: 'Start free',
    ctaStyle: 'border border-ink/15 text-ink hover-tint',
    highlight: false,
  },
  {
    name: 'Professional',
    tier: 'PRACTISING MD',
    price: '$19',
    period: '/ mo',
    description: 'Full access for practising physicians who need evidence daily.',
    features: [
      'All six agents, unlimited',
      'Mind map & critical appraisal',
      'Semantic search across the corpus',
      'Advanced filters & saved searches',
      'Priority synthesis queue',
    ],
    cta: 'Start 14-day trial',
    ctaStyle: 'bg-ink text-paper btn-primary',
    highlight: true,
    badge: 'MOST CHOSEN',
  },
  {
    name: 'Research Pro',
    tier: 'FELLOW · ACADEMIC',
    price: '$39',
    period: '/ mo',
    description: 'For researchers and fellows running systematic reviews.',
    features: [
      'Everything in Professional',
      'PRISMA flow diagram export',
      'Bulk synthesis (up to 50 papers)',
      '5 collaborator seats',
      'RIS / BibTeX / EndNote export',
      'API access (beta)',
    ],
    cta: 'Start 14-day trial',
    ctaStyle: 'bg-teal-deep text-paper btn-primary',
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
            <div className="mono-stat text-teal-deep mb-3">PRICING</div>
            <h1 className="display text-[44px] md:text-[64px] tracking-tight mb-4">
              Simple pricing for
              <br />
              <span className="italic text-teal">practising physicians.</span>
            </h1>
            <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.55] max-w-[520px] mx-auto">
              Every plan starts with a 14-day free trial. No credit card required.
              Cancel any time — your data stays yours.
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
              Hospital-wide access<span className="italic text-teal">.</span>
            </h2>
            <p className="text-[14px] text-ink-soft leading-[1.55] max-w-[480px] mx-auto mb-6">
              SSO (SAML/OIDC), centralised billing, usage analytics, and dedicated onboarding
              for departments of 10 to 10,000 physicians.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[14px] bg-teal-deep text-paper text-[13px] font-semibold btn-primary"
            >
              Contact sales
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
                  q: 'Can I switch plans later?',
                  a: 'Yes — upgrade or downgrade any time. Changes take effect immediately with pro-rated billing.',
                },
                {
                  q: 'What happens after the 14-day trial?',
                  a: "You'll be prompted to choose a plan and add payment. If you don't, your account switches to the Free tier — no data is lost.",
                },
                {
                  q: 'Are these summaries reviewed by a clinician?',
                  a: 'No. Every summary is generated by AI and automatically checked against the source paper; no clinician reviews them before publication. Treat them as a way into the literature, not a replacement for reading it.',
                },
                {
                  q: 'Do you offer student or residency discounts?',
                  a: 'Yes — 40% off Professional for verified medical students and residents. Contact us with your institutional email.',
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
