import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function RelevancePane({ paper }: { paper: Paper }) {
  const { relevance } = paper;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 05 &middot; CLINICAL RELEVANCE &middot; 0.8s
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-teal-deep text-paper text-[10.5px] mono-stat font-semibold">
          <Icon icon="lucide:zap" className="text-[12px] text-teal-bright" />
          PRACTICE-CHANGING
        </div>
      </div>

      {/* Practice-change banner */}
      <div className="relative bg-ink text-paper rounded-3xl p-7 md:p-9 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-teal-bright/25 blur-3xl pointer-events-none" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="text-[10.5px] mono-stat text-teal-bright mb-3">{relevance.signal}</div>
            <h3 className="serif text-[26px] md:text-[34px] tracking-tight text-paper leading-[1.05] mb-3">
              Yes, this paper changes practice.
            </h3>
            <p className="serif-body text-[15.5px] text-paper/75 leading-[1.55] max-w-[480px]">
              {relevance.summary}
            </p>
          </div>
          <div className="md:col-span-1 flex flex-col gap-3 md:items-end justify-center">
            <div className="inline-flex items-center gap-2 px-4 h-12 rounded-2xl bg-teal-bright text-ink text-[14px] font-bold">
              <Icon icon="lucide:zap" className="text-[18px]" />
              PRACTICE-CHANGING
            </div>
            <div className="text-[10.5px] mono-stat text-paper/60 text-right">{relevance.confidence}</div>
          </div>
        </div>
      </div>

      {/* Specialty tags + evidence grade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">SPECIALTY TAGS</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {relevance.specialties.map((s, i) => (
              <span
                key={s}
                className={
                  i === 0
                    ? 'px-3 h-8 rounded-full bg-ink text-paper text-[12px] font-medium inline-flex items-center gap-1.5'
                    : 'px-3 h-8 rounded-full bg-ink/[0.04] border border-ink/10 text-[12px] text-ink-soft inline-flex items-center'
                }
              >
                {i === 0 && <Icon icon="lucide:heart-pulse" className="text-[13px] text-teal-bright" />}
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10.5px] mono-stat text-ink/55">EVIDENCE GRADE</div>
            <span className="text-[9.5px] mono-stat text-teal-deep">GRADE WORKING GROUP</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-deep text-paper serif text-[26px] font-medium">
              {relevance.evidenceGrade}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-ink">High quality</div>
              <div className="text-[11.5px] text-ink-soft leading-[1.45]">{relevance.evidenceDescription}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice points */}
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
        <h3 className="serif text-[22px] tracking-tight mb-5">What this means in clinic</h3>
        <div className="space-y-3">
          {relevance.practicePoints.map((pt) => (
            <div
              key={pt.title}
              className={`flex items-start gap-3 p-3.5 rounded-xl ${
                pt.type === 'positive'
                  ? 'bg-teal-deep/[0.06] border border-teal-deep/20'
                  : 'bg-amber-bg/50 border border-amber-ink/25'
              }`}
            >
              <Icon
                icon={pt.type === 'positive' ? 'lucide:check-circle-2' : 'lucide:alert-circle'}
                className={`text-[18px] mt-0.5 ${pt.type === 'positive' ? 'text-teal-deep' : 'text-amber-ink'}`}
              />
              <div>
                <div className="text-[13.5px] font-medium text-ink mb-1">{pt.title}</div>
                <div className="text-[12.5px] text-ink-soft leading-[1.5]">{pt.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
