import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function AppraisalPane({ paper }: { paper: Paper }) {
  const { appraisal } = paper;
  const gaugeX = 2 + (appraisal.score / 10) * 316;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 04 &middot; CRITICAL APPRAISAL &middot; 2.1s
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-ink/15 text-[10.5px] mono-stat text-ink-soft">
          <Icon icon="lucide:layers" className="text-[12px] text-teal" />
          GRADE WORKING GROUP
        </div>
      </div>

      {/* Methodology score */}
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="serif text-[22px] tracking-tight">Methodology score</h3>
          <div className="flex items-baseline gap-1">
            <span className="serif text-[44px] leading-none text-teal-deep">{appraisal.score}</span>
            <span className="text-[14px] text-ink/40 mono">/ 10</span>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative mb-5">
          <svg viewBox="0 0 320 14" className="w-full">
            <line x1="2" y1="7" x2="318" y2="7" stroke="#0b1d2a15" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="7" x2={gaugeX} y2="7" stroke="#0b7d72" strokeWidth="2" strokeLinecap="round" />
            <circle cx={gaugeX} cy="7" r="7" fill="#0b7d72" stroke="#f6f3ea" strokeWidth="2" />
          </svg>
          <div className="flex justify-between text-[9.5px] mono-stat text-ink/45 mt-2">
            <span>POOR</span>
            <span>FAIR</span>
            <span className="text-teal-deep">GOOD {appraisal.score}</span>
            <span>ROBUST</span>
          </div>
        </div>

        {/* Domain scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {appraisal.domains.map((d) => (
            <div key={d.name} className="border border-ink/10 rounded-xl p-3.5 bg-paper">
              <div className="text-[9.5px] mono-stat text-ink/50 mb-1.5">{d.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-ink">{d.score}</span>
                <span className={`text-[9.5px] mono-stat ${d.color === 'teal' ? 'text-teal-deep' : 'text-amber-ink'}`}>
                  {d.rob}
                </span>
              </div>
              <div className="h-1 mt-2 bg-ink/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.color === 'teal' ? 'bg-teal-deep' : 'bg-amber-ink'}`}
                  style={{ width: `${d.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bias flags */}
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="serif text-[22px] tracking-tight">Bias flags</h3>
          <span className="text-[10.5px] mono-stat text-amber-ink">
            {appraisal.biasFlags.filter((f) => f.raised).length} RAISED &middot;{' '}
            {appraisal.biasFlags.filter((f) => !f.raised).length} CLEARED
          </span>
        </div>
        <div className="space-y-2.5">
          {appraisal.biasFlags.map((flag) => (
            <div
              key={flag.title}
              className={`flex items-start gap-3 p-3.5 rounded-xl ${
                flag.raised
                  ? 'bg-amber-bg/50 border border-amber-ink/25'
                  : 'bg-teal-deep/[0.06] border border-teal-deep/20'
              }`}
            >
              <Icon
                icon={flag.raised ? 'lucide:alert-triangle' : 'lucide:check'}
                className={`text-[18px] mt-0.5 ${flag.raised ? 'text-amber-ink' : 'text-teal-deep'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-ink">{flag.title}</span>
                  <span
                    className={`text-[9.5px] mono-stat ${
                      flag.raised ? 'text-amber-ink' : 'text-teal-deep'
                    }`}
                  >
                    {flag.severity}
                  </span>
                </div>
                <p className="text-[12.5px] text-ink-soft leading-[1.5]">{flag.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-amber-bg/40 border border-amber-ink/30 rounded-3xl p-7">
        <div className="flex items-center gap-2 mb-5">
          <Icon icon="lucide:alert-octagon" className="text-[20px] text-amber-ink" />
          <h3 className="serif text-[22px] tracking-tight text-amber-ink">Limitations</h3>
        </div>
        <ul className="space-y-3 text-[13px] text-ink-soft leading-[1.55]">
          {appraisal.limitations.map((lim) => {
            const dashIdx = lim.indexOf(' \u2014 ');
            return (
              <li key={lim} className="flex items-start gap-2.5">
                <span className="text-amber-ink mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-ink shrink-0" />
                <span>
                  {dashIdx > 0 ? (
                    <>
                      <span className="font-medium text-ink">{lim.slice(0, dashIdx)}</span>
                      {lim.slice(dashIdx)}
                    </>
                  ) : (
                    lim
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
