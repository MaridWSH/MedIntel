import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function InfographicPane({ paper }: { paper: Paper }) {
  const { infographic } = paper;
  const lines = infographic.headline.split('\n');

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 03 &middot; CLINICAL INFOGRAPHIC &middot; 1200 &times; 630
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" aria-label="LinkedIn">
            <Icon icon="lucide:linkedin" className="text-[14px] text-ink-soft" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" aria-label="X">
            <Icon icon="lucide:twitter" className="text-[14px] text-ink-soft" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 inline-flex items-center justify-center" aria-label="WhatsApp">
            <Icon icon="lucide:message-circle" className="text-[14px] text-ink" />
          </button>
        </div>
      </div>

      {/* Large Infographic */}
      <div className="relative aspect-[1200/630] bg-ink rounded-3xl overflow-hidden border border-ink-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-deep/30 via-transparent to-amber-ink/10" />
        <div className="absolute inset-0 grain-overlay" />

        {/* Top strip */}
        <div className="absolute top-0 left-0 right-0 px-6 py-3.5 flex items-center justify-between border-b border-paper/10 text-[10px] mono-stat text-paper/60">
          <span className="flex items-center gap-2">
            <span className="serif text-paper text-[14px] font-medium">C.</span>
            <span>CLARITAS &middot; CLINICAL SUMMARY</span>
          </span>
          <span className="hidden sm:inline">2024 &middot; NEJM &middot; 391:106-116</span>
          <span className="serif text-paper text-[11px]">VALIDATED</span>
        </div>

        {/* Body */}
        <div className="absolute inset-0 pt-12 px-6 md:px-10 flex flex-col justify-center">
          <div className="text-[10px] mono-stat text-teal-bright mb-2">
            PRIMARY OUTCOME &middot; 48 MONTHS &middot; n = 17,604
          </div>
          <div className="serif text-paper text-[36px] md:text-[52px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] mb-5">
            {lines.map((line, i) => (
              <span key={i}>
                {line.includes('21%') ? (
                  <>
                    {line.replace('21%', '')}
                    <span className="text-teal-bright">21%</span>
                  </>
                ) : (
                  line
                )}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </div>

          <div className="flex items-end gap-5 md:gap-8 mb-5">
            <div className="flex flex-col gap-1.5">
              <div className="w-20 h-24 md:w-24 md:h-28 bg-paper/15 rounded-md" />
              <div className="text-[10px] mono-stat text-paper/55">{infographic.placeboRate}</div>
            </div>
            <div className="text-paper/30 text-[40px] mb-12">&rarr;</div>
            <div className="flex flex-col gap-1.5">
              <div className="w-20 h-[72px] md:w-24 md:h-[85px] bg-teal-bright rounded-md shadow-[0_0_30px_rgba(20,184,166,0.5)]" />
              <div className="text-[10px] mono-stat text-teal-bright font-semibold">{infographic.semaRate}</div>
            </div>
            <div className="ml-2 md:ml-6 mb-3">
              <div className="serif text-paper text-[48px] md:text-[64px] leading-none font-medium">
                {infographic.reduction}
              </div>
              <div className="text-[10px] mono-stat text-paper/55 mt-1">HR 0.79 (CI 0.72&ndash;0.87)</div>
              <div className="text-[10px] mono-stat text-teal-bright mt-0.5">P &lt; 0.001 &middot; NNT 49</div>
            </div>
          </div>

          <div className="h-px bg-paper/15 my-4 max-w-[600px]" />

          <div className="text-[10px] mono-stat text-paper/45 leading-relaxed max-w-[600px] whitespace-pre-line">
            {infographic.footer}
          </div>
        </div>

        {/* Decorative corner */}
        <svg className="absolute bottom-0 right-0 w-44 h-44 opacity-[0.08]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#14b8a6" fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="30" stroke="#14b8a6" fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="15" stroke="#14b8a6" fill="none" strokeWidth="1" />
        </svg>
      </div>

      {/* Export + share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">DOWNLOAD AS</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="h-10 px-3.5 rounded-xl bg-ink text-paper text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5">
              <Icon icon="lucide:download" className="text-[13px] text-teal-bright" />
              PNG 1200&times;630
            </button>
            <button className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint">
              <Icon icon="lucide:download" className="text-[13px] text-teal" />
              SVG VECTOR
            </button>
            <button className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint">
              <Icon icon="lucide:download" className="text-[13px] text-teal" />
              PDF
            </button>
          </div>
        </div>
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">SHARE TO</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint">
              <Icon icon="lucide:linkedin" className="text-[13px] text-[#0A66C2]" />
              LinkedIn
            </button>
            <button className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint">
              <Icon icon="lucide:twitter" className="text-[13px] text-ink" />
              X / Twitter
            </button>
            <button className="h-10 px-3.5 rounded-xl bg-[#25D366] text-ink text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5">
              <Icon icon="lucide:message-circle" className="text-[13px]" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
