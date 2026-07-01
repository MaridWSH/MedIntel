"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    audience: "PHYSICIAN",
    description: "For self-directed CME, between rounds.",
    priceMonthly: 0,
    priceAnnual: 0,
    priceSuffix: "/ month",
    annualNote: "FOREVER · NO CARD REQUIRED",
    features: [
      { text: "5 full synthesis credits / month", included: true },
      { text: "Unlimited search across 50M+ corpus", included: true },
      { text: "TLDR + infographic + citation export", included: true },
      { text: "Mind map & critical appraisal", included: false },
      { text: "CME credit tracking", included: false },
    ],
    cta: "Sign up free",
    ctaLink: "/auth/signup",
    highlighted: false,
  },
  {
    name: "Professional",
    audience: "PRACTISING MD",
    description: "All six agents, no monthly gate.",
    priceMonthly: 24,
    priceAnnual: 19,
    priceSuffix: "/ month",
    annualNote: "BILLED ANNUALLY · $152 / YEAR",
    monthlyNote: "BILLED MONTHLY",
    strikethrough: "$190/yr",
    features: [
      { text: "Unlimited full syntheses", included: true },
      { text: "All six agents — mind map, critical appraisal, clinical relevance", included: true },
      { text: "Infographic downloads (PNG / SVG / PDF)", included: true },
      { text: "Saved paper library, organised by specialty", included: true },
      { text: "Daily or weekly email digests", included: true },
    ],
    cta: "Start 14-day Pro trial",
    ctaLink: "/auth/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Research Pro",
    audience: "FELLOW · ACADEMIC",
    description: "For fellows, paper-writers, and review teams.",
    priceMonthly: 49,
    priceAnnual: 39,
    priceSuffix: "/ month",
    annualNote: "BILLED ANNUALLY · $304 / YEAR",
    monthlyNote: "BILLED MONTHLY",
    strikethrough: "$390/yr",
    features: [
      { text: "Everything in Professional", included: true },
      { text: "Bulk export (CSV / JSON / PDF bundles)", included: true },
      { text: "Systematic review corpus builder", included: true },
      { text: "PRISMA flow diagram export", included: true },
      { text: "5 collaborator seats included", included: true },
    ],
    cta: "Start research trial",
    ctaLink: "/auth/signup?plan=research",
    highlighted: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-20 md:py-28 border-t border-ink/10">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-8 mb-10">
          <div className="col-span-12 md:col-span-5">
            <div className="text-[10.5px] mono-stat text-teal-deep mb-5">§ 04 · PRICING</div>
            <h2 className="display text-[44px] md:text-[64px] tracking-tight">
              Less than a single
              <br />
              journal subscription.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-7 md:pt-12">
            <p className="serif-body text-[18px] md:text-[19px] leading-[1.55] text-ink-soft max-w-[560px]">
              Every physician starts free, forever. Two paid tiers add deeper synthesis, no limits,
              and the CME bundle for credit-hour tracking. Institutional licensing lives on its own
              page.
            </p>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-12">
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex items-center w-[60px] h-[34px] rounded-full px-1 cursor-pointer transition-colors duration-200 ${
              isAnnual ? "bg-teal-deep" : "bg-ink/15"
            }`}
            role="switch"
            aria-checked={isAnnual}
            aria-label="Toggle annual billing"
          >
            <span
              className={`w-[28px] h-[28px] rounded-full bg-paper shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isAnnual ? "translate-x-[24px]" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex flex-col ml-4">
            <div className="flex items-center gap-3 text-[13px]">
              <span className={`font-medium cursor-pointer ${!isAnnual ? "text-teal-deep" : "text-ink-soft"}`}>
                Monthly
              </span>
              <span className={`font-medium cursor-pointer ${isAnnual ? "text-teal-deep" : "text-ink-soft"}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="px-1.5 h-5 rounded text-[9.5px] mono-stat bg-teal-deep/12 text-teal-deep inline-flex items-center">
                  –20% · 4 months free
                </span>
              )}
            </div>
            <div className="text-[10.5px] mono-stat text-ink/45 mt-1">SWITCH ANY TIME · PRO-RATA REFUND</div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl p-7 md:p-8 flex flex-col ${
                plan.highlighted
                  ? "relative bg-ink text-paper shadow-[0_40px_80px_-30px_rgba(11,29,42,0.55)]"
                  : "bg-paper border border-ink/15"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 h-7 rounded-full bg-teal-bright text-ink text-[10.5px] mono-stat font-semibold inline-flex items-center">
                  MOST CHOSEN
                </div>
              )}

              <div className="flex items-baseline justify-between mb-2">
                <h3 className={`font-serif text-[28px] tracking-tight ${plan.highlighted ? "text-paper" : ""}`}>
                  {plan.name}
                </h3>
                <span className={`text-[10px] mono-stat ${plan.highlighted ? "text-paper/55" : "text-ink/50"}`}>
                  {plan.audience}
                </span>
              </div>
              <p className={`text-[13px] leading-[1.5] mb-6 ${plan.highlighted ? "text-paper/70" : "text-ink-soft"}`}>
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className={`font-serif text-[52px] leading-none tracking-tight ${plan.highlighted ? "text-paper" : ""}`}>
                  ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className={`text-[12.5px] ${plan.highlighted ? "text-paper/55" : "text-ink/55"}`}>
                  {plan.priceSuffix}
                </span>
                {plan.strikethrough && isAnnual && (
                  <span className={`font-serif text-[14px] line-through ml-2 ${plan.highlighted ? "text-paper/40" : "text-ink/40"}`}>
                    {plan.strikethrough}
                  </span>
                )}
              </div>
              <div className={`text-[10.5px] mono-stat mb-6 ${plan.highlighted ? "text-teal-bright" : "text-teal-deep"}`}>
                {isAnnual ? plan.annualNote : (plan.monthlyNote || plan.annualNote)}
              </div>

              <ul className={`space-y-2.5 text-[13px] flex-1 ${plan.highlighted ? "text-paper/85" : "text-ink-soft"}`}>
                {plan.features.map((feature) => (
                  <li key={feature.text} className={`flex items-start gap-2.5 ${!feature.included ? "text-ink/45" : ""}`}>
                    <iconify-icon
                      icon={feature.included ? "lucide:check" : "lucide:x"}
                      className={`text-[15px] mt-0.5 ${
                        feature.included
                          ? plan.highlighted
                            ? "text-teal-bright"
                            : "text-teal"
                          : ""
                      }`}
                    ></iconify-icon>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaLink}
                className={`mt-7 inline-flex items-center justify-center gap-2 h-12 rounded-[14px] text-[14px] font-semibold ${
                  plan.highlighted
                    ? "btn-primary bg-teal-bright text-ink"
                    : "border border-ink/15 text-ink hover-tint"
                }`}
              >
                {plan.cta}
                <iconify-icon icon="lucide:arrow-right" className="text-[15px]"></iconify-icon>
              </Link>
            </article>
          ))}
        </div>

        {/* CME bundle + Institutional CTA */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* CME add-on */}
          <article className="md:col-span-7 bg-paper-warm border border-ink/15 rounded-3xl p-7 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 h-6 rounded-md bg-teal-deep/12 border border-teal-deep/25 text-teal-deep text-[9.5px] mono-stat font-semibold inline-flex items-center">
                  ADD-ON
                </span>
                <span className="text-[10.5px] mono-stat text-ink/45">FROM $9 / MONTH</span>
              </div>
              <h3 className="font-serif text-[26px] md:text-[30px] tracking-tight mb-2">CME bundle</h3>
              <p className="text-[13px] text-ink-soft leading-[1.55] max-w-[460px]">
                Auto-graded quizzes per paper. Track credit hours by specialty track. Certificates
                co-branded with the Egyptian Medical Syndicate and the Arab Board. One bundle covers
                every physician in your account.
              </p>
            </div>
            <div className="md:w-[180px] shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
                <defs>
                  <linearGradient id="cert" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6f3ea" />
                    <stop offset="100%" stopColor="#ede5d3" />
                  </linearGradient>
                </defs>
                <rect x="6" y="6" width="188" height="98" rx="6" fill="url(#cert)" stroke="#0b1d2a" strokeWidth="1.5" />
                <rect x="14" y="14" width="172" height="82" rx="3" fill="none" stroke="#0b1d2a" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x="100" y="34" textAnchor="middle" fontFamily="Zodiak, serif" fontSize="14" fontWeight="500" fill="#0b1d2a">Certificate of Credit</text>
                <line x1="40" y1="44" x2="160" y2="44" stroke="#0b1d2a" strokeWidth="0.5" />
                <text x="100" y="60" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="6" fill="#5a6b78" letterSpacing="0.5">0.5 HOURS · CARDIOLOGY TRACK</text>
                <circle cx="100" cy="82" r="10" fill="#0d9488" />
                <path d="M95 82 L98.5 85 L105 78" stroke="#0b1d2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="30" cy="82" r="6" fill="none" stroke="#0b1d2a" strokeWidth="0.8" />
                <circle cx="170" cy="82" r="6" fill="none" stroke="#0b1d2a" strokeWidth="0.8" />
              </svg>
            </div>
          </article>

          {/* Institutional CTA */}
          <article className="md:col-span-5 bg-ink text-paper rounded-3xl p-7 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10.5px] mono-stat text-teal-bright mb-3">FOR HOSPITALS & RESIDENCY PROGRAMS</span>
              <h3 className="font-serif text-[24px] md:text-[28px] tracking-tight text-paper mt-3">
                Hospital & department licensing
              </h3>
              <p className="text-[13px] text-paper/70 leading-[1.55] mt-3">
                Seat management, per-department analytics, SSO (SAML / OIDC), and bulk export
                controls. Custom pricing by FTE.
              </p>
            </div>
            <Link
              href="/contact"
              className="btn-primary mt-6 inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-teal-bright text-ink text-[13px] font-semibold"
            >
              Contact sales
              <iconify-icon icon="lucide:arrow-right" className="text-[14px]"></iconify-icon>
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
