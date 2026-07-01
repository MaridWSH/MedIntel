'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import type { Paper } from '../../lib/papers/types';

export default function PaperSidebar({ paper }: { paper: Paper }) {
  const citationKeys = Object.keys(paper.citations);
  const [activeCitation, setActiveCitation] = useState(citationKeys[0]);

  return (
    <aside className="col-span-12 lg:col-span-4 min-w-0">
      <div className="sticky top-[100px] space-y-4">
        {/* Header strip */}
        <div className="rounded-3xl bg-ink text-paper p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-paper/65">
              <Icon icon="lucide:file-text" className="text-[13px] text-teal-bright" />
              ORIGINAL PAPER
            </div>
            <span className="text-[9.5px] mono-stat text-paper/45">14 PAGES &middot; PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="serif text-[16px] tracking-tight leading-tight">
              {paper.title.slice(0, 32)}&hellip;
            </h3>
            <a href="#" className="ml-auto text-[10px] mono-stat text-teal-bright hover:underline shrink-0">
              OPEN PDF &nearr;
            </a>
          </div>
        </div>

        {/* Section navigator */}
        <nav className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-2">
          {paper.sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover-tint group"
            >
              <div className="flex items-center gap-3">
                <span className="text-[9.5px] mono-stat text-ink/40 w-6">{s.id}</span>
                <span className="text-[13px] font-medium text-ink-soft">{s.label}</span>
              </div>
              <span className="text-[10.5px] mono-stat text-ink/40 group-hover:text-teal-deep">{s.range}</span>
            </a>
          ))}
        </nav>

        {/* Active subsection preview */}
        <div className="rounded-3xl bg-paper-warm border border-ink/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
              <Icon icon="lucide:book-open" className="text-[13px] text-teal" />
              &sect;3 RESULTS &middot; 3.2 PRIMARY OUTCOME
            </div>
            <span className="text-[9.5px] mono-stat text-ink/40">p.108</span>
          </div>
          <p className="serif-body text-[14px] text-ink-soft leading-[1.55] italic mb-4 min-h-[120px]">
            {paper.excerpt}
          </p>
          <div className="flex items-center gap-2">
            <button className="flex-1 h-9 rounded-lg bg-ink text-paper text-[11px] mono-stat font-semibold inline-flex items-center justify-center gap-1.5 btn-primary">
              <Icon icon="lucide:book-open" className="text-[13px] text-teal-bright" />
              READ SECTION
            </button>
            <button className="w-9 h-9 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" aria-label="Copy">
              <Icon icon="lucide:copy" className="text-[13px] text-ink-soft" />
            </button>
          </div>
        </div>

        {/* Citation export */}
        <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
              <Icon icon="lucide:quote" className="text-[13px] text-teal" />
              CITATION EXPORT
            </div>
            <span className="text-[9.5px] mono-stat text-ink/40">6 STYLES</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {citationKeys.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCitation(c)}
                className={`h-8 px-2.5 rounded-lg text-[10.5px] mono-stat font-semibold transition-all ${
                  activeCitation === c
                    ? 'bg-ink text-paper'
                    : 'border border-ink/15 text-ink-soft hover-tint'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="bg-ink rounded-xl p-3.5 text-paper/85 text-[11px] mono leading-[1.55] overflow-x-auto">
            {paper.citations[activeCitation]}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button className="flex-1 h-9 rounded-lg bg-teal-deep text-paper text-[11px] mono-stat font-semibold inline-flex items-center justify-center gap-1.5 btn-primary">
              <Icon icon="lucide:download" className="text-[13px]" />
              DOWNLOAD
            </button>
            <button className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center text-[11px] mono-stat font-semibold text-ink-soft">
              <Icon icon="lucide:copy" className="text-[13px] text-teal" />
            </button>
          </div>
        </div>

        {/* Reviewer card */}
        <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3.5">REVIEWED BY CLARITAS</div>
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-ink text-paper flex items-center justify-center serif text-[18px] font-medium">
                {paper.reviewer.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-deep border-2 border-paper-warm flex items-center justify-center">
                <Icon icon="lucide:check" className="text-[10px] text-paper" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink leading-tight">{paper.reviewer.name}</div>
              <div className="text-[11.5px] text-ink-soft mb-1">{paper.reviewer.specialty}</div>
              <div className="flex items-center gap-1.5 text-[10px] mono-stat text-ink/45">
                <Icon icon="lucide:building-2" className="text-[11px] text-teal" />
                {paper.reviewer.institution} &middot; {paper.reviewer.years} yrs
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-4 pt-3.5 border-t border-ink/10">
            <div>
              <div className="serif text-[18px] text-ink">{paper.reviewer.papers}</div>
              <div className="text-[9px] mono-stat text-ink/45">PAPERS</div>
            </div>
            <div>
              <div className="serif text-[18px] text-ink">{paper.reviewer.score}</div>
              <div className="text-[9px] mono-stat text-ink/45">SCORE</div>
            </div>
            <div>
              <div className="serif text-[18px] text-teal-deep">{paper.reviewer.member}</div>
              <div className="text-[9px] mono-stat text-ink/45">MEMBER</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
