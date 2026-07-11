'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import type { Paper } from '../../lib/papers/types';

export default function PaperSidebar({ paper }: { paper: Paper }) {
  const [activeSection, setActiveSection] = useState('1');
  const [activeCitation, setActiveCitation] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Sections from backend or fallback
  const sections = paper.sections || [
    { id: '1', label: 'Abstract', range: '1-2' },
    { id: '2', label: 'Introduction', range: '3-5' },
    { id: '3', label: 'Results', range: '6-10' },
    { id: '4', label: 'Discussion', range: '11-13' },
    { id: '5', label: 'Conclusion', range: '14' },
  ];

  // Excerpt from backend or fallback
  const excerpt = paper.excerpt || paper.tldr || 'No excerpt available.';

  // Citations from backend
  const citations = paper.citations || {};
  const citationKeys = Object.keys(citations);

  // Reviewer from backend or fallback
  const reviewer = paper.reviewer || {
    name: 'AI Reviewer',
    specialty: paper.specialty_tags?.[0] || 'Clinical Research',
    institution: 'Claritas AI',
    years: '—',
    papers: '—',
    score: '—',
    member: 'Yes',
  };

  // PDF URL
  const pdfUrl = paper.doi 
    ? `https://doi.org/${paper.doi}`
    : `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.id}/pdf/`;

  // Paper web URL
  const paperUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : `https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`;

  // Listen for activateSection event from MindMap
  useEffect(() => {
    const handleActivateSection = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.sectionId) {
        setActiveSection(customEvent.detail.sectionId);
      }
    };

    window.addEventListener('activateSection', handleActivateSection);
    return () => window.removeEventListener('activateSection', handleActivateSection);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Scroll to section in main content if exists
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReadSection = () => {
    // Open PDF at specific section
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      // Try to open with section anchor
      const sectionAnchor = section.label.toLowerCase().replace(/\s+/g, '-');
      const url = `${paperUrl}#${sectionAnchor}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenPdf = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCitation = () => {
    if (activeCitation && citations[activeCitation]) {
      const blob = new Blob([citations[activeCitation]], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.id}-${activeCitation.toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyCitation = () => {
    if (activeCitation && citations[activeCitation]) {
      navigator.clipboard.writeText(citations[activeCitation]).then(() => {
        alert('Citation copied to clipboard!');
      });
    }
  };

  const handleDownloadAllCitations = () => {
    setDownloading(true);
    const allCitations = Object.entries(citations)
      .map(([format, citation]) => `${format}:\n${citation}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([allCitations], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-citations.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1000);
  };

  // Set first citation as active when available
  useEffect(() => {
    if (citationKeys.length > 0 && !activeCitation) {
      setActiveCitation(citationKeys[0]);
    }
  }, [citationKeys, activeCitation]);

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
            <span className="text-[9.5px] mono-stat text-paper/45">{paper.study_type?.toUpperCase() || 'PDF'}</span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="serif text-[16px] tracking-tight leading-tight">
              {paper.title?.slice(0, 32)}&hellip;
            </h3>
            <button
              onClick={handleOpenPdf}
              className="ml-auto text-[10px] mono-stat text-teal-bright hover:underline shrink-0"
            >
              OPEN PDF &nearr;
            </button>
          </div>
        </div>

        {/* Section navigator */}
        <nav className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSectionClick(s.id)}
              data-section-id={s.id}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                activeSection === s.id
                  ? 'bg-ink text-paper'
                  : 'hover-tint group'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[9.5px] mono-stat w-6 ${
                  activeSection === s.id ? 'text-teal-bright' : 'text-ink/40'
                }`}>
                  {s.id}
                </span>
                <span className={`text-[13px] font-medium ${
                  activeSection === s.id ? 'text-paper' : 'text-ink-soft'
                }`}>
                  {s.label}
                </span>
              </div>
              <span className={`text-[10.5px] mono-stat ${
                activeSection === s.id ? 'text-paper/60' : 'text-ink/40 group-hover:text-teal-deep'
              }`}>
                {s.range}
              </span>
            </button>
          ))}
        </nav>

        {/* Active section preview */}
        <div className="rounded-3xl bg-paper-warm border border-ink/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
              <Icon icon="lucide:book-open" className="text-[13px] text-teal" />
              &sect;{activeSection} {sections.find(s => s.id === activeSection)?.label?.toUpperCase()}
            </div>
            <span className="text-[9.5px] mono-stat text-ink/40">
              p.{sections.find(s => s.id === activeSection)?.range}
            </span>
          </div>
          <p className="serif-body text-[14px] text-ink-soft leading-[1.55] italic mb-4 min-h-[120px]">
            {excerpt}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReadSection}
              className="flex-1 h-9 rounded-lg bg-ink text-paper text-[11px] mono-stat font-semibold inline-flex items-center justify-center gap-1.5 btn-primary"
            >
              <Icon icon="lucide:book-open" className="text-[13px] text-teal-bright" />
              READ SECTION
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(excerpt)}
              className="w-9 h-9 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" 
              aria-label="Copy"
            >
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
            <span className="text-[9.5px] mono-stat text-ink/40">{citationKeys.length || 0} STYLES</span>
          </div>

          {citationKeys.length > 0 ? (
            <>
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

              <div className="bg-ink rounded-xl p-3.5 text-paper/85 text-[11px] mono leading-[1.55] overflow-x-auto max-h-[100px] overflow-y-auto">
                {activeCitation && citations[activeCitation]}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={handleDownloadCitation}
                  disabled={!activeCitation}
                  className="flex-1 h-9 rounded-lg bg-teal-deep text-paper text-[11px] mono-stat font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Icon icon="lucide:download" className="text-[13px]" />
                  DOWNLOAD
                </button>
                <button 
                  onClick={handleCopyCitation}
                  disabled={!activeCitation}
                  className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center text-[11px] mono-stat font-semibold text-ink-soft disabled:opacity-50"
                >
                  <Icon icon="lucide:copy" className="text-[13px] text-teal" />
                </button>
                <button 
                  onClick={handleDownloadAllCitations}
                  disabled={downloading}
                  className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center text-[11px] mono-stat font-semibold text-ink-soft disabled:opacity-50"
                  title="Download all formats"
                >
                  <Icon icon={downloading ? 'lucide:loader-2' : 'lucide:download-cloud'} className={`text-[13px] text-teal ${downloading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-[13px] text-ink/40 mb-3">No citation formats available.</p>
              <button 
                onClick={() => {
                  // Generate basic citation from available data
                  const basicCitation = `${(paper as any).author_list || 'Authors'}. (${new Date().getFullYear()}). ${paper.title}. ${paper.journal || 'Journal'}. https://doi.org/${paper.doi || paper.id}`;
                  navigator.clipboard.writeText(basicCitation).then(() => {
                    alert('Basic citation copied!');
                  });
                }}
                className="h-8 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[11px] mono-stat text-ink-soft"
              >
                <Icon icon="lucide:copy" className="text-[12px] text-teal" />
                COPY BASIC CITE
              </button>
            </div>
          )}
        </div>

        {/* Reviewer card */}
        <div className="rounded-3xl bg-paper-warm/50 border border-ink/10 p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3.5">REVIEWED BY CLARITAS</div>
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-ink text-paper flex items-center justify-center serif text-[18px] font-medium">
                {reviewer.name?.charAt(0) || 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-deep border-2 border-paper-warm flex items-center justify-center">
                <Icon icon="lucide:check" className="text-[10px] text-paper" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink leading-tight">{reviewer.name}</div>
              <div className="text-[11.5px] text-ink-soft mb-1">{reviewer.specialty}</div>
              <div className="flex items-center gap-1.5 text-[10px] mono-stat text-ink/45">
                <Icon icon="lucide:building-2" className="text-[11px] text-teal" />
                {reviewer.institution} &middot; {reviewer.years} yrs
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-4 pt-3.5 border-t border-ink/10">
            <div>
              <div className="serif text-[18px] text-ink">{reviewer.papers}</div>
              <div className="text-[9px] mono-stat text-ink/45">PAPERS</div>
            </div>
            <div>
              <div className="serif text-[18px] text-ink">{reviewer.score}</div>
              <div className="text-[9px] mono-stat text-ink/45">SCORE</div>
            </div>
            <div>
              <div className="serif text-[18px] text-teal-deep">{reviewer.member}</div>
              <div className="text-[9px] mono-stat text-ink/45">MEMBER</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}