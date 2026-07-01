import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function TldrPane({ paper }: { paper: Paper }) {
  const { tldr } = paper;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 01 &middot; STRUCTURED SUMMARY &middot; 0.4s
        </div>
        <button className="text-[10.5px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1">
          <Icon icon="lucide:scan-eye" className="text-[12px]" />
          TRACE TO SOURCE
        </button>
      </div>

      <article className="relative bg-paper-warm/50 border border-ink/10 rounded-3xl p-7 md:p-10 overflow-hidden">
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-teal/8 blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-6 serif text-[120px] leading-none text-teal/15 select-none">&ldquo;</div>
        <div className="relative">
          <div className="serif-body text-[20px] md:text-[24px] leading-[1.4] text-ink-soft max-w-[640px] mb-6">
            {tldr.summary.split('reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21%').map(
              (part, i, arr) =>
                i === 0 ? (
                  <span key={i}>
                    {part}
                    <span className="font-medium text-ink">
                      reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21%
                    </span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
            )}
          </div>

          <div className="h-px bg-ink/10 my-7" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            {([
              ['P', 'POPULATION', tldr.picot.population],
              ['I', 'INTERVENTION', tldr.picot.intervention],
              ['C', 'COMPARATOR', tldr.picot.comparator],
              ['O', 'OUTCOME', tldr.picot.outcome],
            ] as const).map(([letter, label, text]) => (
              <div key={letter} className="border-l-2 border-teal pl-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9.5px] mono-stat text-teal-deep">{letter}</span>
                  <span className="text-[12.5px] font-semibold text-ink">{label}</span>
                </div>
                <div className="text-[13.5px] text-ink-soft leading-[1.55]">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Synthesis meta strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: 'SYNTHESISED', icon: 'lucide:clock', value: tldr.meta.synthesised },
          { label: 'SOURCES', icon: 'lucide:scroll-text', value: tldr.meta.sources },
          { label: 'VALIDATED BY', icon: 'lucide:user-round-check', value: tldr.meta.validatedBy },
          { label: 'CME ELIGIBLE', icon: 'lucide:award', value: tldr.meta.cme },
        ].map((item) => (
          <div key={item.label} className="bg-paper-warm/40 border border-ink/10 rounded-2xl p-4">
            <div className="text-[9.5px] mono-stat text-ink/45 mb-1.5">{item.label}</div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft font-medium">
              <Icon icon={item.icon} className="text-[14px] text-teal" />
              <span>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
