'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import TabNav from './TabNav';
import PaperSidebar from './PaperSidebar';
import TldrPane from './panes/TldrPane';
import MindMapPane from './panes/MindMapPane';
import InfographicPane from './panes/InfographicPane';
import AppraisalPane from './panes/AppraisalPane';
import RelevancePane from './panes/RelevancePane';
import type { Paper } from '../../lib/papers/types';

export default function PaperDetailView({ paper }: { paper: Paper }) {
  const [activeTab, setActiveTab] = useState('tldr');
  const [saved, setSaved] = useState(false);

  return (
    <main className="relative bg-paper">
      <div className="max-w-[1380px] mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: Paper detail (col-span-8) */}
          <div className="col-span-12 lg:col-span-8 min-w-0">
            {/* Breadcrumb + meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 text-[11px] mono-stat text-ink/55 min-w-0">
                <a href="#" className="text-ink/55 hover:text-teal-deep">SEARCH</a>
                <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                <span className="text-ink-soft">CARDIOLOGY</span>
                <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                <span className="text-ink truncate">{paper.journal} {paper.citation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="w-9 h-9 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center"
                  aria-label="Save"
                  onClick={() => setSaved(!saved)}
                >
                  <Icon icon="lucide:bookmark" className={`text-[16px] ${saved ? 'text-teal-deep' : 'text-ink-soft'}`} />
                </button>
                <button className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
                  <Icon icon="lucide:share-2" className="text-[14px] text-teal" />
                  <span className="hidden md:inline">Share</span>
                </button>
                <button className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
                  <Icon icon="lucide:bell" className="text-[14px] text-teal" />
                  <span className="hidden md:inline">Follow topic</span>
                </button>
              </div>
            </div>

            {/* Title + meta + badges */}
            <header className="pb-7 border-b border-ink/10">
              <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] mono-stat text-ink/55">
                <span className="text-ink-soft font-semibold">{paper.journal}</span>
                <span className="text-ink/25">&middot;</span>
                <span className="tnum">{paper.citation}</span>
                <span className="text-ink/25">&middot;</span>
                <span>DOI {paper.doi}</span>
                <span className="text-ink/25">&middot;</span>
                <span>{paper.centers} centers &middot; {paper.authors} authors</span>
              </div>
              <h1 className="display text-[34px] md:text-[44px] tracking-[-0.02em] max-w-[760px] mb-3">
                {paper.title}
              </h1>
              <p className="text-[13px] text-ink/60 italic mb-5">{paper.authorList}</p>

              <div className="flex flex-wrap items-center gap-2">
                {paper.validated && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-paper">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-bright" />
                    <span className="text-[10.5px] mono-stat font-semibold tracking-wider">VALIDATED</span>
                    <Icon icon="lucide:badge-check" className="text-[13px] text-teal-bright" />
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-ink/15 bg-paper-warm/60">
                  <Icon icon="lucide:user-round-check" className="text-[12px] text-teal" />
                  <span className="text-[11px] text-ink-soft font-medium">{paper.reviewer.name} &middot; Cardiology</span>
                </div>

                <div className="w-px h-6 bg-ink/12 mx-1" />

                <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink text-paper">
                  <span className="text-[10.5px] mono-stat">HR</span>
                  <span className="text-[11px] mono-stat text-paper/60">=</span>
                  <span className="text-[12px] mono-stat font-semibold">{paper.stats.hr}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink/8 border border-ink/10">
                  <span className="text-[10.5px] mono-stat text-ink/55">95% CI</span>
                  <span className="text-[12px] mono-stat font-medium text-ink-soft">{paper.stats.ci}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink/8 border border-ink/10">
                  <span className="text-[10.5px] mono-stat text-ink/55">P</span>
                  <span className="text-[12px] mono-stat font-medium text-ink-soft">{paper.stats.pValue}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-teal-deep/10 border border-teal-deep/20">
                  <span className="text-[10.5px] mono-stat text-teal-deep">GRADE {paper.stats.grade}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-amber-bg border border-amber-ink/20">
                  <Icon icon="lucide:check-circle-2" className="text-[12px] text-amber-ink" />
                  <span className="text-[10.5px] mono-stat text-amber-ink">PEER REVIEWED</span>
                </div>
              </div>
            </header>

            {/* Tab Navigation */}
            <TabNav active={activeTab} onChange={setActiveTab} />

            {/* Panes */}
            <div className="mt-7">
              {activeTab === 'tldr' && <TldrPane paper={paper} />}
              {activeTab === 'mindmap' && <MindMapPane paper={paper} />}
              {activeTab === 'infographic' && <InfographicPane paper={paper} />}
              {activeTab === 'appraisal' && <AppraisalPane paper={paper} />}
              {activeTab === 'relevance' && <RelevancePane paper={paper} />}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <PaperSidebar paper={paper} />
        </div>
      </div>
    </main>
  );
}
