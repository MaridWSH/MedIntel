'use client';

import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

/**
 * TL;DR + full structured summary.
 *
 * The pipeline writes a short `tldr` (~270 chars) and a much longer
 * `detailed_summary` (~2k chars, structured as "Background: ...\n\nMethods: ...").
 * The detailed summary used to be dropped entirely except for a 120-char teaser,
 * so ~88% of the generated text never reached the reader. Both render here now.
 */

interface SummaryBlock {
  heading: string | null;
  body: string;
}

/** Split "Background: text\n\nMethods: text" into labelled blocks. */
function parseSummary(text: string): SummaryBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => {
      const match = para.match(/^([A-Z][A-Za-z /&-]{2,40}):\s*([\s\S]+)$/);
      return match
        ? { heading: match[1].trim(), body: match[2].trim() }
        : { heading: null, body: para };
    });
}

const PICO_FIELDS = [
  { letter: 'P', label: 'POPULATION', key: 'population' },
  { letter: 'I', label: 'INTERVENTION', key: 'intervention' },
  { letter: 'C', label: 'COMPARATOR', key: 'comparator' },
  { letter: 'O', label: 'OUTCOME', key: 'outcome' },
];

export default function TldrPane({ paper }: { paper: Paper }) {
  const tldr = paper.tldr?.trim();
  const blocks = paper.detailed_summary?.trim() ? parseSummary(paper.detailed_summary) : [];

  const pico = paper.pico_summary || {};
  const picoRows = PICO_FIELDS.map((f) => ({ ...f, value: pico[f.key] })).filter((f) => f.value);

  const sourceUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.id}/`;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 01 &middot; STRUCTURED SUMMARY
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10.5px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1"
        >
          <Icon icon="lucide:scan-eye" className="text-[12px]" />
          TRACE TO SOURCE
        </a>
      </div>

      {/* TL;DR */}
      {tldr && (
        <article className="relative bg-paper-warm/50 border border-ink/10 rounded-3xl p-7 md:p-10 overflow-hidden">
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-teal/8 blur-3xl pointer-events-none" />
          <div className="absolute top-6 right-6 serif text-[120px] leading-none text-teal/15 select-none">
            &ldquo;
          </div>
          <div className="relative">
            <div className="text-[10px] mono-stat text-ink/45 mb-4">TL;DR</div>
            <p className="serif-body text-[20px] md:text-[24px] leading-[1.45] text-ink-soft max-w-[640px]">
              {tldr}
            </p>
          </div>
        </article>
      )}

      {/* Full structured summary — the substance. */}
      {blocks.length > 0 ? (
        <article className="bg-paper border border-ink/10 rounded-3xl p-7 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="serif text-[24px] tracking-tight">Full summary</h3>
            <span className="text-[9.5px] mono-stat text-ink/40">
              {paper.detailed_summary.length.toLocaleString()} CHARS
            </span>
          </div>

          <div className="space-y-6 max-w-[720px]">
            {blocks.map((block, i) => (
              <div key={`${i}-${(block.heading || block.body).slice(0, 24)}`}>
                {block.heading && (
                  <h4 className="text-[11px] mono-stat text-teal-deep mb-2 tracking-wider">
                    {block.heading.toUpperCase()}
                  </h4>
                )}
                <p className="serif-body text-[15.5px] md:text-[16px] leading-[1.7] text-ink-soft">
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : (
        !tldr && (
          <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
            <Icon icon="lucide:file-question" className="text-[48px] text-ink/20 mx-auto mb-4" />
            <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">No summary available</h3>
            <p className="text-[14px] text-ink/40">This paper has not been summarised yet.</p>
          </div>
        )
      )}

      {/* PICO */}
      {picoRows.length > 0 && (
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-5">PICO</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {picoRows.map(({ letter, label, key, value }) => (
              <div key={key} className="border-l-2 border-teal pl-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9.5px] mono-stat text-teal-deep">{letter}</span>
                  <span className="text-[12.5px] font-semibold text-ink">{label}</span>
                </div>
                <div className="text-[13.5px] text-ink-soft leading-[1.55]">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta — only facts we actually hold. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          {
            label: 'STUDY TYPE',
            icon: 'lucide:scroll-text',
            value: paper.study_type || 'Not classified',
          },
          {
            label: 'SPECIALTY',
            icon: 'lucide:heart-pulse',
            value: paper.specialty_tags?.[0] || 'Not tagged',
          },
          {
            label: 'SUMMARISED BY',
            icon: 'lucide:bot',
            value: 'AI pipeline',
          },
          {
            label: 'FIDELITY CHECK',
            icon: paper.verification ? 'lucide:shield-check' : 'lucide:shield-question',
            value: paper.verification
              ? `${Math.round(paper.verification.score * 100)}% · ${paper.verification.grade}`
              : 'Not run',
          },
        ].map((item) => (
          <div key={item.label} className="bg-paper-warm/40 border border-ink/10 rounded-2xl p-4">
            <div className="text-[9.5px] mono-stat text-ink/45 mb-1.5">{item.label}</div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft font-medium min-w-0">
              <Icon icon={item.icon} className="text-[14px] text-teal shrink-0" />
              <span className="truncate">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
