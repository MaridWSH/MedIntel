'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';

interface Tab {
  id: string;
  num: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'tldr', num: '01', label: 'Summary' },
  { id: 'fulltext', num: '02', label: 'Full text' },
  { id: 'mindmap', num: '03', label: 'Mind map' },
  { id: 'infographic', num: '04', label: 'Infographic' },
  // "Critical appraisal" oversold this tab: it reports summary-vs-source
  // fidelity, not a methodological appraisal of the study.
  { id: 'appraisal', num: '05', label: 'Fidelity' },
  { id: 'relevance', num: '06', label: 'Clinical relevance' },
];

const primaryTabIds = ['tldr', 'fulltext', 'appraisal'];
const primaryTabs = tabs.filter((tab) => primaryTabIds.includes(tab.id));
const toolTabs = tabs.filter((tab) => !primaryTabIds.includes(tab.id));

interface TabNavProps {
  active: string;
  onChange: (id: string) => void;
}

export default function TabNav({ active, onChange }: TabNavProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const activeTool = toolTabs.find((tab) => tab.id === active);

  useEffect(() => {
    if (!toolsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) setToolsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [toolsOpen]);

  const selectTab = (id: string) => {
    onChange(id);
    setToolsOpen(false);
  };

  return (
    <nav aria-label="Paper views" className="mt-7 sticky top-[68px] z-30 -mx-2 px-2 py-2 bg-paper border-y border-ink/8">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1" role="tablist" aria-label="Paper content">
        {primaryTabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`tabpanel-${t.id}`}
            onClick={() => selectTab(t.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 h-10 rounded-md text-[12.5px] font-medium transition-all ${
              active === t.id ? 'tab-active' : 'tab-idle'
            }`}
          >
            <span className="tab-num text-[9.5px] mono-stat">{t.num}</span>
            <span>{t.label}</span>
          </button>
        ))}
        </div>

        <div ref={toolsRef} className="relative ml-auto">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={toolsOpen}
            onClick={() => setToolsOpen((open) => !open)}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-3.5 text-[12.5px] font-medium transition-all ${activeTool ? 'tab-active' : 'tab-idle'}`}
          >
            <Icon icon="lucide:plus" className="text-[13px]" />
            <span className="hidden sm:inline">{activeTool ? activeTool.label : 'Tools'}</span>
            <span className="sm:hidden">Tools</span>
            <Icon icon="lucide:chevron-down" className="text-[12px] opacity-60" />
          </button>

          {toolsOpen && (
            <div
              role="menu"
              aria-label="Additional paper tools"
              className="absolute right-0 top-[calc(100%+0.45rem)] z-40 w-56 overflow-hidden rounded-lg border border-ink/12 bg-paper p-1.5 shadow-[0_18px_45px_-20px_rgba(11,29,42,0.45)]"
            >
              {toolTabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="menuitem"
                  onClick={() => selectTab(tab.id)}
                  className={`flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[12.5px] transition-colors ${active === tab.id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'}`}
                >
                  <span className={`mono text-[10px] ${active === tab.id ? 'text-teal-bright' : 'text-ink/40'}`}>{tab.num}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export { tabs };
export type { Tab };
