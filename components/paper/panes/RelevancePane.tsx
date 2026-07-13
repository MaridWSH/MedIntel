'use client';

import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

/**
 * Clinical relevance.
 *
 * Everything here comes from `key_findings`. There are no invented fallbacks:
 * a paper with no findings says so. `practice_points` are plain strings straight
 * from the extractor — they are the model's claims, not vetted clinical guidance,
 * and the disclaimer below must stay.
 */

const EVIDENCE_STYLES: Record<string, string> = {
  high: 'bg-teal-deep text-paper',
  moderate: 'bg-amber-bg border border-amber-ink/30 text-amber-ink',
  low: 'bg-ink/[0.06] border border-ink/15 text-ink-soft',
  very_low: 'bg-ink/[0.06] border border-ink/15 text-ink-soft',
};

const FINDING_TYPE_LABELS: Record<string, string> = {
  primary_outcome: 'Primary outcome',
  secondary_outcome: 'Secondary outcome',
  clinical_implication: 'Clinical implication',
  safety: 'Safety',
};

export default function RelevancePane({ paper }: { paper: Paper }) {
  const kf = paper.key_findings;
  const pico = paper.pico_summary;
  const picoEntries = pico ? Object.entries(pico) : [];

  if (!kf || (kf.findings.length === 0 && kf.practice_points.length === 0)) {
    return (
      <section className="space-y-4">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
          <Icon icon="lucide:clipboard-list" className="text-[48px] text-ink/20 mx-auto mb-4" />
          <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">No findings extracted</h3>
          <p className="text-[14px] text-ink/40 max-w-[420px] mx-auto">
            We haven&rsquo;t extracted structured findings from this paper, so there is nothing
            to report on clinical relevance. The summary and the original paper are still available.
          </p>
        </div>
      </section>
    );
  }

  const evidence = (kf.overall_evidence_level || '').toLowerCase();
  const evidenceStyle = EVIDENCE_STYLES[evidence] || EVIDENCE_STYLES.low;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 05 &middot; CLINICAL RELEVANCE
        </div>
        {evidence && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10.5px] mono-stat font-semibold ${evidenceStyle}`}>
            <Icon icon="lucide:signal" className="text-[12px]" />
            {evidence.replace('_', ' ').toUpperCase()} EVIDENCE
          </div>
        )}
      </div>

      {/* Headline signal */}
      {kf.signal && (
        <div className="relative bg-ink text-paper rounded-3xl p-7 md:p-9 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-teal-bright/25 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10.5px] mono-stat text-teal-bright mb-3">HEADLINE FINDING</div>
            <p className="serif text-[22px] md:text-[27px] tracking-tight text-paper leading-[1.3] max-w-[680px]">
              {kf.signal}
            </p>
            {kf.sample_size && (
              <div className="mt-5 inline-flex items-center gap-2 px-3 h-8 rounded-lg bg-paper/10 text-[11.5px] mono-stat text-paper/80">
                <Icon icon="lucide:users" className="text-[13px] text-teal-bright" />
                SAMPLE {kf.sample_size}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Findings, with the evidence the model actually cited */}
      {kf.findings.length > 0 && (
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
          <h3 className="serif text-[22px] tracking-tight mb-5">Extracted findings</h3>
          <div className="space-y-3">
            {kf.findings.map((f, i) => (
              <div key={`${i}-${f.claim.slice(0, 24)}`} className="p-4 rounded-xl bg-paper border border-ink/10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {f.finding_type && (
                    <span className="text-[9.5px] mono-stat px-2 h-5 inline-flex items-center rounded bg-teal-deep/10 text-teal-deep">
                      {(FINDING_TYPE_LABELS[f.finding_type] || f.finding_type.replace(/_/g, ' ')).toUpperCase()}
                    </span>
                  )}
                  {f.evidence_strength && (
                    <span className="text-[9.5px] mono-stat text-ink/45">
                      {f.evidence_strength.toUpperCase()} STRENGTH
                    </span>
                  )}
                  {f.limitations_noted && (
                    <span className="text-[9.5px] mono-stat px-2 h-5 inline-flex items-center rounded bg-amber-bg text-amber-ink">
                      LIMITATIONS NOTED
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-ink leading-[1.55] mb-2">{f.claim}</p>

                {f.statistical_support && (
                  <p className="text-[12px] mono-stat text-ink-soft bg-ink/[0.03] rounded-lg px-3 py-2 mb-2">
                    {f.statistical_support}
                  </p>
                )}

                {f.source_quote && (
                  <blockquote className="border-l-2 border-teal/40 pl-3 text-[12.5px] text-ink/60 italic leading-[1.5]">
                    &ldquo;{f.source_quote}&rdquo;
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice points — the model's words, labelled as such */}
      {kf.practice_points.length > 0 && (
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
          <h3 className="serif text-[22px] tracking-tight mb-2">Practice points</h3>
          <p className="text-[12px] text-ink/50 mb-5 leading-[1.5]">
            AI-extracted from this single paper. Not clinical guidance, not peer reviewed, and not a
            substitute for the source or for professional judgement.
          </p>
          <div className="space-y-3">
            {kf.practice_points.map((point, i) => (
              <div
                key={`${i}-${point.slice(0, 24)}`}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-deep/[0.06] border border-teal-deep/20"
              >
                <Icon icon="lucide:corner-down-right" className="text-[16px] mt-0.5 text-teal-deep shrink-0" />
                <p className="text-[13px] text-ink-soft leading-[1.55]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PICO */}
      {picoEntries.length > 0 && (
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">PICO SUMMARY</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {picoEntries.map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-ink/[0.03] border border-ink/10">
                <span className="text-[10px] mono-stat text-teal-deep uppercase">{key}</span>
                <p className="text-[13px] text-ink-soft mt-1 leading-[1.5]">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
