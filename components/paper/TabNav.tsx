'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  num: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'tldr', num: '01', label: 'TLDR' },
  { id: 'mindmap', num: '02', label: 'Mind map' },
  { id: 'infographic', num: '03', label: 'Infographic' },
  { id: 'appraisal', num: '04', label: 'Critical appraisal' },
  { id: 'relevance', num: '05', label: 'Clinical relevance' },
];

interface TabNavProps {
  active: string;
  onChange: (id: string) => void;
}

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="mt-7 sticky top-[68px] z-30 -mx-2 px-2 py-2 bg-paper rounded-2xl">
      <div className="flex gap-1 overflow-x-auto" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 h-10 rounded-[12px] text-[12.5px] font-medium transition-all ${
              active === t.id ? 'tab-active' : 'tab-idle'
            }`}
          >
            <span className="tab-num text-[9.5px] mono-stat">{t.num}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { tabs };
export type { Tab };
