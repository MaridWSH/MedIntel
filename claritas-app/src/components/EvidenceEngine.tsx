"use client";

const agents = [
  {
    id: "01",
    icon: "lucide:scan-text",
    title: "TLDR Synthesis",
    description:
      "Reads the full text, abstracts, and supplementary materials into a single PICO-structured paragraph that a doctor can absorb during rounds.",
    badges: ["PICO FORMAT", "≤ 60 WORDS"],
    highlighted: false,
  },
  {
    id: "02",
    icon: "lucide:network",
    title: "Mind Map",
    description:
      "Lays out findings as a zoomable, click-through knowledge graph. Every node links to the source paragraph so the chain of evidence is one tap away.",
    badges: ["REACT FLOW", "CLICK-TO-SOURCE"],
    highlighted: false,
  },
  {
    id: "03",
    icon: "lucide:image",
    title: "Infographic",
    description:
      "Renders a journal-grade 1200 × 630 visual summary — the kind you share with the department WhatsApp group or in a journal-club slide.",
    badges: ["1200 × 630"],
    badgesSpecial: [{ text: "WHATSAPP", className: "bg-[#25D366]/15 border-[#25D366]/30 text-ink-soft" }],
    highlighted: false,
  },
  {
    id: "04",
    icon: "lucide:shield-alert",
    title: "Critical Appraisal",
    description:
      "Flags bias, scores methodology, surfaces limitations. The same questions a fellow asks in journal club — answered before you ask them.",
    badges: [],
    badgesSpecial: [
      { text: "BIAS FLAGS", className: "bg-amber-bg border-amber-ink/25 text-amber-ink" },
      { text: "GRADE WORKING", className: "bg-ink/5 border-ink/10 text-ink/55" },
    ],
    highlighted: false,
  },
  {
    id: "05",
    icon: "lucide:stethoscope",
    title: "Clinical Relevance",
    description:
      "Tags by specialty and grades the practice-change signal. Tells you, plainly, whether this paper should change what you do tomorrow morning.",
    badges: [],
    badgesSpecial: [
      { text: "PRACTICE-CHANGE", className: "bg-teal-deep/10 border-teal-deep/25 text-teal-deep" },
      { text: "SPECIALTY TAGS", className: "bg-ink/5 border-ink/10 text-ink/55" },
    ],
    highlighted: false,
  },
  {
    id: "06",
    icon: "lucide:quote",
    title: "Citation Export",
    description:
      "Every claim carries its source. Export to RIS, BibTeX, EndNote, or paste-ready citations in any style — AMA, Vancouver, APA, Harvard.",
    badges: ["RIS", "BIBTEX", "AMA"],
    highlighted: true,
  },
];

export default function EvidenceEngine() {
  return (
    <section id="evidence" className="relative py-20 md:py-28 border-t border-ink/10">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-5">
            <div className="text-[10.5px] mono-stat text-teal-deep mb-5">§ 02 · THE EVIDENCE ENGINE</div>
            <h2 className="display text-[44px] md:text-[64px] tracking-tight">
              Six agents read.
              <br />
              <span className="italic text-teal">One doctor decides.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-7 md:pt-12">
            <p className="serif-body text-[18px] md:text-[19px] leading-[1.55] text-ink-soft max-w-[560px]">
              Each paper passes through a pipeline of six specialised AIs — each one a single-purpose
              reviewer with the focus of a third-year fellow. Their outputs are then verified by a
              board-certified physician before anything reaches you.
            </p>
          </div>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
          {agents.map((agent) => (
            <article
              key={agent.id}
              className={`p-7 lg:p-8 relative ${
                agent.highlighted ? "bg-ink text-paper" : "bg-paper hover-tint"
              }`}
            >
              {agent.highlighted && (
                <div className="absolute top-5 right-5 text-[9.5px] mono-stat text-teal-bright flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink"></span>
                  ALWAYS-ON
                </div>
              )}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    agent.highlighted
                      ? "bg-teal-bright/15 border border-teal-bright/30"
                      : "bg-ink text-paper"
                  }`}
                >
                  <iconify-icon
                    icon={agent.icon}
                    className={`text-[20px] ${agent.highlighted ? "text-teal-bright" : "text-teal-bright"}`}
                  ></iconify-icon>
                </div>
                {!agent.highlighted && (
                  <span className="text-[9.5px] mono-stat text-ink/40">AGENT {agent.id}</span>
                )}
              </div>
              <h3
                className={`font-serif text-[22px] tracking-tight mb-2 ${
                  agent.highlighted ? "text-paper" : ""
                }`}
              >
                {agent.title}
              </h3>
              <p
                className={`text-[13.5px] leading-[1.55] mb-4 ${
                  agent.highlighted ? "text-paper/75" : "text-ink-soft"
                }`}
              >
                {agent.description}
              </p>
              <div
                className={`flex items-center gap-2 text-[10.5px] mono-stat ${
                  agent.highlighted ? "text-paper/65" : "text-ink/55"
                }`}
              >
                {agent.badges.map((badge) => (
                  <span
                    key={badge}
                    className={`px-2 h-6 rounded-md border inline-flex items-center ${
                      agent.highlighted
                        ? "bg-paper/10 border-paper/15"
                        : "bg-ink/5 border-ink/10"
                    }`}
                  >
                    {badge}
                  </span>
                ))}
                {agent.badgesSpecial?.map((badge) => (
                  <span
                    key={badge.text}
                    className={`px-2 h-6 rounded-md border inline-flex items-center ${badge.className}`}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Pipeline diagram */}
        <div className="mt-10 bg-paper-warm/50 border border-ink/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-3">
          <div className="flex items-center gap-3 text-ink-soft">
            <div className="w-9 h-9 rounded-lg bg-ink text-paper flex items-center justify-center text-[10px] mono-stat">
              01
            </div>
            <span className="text-[13px] font-medium">Paper ingested</span>
          </div>
          <iconify-icon icon="lucide:arrow-right" className="text-ink/30 hidden md:block"></iconify-icon>
          <div className="flex items-center gap-3 text-ink-soft">
            <div className="w-9 h-9 rounded-lg bg-ink text-paper flex items-center justify-center text-[10px] mono-stat">
              02
            </div>
            <span className="text-[13px] font-medium">Six agents run in parallel</span>
          </div>
          <iconify-icon icon="lucide:arrow-right" className="text-ink/30 hidden md:block"></iconify-icon>
          <div className="flex items-center gap-3 text-ink-soft">
            <div className="w-9 h-9 rounded-lg bg-amber-bg border border-amber-ink/30 text-amber-ink flex items-center justify-center">
              <iconify-icon icon="lucide:user-round-search" className="text-[16px]"></iconify-icon>
            </div>
            <span className="text-[13px] font-medium">MD reviews every output</span>
          </div>
          <iconify-icon icon="lucide:arrow-right" className="text-ink/30 hidden md:block"></iconify-icon>
          <div className="flex items-center gap-3 text-ink-soft">
            <div className="w-9 h-9 rounded-lg bg-teal-deep text-paper flex items-center justify-center">
              <iconify-icon icon="lucide:badge-check" className="text-[16px]"></iconify-icon>
            </div>
            <span className="text-[13px] font-medium">Validated badge assigned</span>
          </div>
          <iconify-icon icon="lucide:arrow-right" className="text-ink/30 hidden md:block"></iconify-icon>
          <div className="flex items-center gap-3 text-ink-soft">
            <div className="w-9 h-9 rounded-lg bg-ink text-paper flex items-center justify-center text-[10px] mono-stat">
              ★
            </div>
            <span className="text-[13px] font-medium">Delivered, under 12 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
