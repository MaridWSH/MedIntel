'use client';

import Icon from '../../ui/Icon';
import type { FullTextSection, Paper } from '../../../lib/papers/types';

/**
 * The source paper, rendered as anchored sections.
 *
 * ~52% of the catalogue has no AI summary but does have full text on disk, so
 * this is often the only real content a paper has. Sections are fetched on the
 * server and passed in. Their ids double as scroll anchors: PaperSidebar jumps
 * to `#section-{id}`.
 *
 * Inline renderer rather than a markdown dependency — the pipeline emits a small,
 * known subset (bold, italic, links, tables, lists, h4) and papers are table-heavy.
 */

/** Render **bold**, *italic*, and [links](url) inside one line of text. */
function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function renderInline(text: string, keyPrefix: string) {
  const pattern = /(\*\*[^*]+\*\*|(?<!\*)\*(?!\*)[^*]+\*(?!\*)|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeExternalUrl(link[2]);
      if (!href) return <span key={key}>{link[1]}</span>;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-deep hover:underline"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

const splitRow = (row: string) =>
  row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

const isTableDivider = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');

/** Turn a section's markdown body into blocks. */
function renderBody(content: string, sectionId: string) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let paragraph: string[] = [];
  let list: string[] = [];
  let table: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      blocks.push(
        <p
          key={`${sectionId}-p-${blocks.length}`}
          className="serif-body text-[15.5px] leading-[1.75] text-ink-soft mb-4"
        >
          {renderInline(text, `${sectionId}-p-${blocks.length}`)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`${sectionId}-ul-${blocks.length}`} className="mb-4 space-y-1.5 pl-1">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
            <span className="serif-body text-[15.5px] leading-[1.7] text-ink-soft">
              {renderInline(item, `${sectionId}-li-${i}`)}
            </span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !isTableDivider(r)).map(splitRow);
    const [head, ...body] = rows;
    if (head) {
      blocks.push(
        <div key={`${sectionId}-t-${blocks.length}`} className="mb-5 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-ink/[0.04]">
                {head.map((cell, i) => (
                  <th key={i} className="text-left font-semibold text-ink px-3 py-2 border-b border-ink/10 whitespace-nowrap">
                    {renderInline(cell, `${sectionId}-th-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="border-b border-ink/[0.06] last:border-0">
                  {row.map((cell, i) => (
                    <td key={i} className="px-3 py-2 text-ink-soft align-top">
                      {renderInline(cell, `${sectionId}-td-${r}-${i}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }
    table = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      flushParagraph();
      flushList();
      table.push(trimmed);
      continue;
    }
    if (table.length) flushTable();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushAll();
      blocks.push(
        <h5
          key={`${sectionId}-h-${blocks.length}`}
          className="text-[14px] font-semibold text-ink mt-5 mb-2"
        >
          {trimmed.slice(5)}
        </h5>,
      );
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushAll();
  return blocks;
}

function Section({ section }: { section: FullTextSection }) {
  const Heading = section.level === 2 ? 'h3' : 'h4';
  return (
    /*
     * scroll-mt clears the sticky header — without it, clicking a section in the
     * sidebar lands with the heading hidden underneath the nav.
     */
    <section id={`section-${section.id}`} className="scroll-mt-[140px]">
      <Heading
        className={
          section.level === 2
            ? 'serif text-[24px] tracking-tight text-ink mb-4 pb-2 border-b border-ink/10'
            : 'serif text-[18px] tracking-tight text-ink mb-3 mt-2'
        }
      >
        {section.title}
      </Heading>
      {renderBody(section.content, section.id)}
    </section>
  );
}

interface FullTextPaneProps {
  paper: Paper;
  sections: FullTextSection[];
}

export default function FullTextPane({ paper, sections }: FullTextPaneProps) {
  const sourceUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.id}/`;

  if (sections.length === 0) {
    return (
      <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
        <Icon icon="lucide:file-x" className="text-[48px] text-ink/20 mx-auto mb-4" />
        <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">Full text unavailable</h3>
        <p className="text-[14px] text-ink/40 max-w-[420px] mx-auto mb-5">
          We don&rsquo;t hold the text of this paper. You can still read it at the source.
        </p>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-ink text-paper text-[11px] mono-stat font-semibold"
        >
          <Icon icon="lucide:external-link" className="text-[13px] text-teal-bright" />
          OPEN THE PAPER
        </a>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <Icon icon="lucide:file-text" className="text-[13px] text-teal" />
          SOURCE TEXT &middot; {sections.length} SECTIONS
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10.5px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1"
        >
          <Icon icon="lucide:external-link" className="text-[12px]" />
          PUBLISHER VERSION
        </a>
      </div>

      <article className="bg-paper border border-ink/10 rounded-3xl p-7 md:p-10">
        <div className="space-y-9 max-w-[760px]">
          {sections.map((s) => (
            <Section key={s.id} section={s} />
          ))}
        </div>
      </article>
    </section>
  );
}
