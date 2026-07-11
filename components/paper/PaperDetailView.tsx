'use client';

import { useState, useEffect } from 'react';
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
  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load saved/follow states from localStorage on mount
  useEffect(() => {
    const savedPapers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
    const followedTopics = JSON.parse(localStorage.getItem('followedTopics') || '[]');
    setSaved(savedPapers.includes(paper.id));
    setFollowing(followedTopics.some((t: any) => t.id === paper.id));
  }, [paper.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 1. SAVE / BOOKMARK
  const toggleSave = () => {
    const savedPapers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
    let updated;
    if (saved) {
      updated = savedPapers.filter((id: string) => id !== paper.id);
      showToast('Removed from saved papers');
    } else {
      updated = [...savedPapers, paper.id];
      showToast('Saved to your collection');
    }
    localStorage.setItem('savedPapers', JSON.stringify(updated));
    setSaved(!saved);
  };

  // 2. SHARE - Copy link to clipboard
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link copied to clipboard!');
    }
  };

  // 3. FOLLOW TOPIC
  const toggleFollow = () => {
    const followedTopics = JSON.parse(localStorage.getItem('followedTopics') || '[]');
    let updated;
    if (following) {
      updated = followedTopics.filter((t: any) => t.id !== paper.id);
      showToast('Unfollowed this topic');
    } else {
      updated = [
        ...followedTopics,
        {
          id: paper.id,
          title: paper.title,
          specialty: paper.specialty_tags?.[0] || '',
          followedAt: new Date().toISOString(),
        },
      ];
      showToast('You\'ll get updates on this topic');
    }
    localStorage.setItem('followedTopics', JSON.stringify(updated));
    setFollowing(!following);
  };

  const picoEntries = paper.pico_summary
    ? Object.entries(paper.pico_summary).slice(0, 3)
    : [];

  const isValidated = !paper.has_errors;

  return (
    <main className="relative bg-paper">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-ink text-paper rounded-xl shadow-xl text-[13px] font-medium animate-bounce-in flex items-center gap-2">
          <Icon icon="lucide:check-circle-2" className="text-teal-bright text-[16px]" />
          {toast}
        </div>
      )}

      <div className="max-w-[1380px] mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 min-w-0">
            {/* Breadcrumb + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 text-[11px] mono-stat text-ink/55 min-w-0">
                <a href="/search" className="text-ink/55 hover:text-teal-deep">SEARCH</a>
                <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                <span className="text-ink-soft">{paper.study_type?.toUpperCase()}</span>
                <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                <span className="text-ink truncate">
                  {paper.specialty_tags?.slice(0, 2).join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* SAVE BUTTON */}
                <button
                  className={`w-9 h-9 rounded-lg border inline-flex items-center justify-center transition-all duration-200 ${
                    saved
                      ? 'border-teal-deep bg-teal-deep/10 text-teal-deep'
                      : 'border-ink/15 hover-tint text-ink-soft'
                  }`}
                  aria-label={saved ? 'Unsave' : 'Save'}
                  onClick={toggleSave}
                  title={saved ? 'Saved' : 'Save paper'}
                >
                  <Icon
                    icon={saved ? 'lucide:bookmark-check' : 'lucide:bookmark'}
                    className="text-[16px]"
                  />
                </button>

                {/* SHARE BUTTON */}
                <button
                  onClick={handleShare}
                  className="h-9 px-3 rounded-lg border border-ink/15 hover-tint inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-soft transition-all active:scale-95"
                  title="Copy link"
                >
                  <Icon icon="lucide:share-2" className="text-[14px] text-teal" />
                  <span className="hidden md:inline">Share</span>
                </button>

                {/* FOLLOW TOPIC BUTTON */}
                <button
                  onClick={toggleFollow}
                  className={`h-9 px-3 rounded-lg border inline-flex items-center gap-1.5 text-[12px] font-medium transition-all duration-200 active:scale-95 ${
                    following
                      ? 'border-teal-deep bg-teal-deep/10 text-teal-deep'
                      : 'border-ink/15 hover-tint text-ink-soft'
                  }`}
                  title={following ? 'Following topic' : 'Follow topic'}
                >
                  <Icon
                    icon={following ? 'lucide:bell-ring' : 'lucide:bell'}
                    className={`text-[14px] ${following ? 'text-teal-deep' : 'text-teal'}`}
                  />
                  <span className="hidden md:inline">
                    {following ? 'Following' : 'Follow topic'}
                  </span>
                </button>
              </div>
            </div>

            {/* Title + meta + badges */}
            <header className="pb-7 border-b border-ink/10">
              <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] mono-stat text-ink/55">
                <span className="text-ink-soft font-semibold">{paper.study_type}</span>
                <span className="text-ink/25">&middot;</span>
                <span>{paper.specialty_tags?.join(', ')}</span>
                <span className="text-ink/25">&middot;</span>
                <span>ID {paper.id}</span>
                <span className="text-ink/25">&middot;</span>
                <span>{paper.processing_time?.toFixed(2)}s processing</span>
              </div>

              <h1 className="display text-[34px] md:text-[44px] tracking-[-0.02em] max-w-[760px] mb-3">
                {paper.title}
              </h1>

              <p className="text-[13px] text-ink/60 italic mb-5">
                {paper.detailed_summary?.slice(0, 120)}...
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {isValidated && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-paper">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-bright" />
                    <span className="text-[10.5px] mono-stat font-semibold tracking-wider">VALIDATED</span>
                    <Icon icon="lucide:badge-check" className="text-[13px] text-teal-bright" />
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-ink/15 bg-paper-warm/60">
                  <Icon icon="lucide:user-round-check" className="text-[12px] text-teal" />
                  <span className="text-[11px] text-ink-soft font-medium">{paper.study_type}</span>
                </div>

                <div className="w-px h-6 bg-ink/12 mx-1" />

                {picoEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink/8 border border-ink/10"
                  >
                    <span className="text-[10.5px] mono-stat text-ink/55">
                      {key.toUpperCase()}
                    </span>
                    <span className="text-[12px] mono-stat font-medium text-ink-soft truncate max-w-[120px]">
                      {String(value).slice(0, 15)}
                    </span>
                  </div>
                ))}

                <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-amber-bg border border-amber-ink/20">
                  <Icon icon="lucide:check-circle-2" className="text-[12px] text-amber-ink" />
                  <span className="text-[10.5px] mono-stat text-amber-ink">PEER REVIEWED</span>
                </div>
              </div>
            </header>

            <TabNav active={activeTab} onChange={setActiveTab} />

            <div className="mt-7">
              {activeTab === 'tldr' && <TldrPane paper={paper} />}
              {activeTab === 'mindmap' && <MindMapPane paper={paper} />}
              {activeTab === 'infographic' && <InfographicPane paper={paper} />}
              {activeTab === 'appraisal' && <AppraisalPane paper={paper} />}
              {activeTab === 'relevance' && <RelevancePane paper={paper} />}
            </div>
          </div>

          <PaperSidebar paper={paper} />
        </div>
      </div>
    </main>
  );
}