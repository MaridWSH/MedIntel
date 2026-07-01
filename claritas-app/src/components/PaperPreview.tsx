"use client";

import Link from "next/link";

interface PaperData {
  journal: string;
  citation: string;
  doi: string;
  title: string;
  authors: string;
  investigators: string;
  authorCount: number;
  centerCount: number;
  reviewer: string;
  stats: {
    hr: string;
    ci: string;
    p: string;
    grade: string;
  };
  tags: string[];
  tldr: string;
  pico: {
    population: string;
    intervention: string;
    comparator: string;
    outcome: string;
  };
  synthesisTime: string;
  physiciansSaved: number;
  cmeCredits: string;
}

const samplePaper: PaperData = {
  journal: "NEJM",
  citation: "2024;391:106-116",
  doi: "DOI 10.1056/NEJMoa2403180",
  title: "Once-Weekly Semaglutide and Cardiovascular Outcomes in Adults with Overweight or Obesity",
  authors: "Lepault R, Aroda VR, Davies M, et al.",
  investigators: "for the STEP-HFpEF Trial Investigators",
  authorCount: 41,
  centerCount: 14,
  reviewer: "K. EL-SHERIF, MD",
  stats: { hr: "0.79", ci: "0.72 – 0.87", p: "< 0.001", grade: "GRADE A" },
  tags: ["Cardiology", "Endocrinology", "Prevention"],
  tldr: 'In adults with overweight or obesity and established cardiovascular disease, weekly subcutaneous semaglutide reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21% — a benefit consistent across pre-specified subgroups.',
  pico: {
    population: "n = 17,604 adults, BMI ≥ 27, established ASCVD",
    intervention: "Semaglutide 2.4 mg SC weekly",
    comparator: "Placebo, matching injection schedule",
    outcome: "MACE (3-point composite) at 48 months",
  },
  synthesisTime: "11.8s",
  physiciansSaved: 1439,
  cmeCredits: "0.5",
};

