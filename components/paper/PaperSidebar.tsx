'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import type { Paper } from '../../lib/papers/types';

/**
 * Sidebar: source link, section list, abstract, citation export, authors.
 *
 * The API sends `sections` as plain strings and `citation` as one formatted
 * string. This component used to expect `{id,label,range}` objects and a map of
 * citation styles, so the section nav rendered as blank buttons and the citation
 * panel always claimed "no formats available" while a citation sat unused.
 * There is no fake "AI Reviewer" card any more — we show the real authors.
 */

function buildBibtex(paper: Paper): string {
  const firstAuthor = paper.author_list?.split(',')[0]?.trim().split(' ').pop() || 'unknown';
  const key = `${firstAuthor.toLowerCase()}_${paper.id}`;
  const authors = paper.author_list
    ? paper.author_list.split(',').map((a) => a.trim()).filter(Boolean).join(' and ')
    : '';
  const lines = [
    `@article{${key},`,
    `  title   = {${paper.title}},`,
    authors ? `  author  = {${authors}},` : '',
    paper.journal ? `  journal = {${paper.journal}},` : '',
    paper.doi ? `  doi     = {${paper.doi}},` : '',
    `  note    = {PMC ID: ${paper.id}}`,
    `}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function buildRis(paper: Paper): string {
  const lines = ['TY  - JOUR', `TI  - ${paper.title}`];
  paper.author_list
    ?.split(',')
    .map((a) => a.trim())
    .filter(Boolean)
    .forEach((a) => lines.push(`AU  - ${a}`));
  if (paper.journal) lines.push(`JO  - ${paper.journal}`);
  if (paper.doi) lines.push(`DO  - ${paper.doi}`);
  lines.push(`AN  - ${paper.id}`, 'ER  - ');
  return lines.join('\n');
}

export default function PaperSidebar({ paper }: { paper: Paper }) {
  const [format, setFormat] = useState<'CITATION' | 'BIBTEX' | 'RIS'>('CITATION');
  const [copied, setCopied] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);

  const sourceUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.id}/`;

  const formats: Record<string, string> = {
    CITATION: paper.citation || `${paper.title}. ${paper.journal || ''}`.trim(),
    BIBTEX: buildBibtex(paper),
    RIS: buildRis(paper),
  };
  const activeText = formats[format];

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const download = () => {
    const ext = format === 'BIBTEX' ? 'bib' : format === 'RIS' ? 'ris' : 'txt';
    const blob = new Blob([activeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = paper.sections || [];
  const centers = paper.centers || [];

  return (
    <aside className="col-span-12 lg:col-span-4 min-w-0">
      <div className="sticky top-[100px] space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
        {/* Source */}
        <div className="rounded-3xl bg-ink text-paper p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-paper/65">
              <Icon icon="lucide:file-text" className="text-[13px] text-teal-bright" />
              ORIGINAL PAPER
            </div>
            <span className="text-[9.5px] mono-stat text-paper/45">{paper.id}</span>
          </div>
          <h3 className="serif text-[15px] tracking-tight leading-snug mb-1.5">{paper.title}</h3>
          {paper.journal && (
            <p className="text-[11.5px] text-paper/55 italic mb-3.5">{paper.journal}</p>
          )}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10.5px] mono-stat text-teal-bright hover:underline"
          >
            <Icon icon="lucide:external-link" className="text-[12px]" />
            READ THE FULL PAPER
          </a>
        </div>

        {/* Sections — titles as published; we don't know page numbers, so we don't invent them. */}
        {sections.length > 0 && (
          <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55 mb-3.5">
              <Icon icon="lucide:list" className="text-[13px] text-teal" />
              SECTIONS IN THE PAPER
            </div>
            <ol className="space-y-1">
              {sections.map((title, i) => (
                <li
                  key={`${i}-${title}`}
                  className="flex items-baseline gap-2.5 px-2 py-1.5 rounded-lg"
                >
                  <span className="text-[9.5px] mono-stat text-ink/35 w-4 shrink-0">{i + 1}</span>
                  <span className="text-[12.5px] text-ink-soft leading-[1.45]">{title}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Abstract */}
        {paper.excerpt && (
          <div className="rounded-3xl bg-paper-warm border border-ink/10 p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
                <Icon icon="lucide:book-open" className="text-[13px] text-teal" />
                ABSTRACT
              </div>
              <button
                onClick={() => copy(paper.excerpt)}
                className="w-7 h-7 rounded-md border border-ink/15 hover-tint inline-flex items-center justify-center"
                aria-label="Copy abstract"
              >
                <Icon icon="lucide:copy" className="text-[12px] text-ink-soft" />
              </button>
            </div>
            <p
              className={`serif-body text-[13.5px] text-ink-soft leading-[1.6] ${
                abstractOpen ? '' : 'line-clamp-6'
              }`}
            >
              {paper.excerpt}
            </p>
            {paper.excerpt.length > 380 && (
              <button
                onClick={() => setAbstractOpen((v) => !v)}
                className="mt-3 text-[11px] mono-stat text-teal-deep hover:underline"
              >
                {abstractOpen ? 'SHOW LESS' : 'SHOW FULL ABSTRACT'}
              </button>
            )}
          </div>
        )}

        {/* Citation export */}
        <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
          <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55 mb-4">
            <Icon icon="lucide:quote" className="text-[13px] text-teal" />
            CITATION EXPORT
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {(['CITATION', 'BIBTEX', 'RIS'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`h-8 px-2.5 rounded-lg text-[10.5px] mono-stat font-semibold transition-all ${
                  format === f ? 'bg-ink text-paper' : 'border border-ink/15 text-ink-soft hover-tint'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <pre className="bg-ink rounded-xl p-3.5 text-paper/85 text-[10.5px] mono leading-[1.55] max-h-[140px] overflow-auto whitespace-pre-wrap break-words">
            {activeText}
          </pre>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={download}
              className="flex-1 h-9 rounded-lg bg-teal-deep text-paper text-[11px] mono-stat font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Icon icon="lucide:download" className="text-[13px]" />
              DOWNLOAD
            </button>
            <button
              onClick={() => copy(activeText)}
              className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[11px] mono-stat font-semibold text-ink-soft"
            >
              <Icon
                icon={copied ? 'lucide:check' : 'lucide:copy'}
                className={`text-[13px] ${copied ? 'text-teal-deep' : 'text-teal'}`}
              />
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Authors — real data, in place of the old fabricated reviewer card. */}
        {(paper.author_list || centers.length > 0) && (
          <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="text-[10.5px] mono-stat text-ink/55">AUTHORS</div>
              <span className="text-[9.5px] mono-stat text-ink/40">
                {paper.authors_count || 0} &middot; {paper.centers_count || 0} CENTRES
              </span>
            </div>

            {paper.author_list && (
              <p className="text-[12.5px] text-ink-soft leading-[1.6] mb-3">{paper.author_list}</p>
            )}

            {centers.length > 0 && (
              <ul className="space-y-1.5 pt-3 border-t border-ink/10">
                {centers.map((c, i) => (
                  <li key={`${i}-${c.slice(0, 20)}`} className="flex items-start gap-2">
                    <Icon icon="lucide:building-2" className="text-[11px] text-teal mt-1 shrink-0" />
                    <span className="text-[11.5px] text-ink/60 leading-[1.45]">{c}</span>
                  </li>
                ))}
              </ul>
            )}

            {paper.reviewer && (
              <div className="mt-3 pt-3 border-t border-ink/10">
                <div className="text-[9.5px] mono-stat text-ink/45 mb-1">EDITOR / REVIEWER</div>
                <p className="text-[12px] text-ink-soft">{paper.reviewer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
