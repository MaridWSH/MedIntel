"use client";

const institutions = [
  {
    name: "Egyptian Medical Syndicate",
    subtitle: "عضوية نقابة الأطباء · 84,000 members",
    svg: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 text-ink">
        <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M22 24 Q30 18 38 24 L38 38 Q30 42 22 38 Z" fill="currentColor" opacity="0.85" />
        <circle cx="30" cy="30" r="3" fill="#0d9488" />
      </svg>
    ),
  },
  {
    name: "Arab Board of Health",
    subtitle: "البورد العربي · 22 member states",
    svg: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 text-ink">
        <rect x="12" y="14" width="36" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M20 26 L40 26 M20 32 L40 32 M20 38 L32 38" stroke="currentColor" strokeWidth="2" />
        <circle cx="46" cy="14" r="4" fill="#0d9488" />
      </svg>
    ),
  },
  {
    name: "Royal College Cairo",
    subtitle: "Fellowship programmes · 11 specialties",
    svg: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 text-ink">
        <path d="M30 10 L48 22 L42 48 L18 48 L12 22 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M22 30 L30 36 L38 28" stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="30" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Department of Cardiology",
    subtitle: "Al-Moasat University Hospital",
    svg: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 text-ink">
        <circle cx="30" cy="30" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M30 14 L30 46 M14 30 L46 30" stroke="currentColor" strokeWidth="2" />
        <circle cx="30" cy="30" r="6" fill="#0d9488" />
      </svg>
    ),
  },
  {
    name: "Ain Shams Medicine",
    subtitle: "Faculty CME · established 1947",
    svg: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 text-ink">
        <path d="M16 14 L44 14 L48 32 Q48 46 30 50 Q12 46 12 32 Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="30" cy="30" r="6" fill="none" stroke="#0d9488" strokeWidth="2.5" />
        <circle cx="30" cy="30" r="2" fill="#0d9488" />
      </svg>
    ),
  },
];

const metrics = [
  {
    value: "50.4",
    suffix: "M",
    label: "PAPERS · INDEXED · 17 SOURCES",
    description: "PubMed, Scopus, medRxiv, Cochrane, and pre-print servers in one corpus.",
  },
  {
    value: "11.8",
    suffix: "s",
    label: "MEDIAN TIME TO FULL SYNTHESIS",
    description: "From PDF upload to all six agent outputs, validated and ready to share.",
  },
  {
    value: "1,200",
    suffix: "+",
    label: "PHYSICIAN REVIEWERS · 47 SPECIALTIES",
    description: "Board-certified. Each one reviews only papers in their subspecialty.",
  },
  {
    value: "0.04",
    suffix: "%",
    label: "POST-PUBLICATION EMENDATION RATE",
    description: "Audited quarterly against the originating journals' corrections.",
  },
];

export default function SocialProof() {
  return (
    <section id="proof" className="relative py-20 md:py-28 border-t border-ink/10 bg-paper-warm/40">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="text-center max-w-[760px] mx-auto mb-14">
          <div className="text-[10.5px] mono-stat text-teal-deep mb-5">§ 03 · IN PRACTICE</div>
          <h2 className="display text-[40px] md:text-[58px] tracking-tight mb-5">
            Trusted by the institutions
            <br />
            that train <span className="italic text-teal">tomorrow&apos;s doctors</span>.
          </h2>
          <p className="serif-body text-[17px] md:text-[18px] text-ink-soft leading-[1.5] max-w-[620px] mx-auto">
            From the Egyptian Medical Syndicate to the Arab Board of Health Specialisations, the
            bodies that accredit physicians trust Claritas to keep them current.
          </p>
        </div>

        {/* Logos grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden mb-14">
          {institutions.map((inst) => (
            <div
              key={inst.name}
              className="bg-paper p-7 flex flex-col items-center justify-center gap-3 aspect-[5/3]"
            >
              {inst.svg}
              <div className="text-center">
                <div className="font-serif text-[15px] font-medium tracking-tight">{inst.name}</div>
                <div className="text-[9.5px] mono-stat text-ink/40 mt-0.5">{inst.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-paper p-7 md:p-8">
              <div className="font-serif text-[44px] md:text-[56px] leading-none tracking-tight text-ink">
                {metric.value}
                <span className={metric.suffix === "M" || metric.suffix === "+" ? "text-teal" : "text-ink/35 text-[28px]"}>
                  {metric.suffix}
                </span>
              </div>
              <div className="text-[10.5px] mono-stat text-ink/55 mt-3">{metric.label}</div>
              <div className="text-[12.5px] text-ink-soft mt-2">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