export default function PaperPreview() {
  const paper = samplePaper;

  return (
    <div className="fade-up delay-6 mt-16">
      {/* Spec line */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-[11px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink"></span>
          LIVE PREVIEW · PAPER · DETAIL VIEW
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] mono-stat text-ink/40">
          <span>6 agents · {paper.synthesisTime} total</span>
          <iconify-icon icon="lucide:arrow-right" className="text-[12px]"></iconify-icon>
        </div>
      </div>

      {/* Paper card */}
      <article className="relative bg-paper border border-ink/12 rounded-[28px] shadow-[0_50px_100px_-40px_rgba(11,29,42,0.3),0_4px_12px_-4px_rgba(11,29,42,0.08)] overflow-hidden">
        {/* Paper header */}
        <header className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-ink/8 bg-paper-warm/40">
          <div className="flex items-start gap-6">
            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 text-[11px] mono-stat text-ink/55">
                <span className="text-ink-soft font-semibold">{paper.journal}</span>
                <span className="text-ink/25">·</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{paper.citation}</span>
                <span className="text-ink/25">·</span>
                <span>{paper.doi}</span>
              </div>
              <h3 className="font-serif text-[22px] md:text-[28px] leading-[1.15] tracking-tight max-w-[680px]">
                {paper.title}
              </h3>
              <p className="text-[12.5px] text-ink/60 mt-2.5">
                <span className="italic">{paper.authors}</span> · {paper.investigators} · {paper.authorCount} authors · {paper.centerCount} centers
              </p>
            </div>

            {/* Validation badge */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-paper">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-bright"></span>
                <span className="text-[11px] mono-stat font-semibold tracking-wider">VALIDATED</span>
                <iconify-icon icon="lucide:badge-check" className="text-[13px] text-teal-bright"></iconify-icon>
              </div>
              <span className="text-[10px] mono-stat text-ink/45">REVIEWED · {paper.reviewer}</span>
            </div>
          </div>

          {/* Stats chips + tags */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink text-paper">
              <span className="text-[10.5px] mono-stat">HR</span>
              <span className="text-[11px] mono-stat text-paper/60">=</span>
              <span className="text-[12px] mono-stat font-semibold">{paper.stats.hr}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink/8 border border-ink/10">
              <span className="text-[10.5px] mono-stat text-ink/55">95% CI</span>
              <span className="text-[12px] mono-stat font-medium text-ink-soft">{paper.stats.ci}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink/8 border border-ink/10">
              <span className="text-[10.5px] mono-stat text-ink/55">P</span>
              <span className="text-[12px] mono-stat font-medium text-ink-soft">{paper.stats.p}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-teal-deep/10 border border-teal-deep/20">
              <span className="text-[10.5px] mono-stat text-teal-deep">{paper.stats.grade}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-amber-bg border border-amber-ink/20">
              <iconify-icon icon="lucide:clock-3" className="text-[12px] text-amber-ink"></iconify-icon>
              <span className="text-[10.5px] mono-stat text-amber-ink">PEER REVIEWED</span>
            </div>

            <div className="w-px h-6 bg-ink/12 mx-1"></div>

            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 h-7 rounded-full bg-ink/[0.04] border border-ink/10 text-[11px] text-ink-soft inline-flex items-center"
              >
                {tag}
              </span>
            ))}
            <span className="px-2.5 h-7 rounded-full bg-teal-deep/[0.08] border border-teal-deep/25 text-[11px] text-teal-deep font-medium inline-flex items-center">
              Practice-changing
            </span>
          </div>
        </header>

        {/* Body: TLDR + Mind map + Infographic */}
        <div className="px-6 md:px-8 py-6 md:py-8 grid grid-cols-12 gap-6 md:gap-8">
          {/* TLDR */}
          <div className="col-span-12 md:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10.5px] mono-stat text-ink/55">AGENT 01 · TLDR</h4>
              <span className="text-[10px] mono-stat text-ink/35">0.4s</span>
            </div>

            <div className="flex-1 bg-paper-warm/50 border border-ink/8 rounded-2xl p-5 md:p-6">
              <div className="flex items-start gap-2.5 mb-4">
                <div className="font-serif text-[44px] leading-none text-teal -mt-1">&ldquo;</div>
                <p className="serif-body text-[16.5px] md:text-[17.5px] leading-[1.45] text-ink-soft -mt-1">
                  {paper.tldr.split("reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21%")[0]}
                  <span className="font-medium text-ink">
                    reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21%
                  </span>
                  {paper.tldr.split("reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21%")[1]}
                </p>
              </div>

              <div className="h-px bg-ink/8 my-5"></div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[12.5px]">
                <div>
                  <div className="text-[9.5px] mono-stat text-ink/45 mb-0.5">POPULATION</div>
                  <div className="text-ink-soft">{paper.pico.population}</div>
                </div>
                <div>
                  <div className="text-[9.5px] mono-stat text-ink/45 mb-0.5">INTERVENTION</div>
                  <div className="text-ink-soft">{paper.pico.intervention}</div>
                </div>
                <div>
                  <div className="text-[9.5px] mono-stat text-ink/45 mb-0.5">COMPARATOR</div>
                  <div className="text-ink-soft">{paper.pico.comparator}</div>
                </div>
                <div>
                  <div className="text-[9.5px] mono-stat text-ink/45 mb-0.5">OUTCOME</div>
                  <div className="text-ink-soft">{paper.pico.outcome}</div>
                </div>
              </div>

              {/* Agent footer */}
              <div className="mt-5 pt-4 border-t border-ink/8 flex items-center justify-between text-[10.5px] mono-stat">
                <div className="flex items-center gap-2 text-ink/55">
                  <iconify-icon icon="lucide:scan-eye" className="text-[12px] text-teal"></iconify-icon>
                  SOURCES · 41 CITATIONS · 6 FIGURES
                </div>
                <button className="text-teal-deep hover:underline inline-flex items-center gap-1">
                  SEE FULL EVIDENCE <iconify-icon icon="lucide:arrow-up-right" className="text-[11px]"></iconify-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Mind map */}
          <div className="col-span-12 md:col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10.5px] mono-stat text-ink/55">AGENT 02 · MIND MAP</h4>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint inline-flex items-center justify-center">
                  <iconify-icon icon="lucide:minus" className="text-[12px]"></iconify-icon>
                </button>
                <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint inline-flex items-center justify-center">
                  <iconify-icon icon="lucide:plus" className="text-[12px]"></iconify-icon>
                </button>
                <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint inline-flex items-center justify-center">
                  <iconify-icon icon="lucide:maximize" className="text-[12px]"></iconify-icon>
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-ink rounded-2xl overflow-hidden min-h-[340px]">
              {/* Grid background */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
                <pattern id="mindgrid" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.6" fill="#f6f3ea" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#mindgrid)" />
              </svg>

              {/* Mind map SVG */}
              <svg viewBox="0 0 380 360" className="relative w-full h-full">
                {/* Connections */}
                <g stroke="#14b8a6" strokeWidth="1.2" fill="none" opacity="0.55">
                  <path d="M 190 180 Q 110 100, 70 70" />
                  <path d="M 190 180 Q 285 100, 320 65" />
                  <path d="M 190 180 Q 85 200, 45 200" />
                  <path d="M 190 180 Q 290 200, 335 195" />
                  <path d="M 190 180 Q 130 285, 80 325" />
                  <path d="M 190 180 Q 250 280, 305 310" />
                </g>

                {/* Center node */}
                <g>
                  <rect x="135" y="160" width="110" height="40" rx="8" fill="#14b8a6" stroke="#0b7d72" strokeWidth="1.5" />
                  <text x="190" y="178" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" fill="#0b1d2a" letterSpacing="1">CORE FINDING</text>
                  <text x="190" y="192" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700" fill="#0b1d2a">–21% MACE</text>
                </g>

                {/* Node: Population */}
                <g>
                  <rect x="14" y="48" width="112" height="46" rx="6" fill="#1a2c3a" stroke="#14b8a6" strokeWidth="0.5" opacity="0.95" />
                  <text x="22" y="65" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#5eaaa0" letterSpacing="0.5">POPULATION</text>
                  <text x="22" y="79" fontFamily="Inter" fontSize="10.5" fontWeight="600" fill="#f6f3ea">17,604 pts</text>
                  <text x="22" y="89" fontFamily="Inter" fontSize="8.5" fill="#f6f3ea" opacity="0.6">BMI ≥ 27, ASCVD</text>
                </g>

                {/* Node: Results */}
                <g>
                  <rect x="264" y="44" width="106" height="46" rx="6" fill="#1a2c3a" stroke="#14b8a6" strokeWidth="0.5" opacity="0.95" />
                  <text x="272" y="61" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#5eaaa0" letterSpacing="0.5">RESULTS</text>
                  <text x="272" y="75" fontFamily="Inter" fontSize="10.5" fontWeight="600" fill="#f6f3ea">HR 0.79 (0.72–0.87)</text>
                  <text x="272" y="85" fontFamily="Inter" fontSize="8.5" fill="#f6f3ea" opacity="0.6">P&lt;0.001</text>
                </g>

                {/* Node: Subgroups */}
                <g>
                  <rect x="0" y="178" width="86" height="42" rx="6" fill="#1a2c3a" stroke="#14b8a6" strokeWidth="0.5" opacity="0.95" />
                  <text x="8" y="195" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#5eaaa0" letterSpacing="0.5">SUBGROUPS</text>
                  <text x="8" y="208" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#f6f3ea">Consistent across</text>
                  <text x="8" y="217" fontFamily="Inter" fontSize="9" fill="#f6f3ea" opacity="0.6">all strata</text>
                </g>

                {/* Node: Safety */}
                <g>
                  <rect x="292" y="174" width="86" height="44" rx="6" fill="#1a2c3a" stroke="#14b8a6" strokeWidth="0.5" opacity="0.95" />
                  <text x="300" y="191" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#5eaaa0" letterSpacing="0.5">SAFETY</text>
                  <text x="300" y="205" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#f6f3ea">GI events 38%</text>
                  <text x="300" y="214" fontFamily="Inter" fontSize="8.5" fill="#f6f3ea" opacity="0.6">vs 18% placebo</text>
                </g>

                {/* Node: Limitation */}
                <g>
                  <rect x="12" y="306" width="116" height="46" rx="6" fill="#1a2c3a" stroke="#967338" strokeWidth="0.5" opacity="0.95" />
                  <text x="20" y="323" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#cab57d" letterSpacing="0.5">LIMITATION</text>
                  <text x="20" y="337" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#f6f3ea">8% discontinued</text>
                  <text x="20" y="346" fontFamily="Inter" fontSize="8.5" fill="#f6f3ea" opacity="0.6">treatment blinding</text>
                </g>

                {/* Node: Follow-up */}
                <g>
                  <rect x="262" y="298" width="106" height="46" rx="6" fill="#1a2c3a" stroke="#14b8a6" strokeWidth="0.5" opacity="0.95" />
                  <text x="270" y="315" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500" fill="#5eaaa0" letterSpacing="0.5">FOLLOW-UP</text>
                  <text x="270" y="329" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#f6f3ea">48 months</text>
                  <text x="270" y="338" fontFamily="Inter" fontSize="8.5" fill="#f6f3ea" opacity="0.6">3,581 events</text>
                </g>

                {/* Hover hint */}
                <circle cx="320" cy="65" r="14" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="2 3">
                  <animate attributeName="r" values="14;18;14" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Mind map footer */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] mono-stat text-paper/55">
                <span className="flex items-center gap-1.5">
                  <iconify-icon icon="lucide:mouse-pointer" className="text-[11px] text-teal-bright"></iconify-icon>
                  CLICK NODE → SOURCE TEXT
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>12 NODES · 6 BRANCHES</span>
              </div>
            </div>
          </div>

          {/* Infographic + agents */}
          <div className="col-span-12 md:col-span-3 flex flex-col gap-5">
            {/* Infographic */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10.5px] mono-stat text-ink/55">AGENT 03 · INFOGRAPHIC</h4>
                <div className="flex items-center gap-1.5">
                  <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint inline-flex items-center justify-center" aria-label="Share on LinkedIn">
                    <iconify-icon icon="lucide:linkedin" className="text-[11px] text-ink-soft"></iconify-icon>
                  </button>
                  <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint inline-flex items-center justify-center" aria-label="Share on X">
                    <iconify-icon icon="lucide:twitter" className="text-[11px] text-ink-soft"></iconify-icon>
                  </button>
                  <button className="w-6 h-6 rounded-md border border-ink/12 hover-tint bg-[#25D366]/15 inline-flex items-center justify-center" aria-label="Share on WhatsApp">
                    <iconify-icon icon="lucide:message-circle" className="text-[11px] text-ink-soft"></iconify-icon>
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/9] bg-[#0f1a2e] rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                {/* Thin top rule */}
                <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(255,255,255,0.2)]"></div>

                {/* Subtle corner accents */}
                <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[rgba(255,255,255,0.1)]"></div>
                <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[rgba(255,255,255,0.1)]"></div>

                {/* Content — centered, lots of negative space */}
                <div className="flex flex-col items-center text-center px-6 py-8">
                  {/* Small label */}
                  <div className="text-[6px] mono-stat text-[#6b7280] tracking-[0.15em] mb-4">
                    CLINICAL SUMMARY · NEJM 2024
                  </div>

                  {/* Serif headline in cream white */}
                  <h3 className="font-serif text-[#f0ece2] text-[15px] md:text-[17px] leading-[1.25] tracking-tight font-medium max-w-[200px]">
                    Semaglutide cut cardiovascular events by 21%
                  </h3>

                  {/* Thin divider */}
                  <div className="w-8 h-px bg-[rgba(255,255,255,0.12)] my-4"></div>

                  {/* Large stat in muted sage green */}
                  <div className="font-serif text-[#7c9a8e] text-[36px] md:text-[42px] font-medium tracking-tight leading-none">
                    –21%
                  </div>

                  {/* Subtle footnote */}
                  <div className="text-[5.5px] mono-stat text-[#4a5568] mt-4 tracking-[0.08em]">
                    HR 0.79 · 95% CI 0.72–0.87 · P &lt; 0.001
                  </div>
                </div>

                {/* Bottom branding */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
                  <span className="text-[5px] mono-stat text-[#3d4a5c] tracking-[0.12em]">
                    CLARITAS · EVIDENCE SYNTHESISED
                  </span>
                </div>
              </div>

              {/* Format hint */}
              <div className="flex items-center justify-between mt-2 text-[9.5px] mono-stat text-ink/45">
                <span>1200 × 630 · PNG / SVG</span>
                <button className="text-teal-deep hover:underline inline-flex items-center gap-1">
                  DOWNLOAD <iconify-icon icon="lucide:arrow-down" className="text-[10px]"></iconify-icon>
                </button>
              </div>
            </div>

            {/* Other agents */}
            <div className="flex-1 bg-paper-warm/50 border border-ink/8 rounded-2xl p-4">
              <h4 className="text-[10.5px] mono-stat text-ink/55 mb-3">ALSO GENERATED</h4>
              <ul className="space-y-2.5 text-[11.5px]">
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <iconify-icon icon="lucide:badge-check" className="text-[13px] text-teal"></iconify-icon>
                    Critical appraisal
                  </span>
                  <span className="text-[10px] mono-stat text-ink/40">04</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <iconify-icon icon="lucide:badge-check" className="text-[13px] text-teal"></iconify-icon>
                    Clinical relevance
                  </span>
                  <span className="text-[10px] mono-stat text-ink/40">05</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <iconify-icon icon="lucide:badge-check" className="text-[13px] text-teal"></iconify-icon>
                    Citation export
                  </span>
                  <span className="text-[10px] mono-stat text-ink/40">06</span>
                </li>
              </ul>
              <div className="my-3 h-px bg-ink/8"></div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 h-6 rounded-md bg-ink text-paper text-[9.5px] mono-stat inline-flex items-center">PNG</span>
                <span className="px-2 h-6 rounded-md bg-ink/8 border border-ink/10 text-[9.5px] mono-stat inline-flex items-center text-ink-soft">SVG</span>
                <span className="px-2 h-6 rounded-md bg-ink/8 border border-ink/10 text-[9.5px] mono-stat inline-flex items-center text-ink-soft">PDF</span>
                <span className="px-2 h-6 rounded-md bg-ink/8 border border-ink/10 text-[9.5px] mono-stat inline-flex items-center text-ink-soft">RIS</span>
                <span className="px-2 h-6 rounded-md bg-ink/8 border border-ink/10 text-[9.5px] mono-stat inline-flex items-center text-ink-soft">BIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card footer */}
        <footer className="border-t border-ink/8 px-6 md:px-8 py-4 flex items-center justify-between flex-wrap gap-3 bg-paper-warm/40">
          <div className="flex items-center gap-4 text-[10.5px] mono-stat text-ink/55">
            <span className="flex items-center gap-1.5">
              <iconify-icon icon="lucide:clock" className="text-[12px] text-teal"></iconify-icon>
              SYNTHESISED {paper.synthesisTime} AGO
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <iconify-icon icon="lucide:users" className="text-[12px] text-teal"></iconify-icon>
              {paper.physiciansSaved.toLocaleString()} PHYSICIANS SAVED
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <iconify-icon icon="lucide:award" className="text-[12px] text-teal"></iconify-icon>
              {paper.cmeCredits} CME CREDITS
            </span>
          </div>
          <Link
            href="/paper/semaglutide-cv-outcomes-2024"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold btn-primary"
          >
            Open full paper
            <iconify-icon icon="lucide:arrow-right" className="text-[14px]"></iconify-icon>
          </Link>
        </footer>
      </article>

      {/* Caption */}
      <p className="mt-4 text-center text-[11.5px] text-ink/45">
        Live preview · synthesised from <span className="italic">Lepault R, et al. NEJM 2024;391:106-116</span> · Open the full detail view for the critical appraisal and clinical relevance sections.
      </p>
    </div>
  );
}
