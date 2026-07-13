'use client';

import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

/**
 * Summary fidelity check.
 *
 * IMPORTANT: `verification` is the pipeline's self-check on its OWN summary —
 * did the extracted numbers and claims faithfully match the source paper. It is
 * NOT a GRADE appraisal or a risk-of-bias assessment of the study itself, and it
 * must not be presented as one. `bias_flags` are claims the verifier flagged as
 * unsupported; `limitations` are the verifier's recommendations.
 *
 * Scores are on a 0..1 scale.
 */

const pct = (score: number) => `${Math.round(score * 100)}%`;

function gradeLabel(grade: string): string {
  switch (grade) {
    case 'A':
      return 'Summary matches the source closely';
    case 'B':
      return 'Minor discrepancies from the source';
    case 'C':
      return 'Some claims could not be verified';
    case 'D':
      return 'Several claims could not be verified';
    default:
      return 'Summary did not pass verification';
  }
}

export default function AppraisalPane({ paper }: { paper: Paper }) {
  const verification = paper.verification;

  if (!verification) {
    return (
      <section className="space-y-4">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
          <Icon icon="lucide:shield-question" className="text-[48px] text-ink/20 mx-auto mb-4" />
          <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">Not verified</h3>
          <p className="text-[14px] text-ink/40 max-w-[420px] mx-auto">
            This paper&rsquo;s summary has not been through the verification step, so we
            can&rsquo;t tell you how closely it tracks the source. Read the original before
            relying on it.
          </p>
        </div>
      </section>
    );
  }

  const { score, grade, domains, bias_flags: flaggedClaims, limitations: recommendations, passed } = verification;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 04 &middot; SUMMARY FIDELITY CHECK
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10.5px] mono-stat font-semibold ${
            passed ? 'bg-teal-deep text-paper' : 'bg-amber-bg border border-amber-ink/30 text-amber-ink'
          }`}
        >
          <Icon icon={passed ? 'lucide:check-circle-2' : 'lucide:alert-triangle'} className="text-[12px]" />
          {passed ? 'PASSED' : 'NEEDS REVIEW'}
        </div>
      </div>

      {/* What this number is — stated plainly, so it can't be mistaken for a GRADE rating. */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-ink/[0.03] border border-ink/10">
        <Icon icon="lucide:info" className="text-[15px] text-teal shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-ink-soft leading-[1.5]">
          This measures how faithfully our AI summary reflects the source paper &mdash; not the
          quality of the study itself. It is not a GRADE rating or a risk-of-bias assessment.
        </p>
      </div>

      {/* Accuracy score */}
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="serif text-[22px] tracking-tight">Summary accuracy</h3>
          <div className="flex items-center gap-3">
            <span className="serif text-[44px] leading-none text-teal-deep">{pct(score)}</span>
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-ink text-paper serif text-[20px]">
              {grade}
            </div>
          </div>
        </div>

        <div className="relative mb-2">
          <svg viewBox="0 0 320 14" className="w-full">
            <line x1="2" y1="7" x2="318" y2="7" stroke="#0b1d2a15" strokeWidth="2" strokeLinecap="round" />
            <line
              x1="2"
              y1="7"
              x2={2 + score * 316}
              y2="7"
              stroke="#0b7d72"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={2 + score * 316} cy="7" r="7" fill="#0b7d72" stroke="#f6f3ea" strokeWidth="2" />
          </svg>
        </div>
        <p className="text-[12.5px] text-ink-soft mb-5">{gradeLabel(grade)}</p>

        {/* Real sub-scores from the API — no invented domains. */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: 'NUMERICAL ACCURACY', value: domains.numerical, hint: 'Do the reported figures match the paper?' },
            { name: 'FACTUAL ACCURACY', value: domains.factual, hint: 'Do the claims match the paper?' },
          ].map((d) => (
            <div key={d.name} className="border border-ink/10 rounded-xl p-3.5 bg-paper">
              <div className="text-[9.5px] mono-stat text-ink/50 mb-1.5">{d.name}</div>
              <div className="text-[18px] font-semibold text-ink mb-2">{pct(d.value)}</div>
              <div className="h-1 bg-ink/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.value >= 0.75 ? 'bg-teal-deep' : 'bg-amber-ink'}`}
                  style={{ width: `${d.value * 100}%` }}
                />
              </div>
              <div className="text-[10.5px] text-ink/45 mt-2 leading-[1.4]">{d.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Claims the verifier could not support */}
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="serif text-[22px] tracking-tight">Flagged claims</h3>
          <span className="text-[10.5px] mono-stat text-ink/45">{flaggedClaims.length} FLAGGED</span>
        </div>
        {flaggedClaims.length > 0 ? (
          <div className="space-y-2.5">
            {flaggedClaims.map((claim, i) => (
              <div
                key={`${i}-${claim.slice(0, 24)}`}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-bg/50 border border-amber-ink/25"
              >
                <Icon icon="lucide:alert-triangle" className="text-[18px] mt-0.5 text-amber-ink shrink-0" />
                <p className="text-[12.5px] text-ink-soft leading-[1.5]">{claim}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-deep/[0.06] border border-teal-deep/20">
            <Icon icon="lucide:check" className="text-[18px] mt-0.5 text-teal-deep shrink-0" />
            <p className="text-[12.5px] text-ink-soft leading-[1.5]">
              The verifier did not flag any claim in this summary as unsupported by the source.
            </p>
          </div>
        )}
      </div>

      {/* Verifier recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-amber-bg/40 border border-amber-ink/30 rounded-3xl p-7">
          <div className="flex items-center gap-2 mb-5">
            <Icon icon="lucide:alert-octagon" className="text-[20px] text-amber-ink" />
            <h3 className="serif text-[22px] tracking-tight text-amber-ink">Reviewer notes</h3>
          </div>
          <ul className="space-y-3 text-[13px] text-ink-soft leading-[1.55]">
            {recommendations.map((rec, i) => (
              <li key={`${i}-${rec.slice(0, 24)}`} className="flex items-start gap-2.5">
                <span className="text-amber-ink mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-ink shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
