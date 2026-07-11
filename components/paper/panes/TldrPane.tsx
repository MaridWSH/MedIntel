'use client';

import { useState } from 'react';
import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function TldrPane({ paper }: { paper: Paper }) {
  const [saved, setSaved] = useState(false);

  // TLDR from backend
  const tldrText = paper.tldr || paper.detailed_summary || 'No summary available.';

  // PICO from backend
  const pico = paper.pico_summary || {};
  const picoEntries = Object.entries(pico).slice(0, 4);

  // Meta data from backend
  const processingTime = paper.processing_time?.toFixed(1) || '0.4';
  const studyType = paper.study_type || 'other';
  const specialty = paper.specialty_tags?.[0] || 'Clinical Research';
  const hasErrors = paper.has_errors || false;

  // Build PICO display
  const picoDisplay = [
    { letter: 'P', label: 'POPULATION', key: 'population' },
    { letter: 'I', label: 'INTERVENTION', key: 'intervention' },
    { letter: 'C', label: 'COMPARATOR', key: 'comparator' },
    { letter: 'O', label: 'OUTCOME', key: 'outcome' },
  ];

  const getPicoValue = (key: string) => {
    const value = pico[key];
    return value ? String(value) : 'Not specified';
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 01 &middot; STRUCTURED SUMMARY &middot; {processingTime}s
        </div>
        <button 
          onClick={() => {
            // Trace to source - open DOI
            const url = paper.doi ? `https://doi.org/${paper.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className="text-[10.5px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1"
        >
          <Icon icon="lucide:scan-eye" className="text-[12px]" />
          TRACE TO SOURCE
        </button>
      </div>

      <article className="relative bg-paper-warm/50 border border-ink/10 rounded-3xl p-7 md:p-10 overflow-hidden">
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-teal/8 blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-6 serif text-[120px] leading-none text-teal/15 select-none">&ldquo;</div>
        <div className="relative">
          <div className="serif-body text-[20px] md:text-[24px] leading-[1.4] text-ink-soft max-w-[640px] mb-6">
            {tldrText}
          </div>

          {/* PICO Summary */}
          {picoEntries.length > 0 ? (
            <>
              <div className="h-px bg-ink/10 my-7" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                {picoDisplay.map(({ letter, label, key }) => {
                  const value = getPicoValue(key);
                  if (value === 'Not specified') return null;
                  return (
                    <div key={letter} className="border-l-2 border-teal pl-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9.5px] mono-stat text-teal-deep">{letter}</span>
                        <span className="text-[12.5px] font-semibold text-ink">{label}</span>
                      </div>
                      <div className="text-[13.5px] text-ink-soft leading-[1.55]">{value}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-ink/[0.03] border border-ink/10">
              <p className="text-[13px] text-ink/40 italic">No PICO summary available.</p>
            </div>
          )}
        </div>
      </article>

      {/* Synthesis meta strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { 
            label: 'SYNTHESISED', 
            icon: 'lucide:clock', 
            value: `${processingTime}s` 
          },
          { 
            label: 'SOURCES', 
            icon: 'lucide:scroll-text', 
            value: studyType 
          },
          { 
            label: 'VALIDATED BY', 
            icon: 'lucide:user-round-check', 
            value: hasErrors ? 'Review Needed' : 'AI Agent' 
          },
          { 
            label: 'CME ELIGIBLE', 
            icon: 'lucide:award', 
            value: specialty 
          },
        ].map((item) => (
          <div key={item.label} className="bg-paper-warm/40 border border-ink/10 rounded-2xl p-4">
            <div className="text-[9.5px] mono-stat text-ink/45 mb-1.5">{item.label}</div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft font-medium">
              <Icon icon={item.icon} className="text-[14px] text-teal" />
              <span>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}