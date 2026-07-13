'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon';
import TabNav from './TabNav';
import PaperSidebar from './PaperSidebar';
import TldrPane from './panes/TldrPane';
import FullTextPane from './panes/FullTextPane';
import MindMapPane from './panes/MindMapPane';
import InfographicPane from './panes/InfographicPane';
import AppraisalPane from './panes/AppraisalPane';
import RelevancePane from './panes/RelevancePane';
import { savePaper, unsavePaper, isPaperSaved } from '../../lib/api';
import type { FullText, Paper } from '../../lib/papers/types';

interface PaperDetailViewProps {
  paper: Paper;
  /** Server-fetched; null when we hold no text for this paper. */
  fullText: FullText | null;
}

export default function PaperDetailView({ paper, fullText }: PaperDetailViewProps) {
  // The pipeline produced no summary for ~52% of papers. When that's the case the
  // TLDR tab has nothing to show, so open on the source text instead.
  const hasSummary = Boolean(paper.tldr?.trim() || paper.detailed_summary?.trim());
  const sections = fullText?.available ? fullText.sections : [];

  const [activeTab, setActiveTab] = useState(hasSummary ? 'tldr' : 'fulltext');
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  // Load saved state from backend API
  useEffect(() => {
    isPaperSaved(paper.id)
      .then(setSaved)
      .catch(() => setSaved(false));
  }, [paper.id]);

  /**
   * Sidebar → full-text tab → scroll to the section.
   *
   * The scroll runs in an effect rather than straight after setActiveTab: when
   * the jump also switches tabs, FullTextPane hasn't mounted yet and the anchor
   * doesn't exist. Recording the target and scrolling once the pane is committed
   * is deterministic; scheduling a callback off the click is a race.
   */
  const goToSection = useCallback((sectionId: string) => {
    setActiveTab('fulltext');
    setPendingSection(sectionId);
  }, []);

  useEffect(() => {
    if (activeTab !== 'fulltext' || !pendingSection) return;
    document
      .getElementById(`section-${pendingSection}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPendingSection(null);
  }, [activeTab, pendingSection]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 1. SAVE / BOOKMARK — calls backend API
  const toggleSave = async () => {
    try {
      if (saved) {
        await unsavePaper(paper.id);
        showToast('Removed from saved papers');
      } else {
        await savePaper(paper.id);
        showToast('Saved to your collection');
      }
      setSaved(!saved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
      showToast('Failed to update — please try again');
    }
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

  // `verification.passed` means the summary matched the source paper under our
  // fidelity check. It says nothing about the study's own quality, and it is not
  // a peer-review status — do not relabel it as either.
  const fidelityPassed = paper.verification?.passed ?? false;

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
                {paper.study_type && (
                  <>
                    <span className="text-ink-soft font-semibold">{paper.study_type}</span>
                    <span className="text-ink/25">&middot;</span>
                  </>
                )}
                {paper.specialty_tags?.length > 0 && (
                  <>
                    <span>{paper.specialty_tags.join(', ')}</span>
                    <span className="text-ink/25">&middot;</span>
                  </>
                )}
                <span>{paper.id}</span>
              </div>

              <h1 className="display text-[34px] md:text-[44px] tracking-[-0.02em] max-w-[760px] mb-3">
                {paper.title}
              </h1>

              {/* Real provenance, rather than a truncated slice of the summary. */}
              <p className="text-[13px] text-ink/60 mb-5 max-w-[720px] leading-[1.5]">
                {paper.journal && <span className="italic">{paper.journal}</span>}
                {paper.journal && paper.authors_count > 0 && <span className="text-ink/30"> &middot; </span>}
                {paper.authors_count > 0 && (
                  <span>
                    {paper.authors_count} author{paper.authors_count === 1 ? '' : 's'}
                    {paper.centers_count > 0 && `, ${paper.centers_count} centre${paper.centers_count === 1 ? '' : 's'}`}
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/*
                  AI-generated is the single most important thing a clinician can know
                  about this page. It leads, and it is not dressed up as a credential.
                */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-paper">
                  <Icon icon="lucide:bot" className="text-[13px] text-teal-bright" />
                  <span className="text-[10.5px] mono-stat font-semibold tracking-wider">AI SUMMARY</span>
                </div>

                {paper.verification && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${
                      fidelityPassed
                        ? 'border-teal-deep/30 bg-teal-deep/[0.07]'
                        : 'border-amber-ink/30 bg-amber-bg/60'
                    }`}
                    title="How closely our summary matches the source paper. Not a quality rating of the study."
                  >
                    <Icon
                      icon={fidelityPassed ? 'lucide:shield-check' : 'lucide:shield-alert'}
                      className={`text-[12px] ${fidelityPassed ? 'text-teal-deep' : 'text-amber-ink'}`}
                    />
                    <span
                      className={`text-[10.5px] mono-stat font-medium ${
                        fidelityPassed ? 'text-teal-deep' : 'text-amber-ink'
                      }`}
                    >
                      FIDELITY {Math.round(paper.verification.score * 100)}%
                    </span>
                  </div>
                )}

                {picoEntries.length > 0 && <div className="w-px h-6 bg-ink/12 mx-1" />}

                {picoEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-ink/[0.05] border border-ink/10 max-w-[220px]"
                  >
                    <span className="text-[10.5px] mono-stat text-ink/55 shrink-0">
                      {key.toUpperCase()}
                    </span>
                    <span className="text-[12px] font-medium text-ink-soft truncate">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Standing disclaimer — this is a medical product. */}
              {hasSummary ? (
                <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-bg/40 border border-amber-ink/25">
                  <Icon icon="lucide:alert-triangle" className="text-[15px] text-amber-ink shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-ink-soft leading-[1.5]">
                    This summary was generated by AI from a single paper. It has not been reviewed by a
                    clinician and is not clinical advice. Verify against the source before acting on it.
                  </p>
                </div>
              ) : (
                <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-ink/[0.04] border border-ink/12">
                  <Icon icon="lucide:info" className="text-[15px] text-teal shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-ink-soft leading-[1.5]">
                    We haven&rsquo;t summarised this paper &mdash; our pipeline didn&rsquo;t complete on it.
                    The full text is below, and the AI tabs are empty by design rather than by accident.
                  </p>
                </div>
              )}
            </header>

            <TabNav active={activeTab} onChange={setActiveTab} />

            <div className="mt-7">
              {activeTab === 'tldr' && <TldrPane paper={paper} />}
              {activeTab === 'fulltext' && <FullTextPane paper={paper} sections={sections} />}
              {activeTab === 'mindmap' && <MindMapPane paper={paper} />}
              {activeTab === 'infographic' && <InfographicPane paper={paper} />}
              {activeTab === 'appraisal' && <AppraisalPane paper={paper} />}
              {activeTab === 'relevance' && <RelevancePane paper={paper} />}
            </div>
          </div>

          <PaperSidebar paper={paper} sections={sections} onSectionClick={goToSection} />
        </div>
      </div>
    </main>
  );
}