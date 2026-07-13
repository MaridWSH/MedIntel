"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { listPapers, searchPapers } from '../../lib/papers';
import type { Paper } from '../../lib/papers/types';

const SPECIALTIES = [
  'Cardiology',
  'Endocrinology',
  'Internal Medicine',
  'Oncology',
  'Neurology',
  'Pulmonology',
  'Emergency Medicine',
  'Pediatrics',
];

const STUDY_TYPES = [
  'RCT',
  'systematic_review',
  'cross_sectional',
  'cohort_study',
  'case_control',
  'other',
];

const SORT_OPTIONS = [
  { value: 'id', label: 'Most recent' },
  { value: '-id', label: 'Oldest first' },
];

export default function SearchPage() {
  // ── State ─────────────────────────────────────────────────────────
  const [items, setItems] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filters
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);

  // Filters
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<string[]>([]);
  const [sort, setSort] = useState<'id' | '-id'>('id');

  // Active search query (what was actually submitted) — SEMANTIC SEARCH
  const [activeQuery, setActiveQuery] = useState('');

  // ── Keyword Search State (Client-side filtering on title only) ────
  const [keywordQuery, setKeywordQuery] = useState('');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);
  const [allItems, setAllItems] = useState<Paper[]>([]);

  // Inline search next to sort dropdown
  const [inlineSearchOpen, setInlineSearchOpen] = useState(false);
  const [inlineQuery, setInlineQuery] = useState('');

  // ── TOTAL PAPERS FROM API (like TopUtilityStrip) ───────────────────
  const [totalPapers, setTotalPapers] = useState<number>(0);
  const [totalPapersLoading, setTotalPapersLoading] = useState(true);

  // Fetch total papers count from API on mount
  useEffect(() => {
    async function fetchTotalPapers() {
      try {
        const response = await listPapers({ page: 1, per_page: 1 });
        setTotalPapers(response.total);
      } catch (err) {
        console.error('Failed to fetch total papers count:', err);
        setTotalPapers(50418727);
      } finally {
        setTotalPapersLoading(false);
      }
    }
    fetchTotalPapers();
  }, []);

  // ── Load ALL papers for keyword search ─────────────────────────────
  const loadAllPapers = useCallback(async () => {
    if (allItemsLoaded) return;

    setKeywordLoading(true);
    setError(null);

    try {
      const all: Paper[] = [];
      let currentPage = 1;
      let lastTotalPages = 1;

      // نجيب لحد 70 صفحة = 7000 paper (adjust حسب الـ API limit)
      do {
        const response = await listPapers({
          page: currentPage,
          per_page: 100, // API max is 100
          sort: 'id',
        });

        all.push(...response.items);
        lastTotalPages = response.pages;
        currentPage++;

        // Stop conditions
        if (currentPage > lastTotalPages) break;
        if (currentPage > 70) break; // ← safety limit
      } while (true);

      setAllItems(all);
      setAllItemsLoaded(true);
      setItems(all);
      setTotal(all.length);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load all papers');
    } finally {
      setKeywordLoading(false);
    }
  }, [allItemsLoaded]);

  // ── Load papers (SEMANTIC or LIST) ────────────────────────────────
  const loadPapers = useCallback(async () => {
    // لو فيه keyword query ولسه ماجبناش كل الـ papers
    if (keywordQuery.trim() && !allItemsLoaded) {
      await loadAllPapers();
      return;
    }

    // لو فيه keyword query وكل الـ papers جاهزين → مش محتاج نعمل حاجة
    if (keywordQuery.trim() && allItemsLoaded) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (activeQuery.trim()) {
    
        response = await searchPapers({
          q: activeQuery,
          page,
          per_page: perPage,
        });
      } else {
       
        response = await listPapers({
          page,
          per_page: perPage,
          study_type: selectedStudyTypes.length > 0 ? selectedStudyTypes[0] : null,
          specialty: selectedSpecialties.length > 0 ? selectedSpecialties[0] : null,
          sort,
        });
      }

      setItems(response.items);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load papers');
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [activeQuery, page, perPage, selectedSpecialties, selectedStudyTypes, sort, keywordQuery, allItemsLoaded, loadAllPapers]);

  // Load on mount and when dependencies change
  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveQuery(searchInput);
    setPage(1);
    // Clear keyword search when semantic is active
    setKeywordQuery('');
    // Clear filters when searching
    setSelectedSpecialties([]);
    setSelectedStudyTypes([]);
  }

  // Clear semantic search
  function handleClearSearch() {
    setSearchInput('');
    setActiveQuery('');
    setPage(1);
  }

  // Toggle inline search input next to sort
  function toggleInlineSearch() {
    setInlineSearchOpen((prev) => !prev);
    if (inlineSearchOpen) {
      setInlineQuery('');
    }
  }

  // Submit KEYWORD search (Client-side filter on title)
  function handleInlineSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inlineQuery.trim();
    if (!q) return;

    setKeywordQuery(q);
    setInlineSearchOpen(false);
    setInlineQuery('');

    if (!allItemsLoaded) {
      loadAllPapers();
    }
  }

  // Close inline search without searching
  function handleCloseInlineSearch() {
    setInlineSearchOpen(false);
    setInlineQuery('');
    setKeywordQuery('');
  }

  // Toggle specialty filter
  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
    setActiveQuery('');
    setKeywordQuery('');
    setPage(1);
  }

  // Toggle study type filter
  function toggleStudyType(studyType: string) {
    setSelectedStudyTypes((prev) =>
      prev.includes(studyType)
        ? prev.filter((s) => s !== studyType)
        : [...prev, studyType]
    );
    setActiveQuery('');
    setKeywordQuery('');
    setPage(1);
  }

  // Change sort
  function handleSortChange(newSort: 'id' | '-id') {
    setSort(newSort);
    setPage(1);
  }

  // Change per page
  function handlePerPageChange(newPerPage: number) {
    setPerPage(newPerPage);
    setPage(1);
  }

  // Reset all filters
  function handleResetAll() {
    setSelectedSpecialties([]);
    setSelectedStudyTypes([]);
    setSort('id');
    setActiveQuery('');
    setSearchInput('');
    setKeywordQuery('');
    setInlineQuery('');
    setInlineSearchOpen(false);
    setPage(1);
    setPerPage(20);
    // Reset all items loaded state
    setAllItemsLoaded(false);
    setAllItems([]);
  }

  // ── Client-side Keyword Filter ────────────────────────────────────
  // بيفلتر الـ allItems على الـ title بس
  const filteredItems = useCallback(() => {
    if (!keywordQuery.trim()) return items;
    if (!allItemsLoaded) return [];

    const queryLower = keywordQuery.toLowerCase();
    const queryWords = queryLower.split(/\\s+/).filter(w => w.length > 0);

    return allItems.filter((paper) => {
      const titleLower = paper.title.toLowerCase();
      // كل كلمة في الـ query لازم تكون موجودة في الـ title
      return queryWords.every((word) => titleLower.includes(word));
    });
  }, [items, allItems, allItemsLoaded, keywordQuery]);

  const displayItems = keywordQuery.trim() ? filteredItems() : items;
  const isKeywordMode = keywordQuery.trim() !== '';
  const displayTotal = displayItems.length;

  // ── Determine which number to show in header ──────────────────────
  // If search is active (semantic or keyword), show search results count
  // Otherwise show total papers from API
  const isSearchActive = activeQuery.trim() !== '' || keywordQuery.trim() !== '';
  const headerCount = isSearchActive ? displayTotal : totalPapers;
  const headerCountLoading = isSearchActive ? loading || keywordLoading : totalPapersLoading;

  // ── Helpers ───────────────────────────────────────────────────────
  const hasActiveFilters =
    selectedSpecialties.length > 0 ||
    selectedStudyTypes.length > 0 ||
    activeQuery !== '' ||
    keywordQuery !== '';

  function formatStudyType(type: string): string {
    return type
      .replace(/_/g, ' ')
      .replace(/\\b\\w/g, (l) => l.toUpperCase());
  }

  // ── Pagination range helper (uses API pages) ───────────────────────
  function getPaginationRange(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative">
        {/* ═══════════════════════════════════════════════════════════════
         *  SEARCH HEADER
         * ═══════════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-ink/10 bg-paper-warm/40 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-[280px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 80% at 30% 20%, rgba(20,184,166,0.10) 0%, rgba(20,184,166,0.03) 40%, rgba(246,243,234,0) 70%)',
            }}
          />

          <div className="max-w-[1380px] mx-auto px-6 pt-8 pb-6 relative">
            {/* Title */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="fade-in">
                <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45 mb-3">
                  <Link href="/" className="hover:text-teal-deep">CLARITAS</Link>
                  <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                  <span>SEARCH</span>
                </div>
                <h1 className="display text-[36px] md:text-[48px] tracking-tight">
                  Search <span className="italic text-teal">&amp; discovery</span>
                </h1>
              </div>

              <div className="fade-in d-1 hidden md:flex items-center gap-2 text-[10.5px] mono-stat text-ink/50">
                <span className="flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-ink/15 bg-paper">
                  <Icon icon="lucide:zap" className="text-[11px] text-teal" />
                  HYBRID SEARCH
                </span>
                <span className="flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-ink/15 bg-paper">
                  <Icon icon="lucide:globe" className="text-[11px] text-teal" />
                  EN + AR CORPUS
                </span>
              </div>
            </div>

            {/* Search bar */}
            <div className="fade-in d-2 relative max-w-[860px]">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-bright/25 via-teal-deep/15 to-teal-bright/15 blur-2xl opacity-40 rounded-[26px]" />
              <div className="relative bg-paper border border-ink/15 rounded-[22px] shadow-[0_24px_60px_-30px_rgba(11,29,42,0.3),0_2px_8px_-4px_rgba(11,29,42,0.08)] overflow-hidden">
                <form onSubmit={handleSearch} className="flex items-center gap-3 pl-5 pr-3 py-3.5">
                  <Icon icon="lucide:search" className="text-[20px] text-teal shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink/35 w-full"
                    placeholder="Search 50M+ medical papers, understood in seconds"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-ink/40 hover:text-ink/70"
                    >
                      <Icon icon="lucide:x" className="text-[16px]" />
                    </button>
                  )}
                  <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">⌘K</span>
                  <button
                    type="submit"
                    className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5"
                  >
                    Synthesise
                    <Icon icon="lucide:sparkles" className="text-[14px] text-teal-bright" />
                  </button>
                </form>

                {/* Filter rail */}
                <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60 overflow-x-auto">
                  <span className="text-[10px] mono-stat text-ink/45 shrink-0">FILTERS</span>

                  {/* Active filter chips */}
                  {selectedSpecialties.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-full bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[11px]"
                    >
                      {s}
                      <Icon icon="lucide:x" className="text-[10px]" />
                    </button>
                  ))}
                  {selectedStudyTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleStudyType(t)}
                      className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-full bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[11px]"
                    >
                      {formatStudyType(t)}
                      <Icon icon="lucide:x" className="text-[10px]" />
                    </button>
                  ))}
                  {activeQuery && (
                    <span className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-full bg-ink text-paper text-[11px]">
                      <Icon icon="lucide:sparkles" className="text-[10px]" />
                      {activeQuery}
                    </span>
                  )}
                  {keywordQuery && (
                    <span className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-full bg-teal-deep text-paper text-[11px]">
                      <Icon icon="lucide:search" className="text-[10px]" />
                      Keyword: {keywordQuery}
                    </span>
                  )}

                  {!hasActiveFilters && (
                    <button className="shrink-0 text-[11px] text-teal-deep font-medium hover:underline px-2 h-7 inline-flex items-center gap-1">
                      <Icon icon="lucide:plus" className="text-[12px]" />
                      Add filter
                    </button>
                  )}

                  <div className="ml-auto shrink-0 flex items-center gap-2 pl-3 border-l border-ink/10 text-ink/55">
                    <span className="mono-stat text-ink/45">N</span>
                    {headerCountLoading ? (
                      <span className="inline-block w-12 h-3 bg-ink/10 rounded animate-pulse" />
                    ) : (
                      <>
                        <span className="font-semibold text-ink-soft">{headerCount.toLocaleString()}</span>
                        <span>papers synthesised</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
         *  RESULTS WORKSPACE
         * ═══════════════════════════════════════════════════════════════ */}
        <section className="relative max-w-[1380px] mx-auto px-6 py-8 grid grid-cols-12 gap-8">
          {/* LEFT: Filters sidebar */}
          <aside className="col-span-12 lg:col-span-3 fade-in d-2">
            <div className="lg:sticky lg:top-[88px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="serif text-[18px] tracking-tight flex items-center gap-2">
                  <Icon icon="lucide:sliders-horizontal" className="text-[16px] text-teal-deep" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetAll}
                    className="text-[10.5px] mono-stat text-teal-deep hover:underline"
                  >
                    RESET ALL
                  </button>
                )}
              </div>

              {/* Specialty filter */}
              <div className="bg-paper border border-ink/12 rounded-2xl mb-3 overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
                    <Icon icon="lucide:stethoscope" className="text-[14px] text-teal-deep" />
                    Specialty
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/45" />
                </div>
                <div className="px-3 pb-4 pt-1">
                  <ul className="space-y-0.5">
                    {SPECIALTIES.map((s) => (
                      <li key={s}>
                        <label className="flex items-center gap-2 px-2 h-8 rounded-md hover:bg-ink/[0.04] cursor-pointer text-[12.5px]">
                          <input
                            type="checkbox"
                            checked={selectedSpecialties.includes(s)}
                            onChange={() => toggleSpecialty(s)}
                            className="accent-[var(--teal-deep)] w-3.5 h-3.5"
                          />
                          <span className="text-ink-soft">{s}</span>
                          {selectedSpecialties.includes(s) && (
                            <span className="ml-auto text-[10px] text-teal-deep mono-stat">ACTIVE</span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Study type filter */}
              <div className="bg-paper border border-ink/12 rounded-2xl mb-3 overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
                    <Icon icon="lucide:file-text" className="text-[14px] text-teal-deep" />
                    Study type
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/45" />
                </div>
                <div className="px-3 pb-4 pt-1">
                  <ul className="space-y-0.5">
                    {STUDY_TYPES.map((t) => (
                      <li key={t}>
                        <label className="flex items-center gap-2 px-2 h-8 rounded-md hover:bg-ink/[0.04] cursor-pointer text-[12.5px]">
                          <input
                            type="checkbox"
                            checked={selectedStudyTypes.includes(t)}
                            onChange={() => toggleStudyType(t)}
                            className="accent-[var(--teal-deep)] w-3.5 h-3.5"
                          />
                          <span className="text-ink-soft">{formatStudyType(t)}</span>
                          {selectedStudyTypes.includes(t) && (
                            <span className="ml-auto text-[10px] text-teal-deep mono-stat">ACTIVE</span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidence grade */}
              <div className="bg-paper border border-ink/12 rounded-2xl mb-3 overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
                    <Icon icon="lucide:award" className="text-[14px] text-teal-deep" />
                    Evidence grade
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/45" />
                </div>
                <div className="px-3 pb-4 pt-1">
                  <ul className="space-y-0.5">
                    {['A — High', 'B — Moderate', 'C — Low', 'D — Very low'].map((g) => (
                      <li key={g}>
                        <label className="flex items-center gap-2 px-2 h-8 rounded-md hover:bg-ink/[0.04] cursor-pointer text-[12.5px]">
                          <input type="checkbox" className="accent-[var(--teal-deep)] w-3.5 h-3.5" disabled />
                          <span className="text-ink-soft opacity-50">{g}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Per page */}
              <div className="bg-paper border border-ink/12 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
                    <Icon icon="lucide:list" className="text-[14px] text-teal-deep" />
                    Results per page
                  </span>
                </div>
                <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                  {[10, 20, 50].map((n) => (
                    <button
                      key={n}
                      onClick={() => handlePerPageChange(n)}
                      className={`px-3 h-8 rounded-lg text-[12px] font-medium transition ${
                        perPage === n
                          ? 'bg-ink text-paper'
                          : 'bg-paper border border-ink/12 text-ink-soft hover:bg-ink/[0.04]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: Results */}
          <div className="col-span-12 lg:col-span-9 fade-in d-3">
            {/* Results header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="serif text-[18px] tracking-tight">
                  {isKeywordMode
                    ? `Keyword: "${keywordQuery}"`
                    : activeQuery
                    ? `Search: "${activeQuery}"`
                    : 'Synthesised papers'}
                  <span className="italic text-teal">.</span>
                </h2>
                <span className="mono-stat text-ink/45 px-2 h-6 rounded-md bg-ink/5 flex items-center">
                  {displayTotal} RESULTS
                </span>
                {isKeywordMode && (
                  <span className="px-2 h-6 rounded-md bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[10px] mono-stat flex items-center">
                    <Icon icon="lucide:search" className="text-[10px] mr-1" />
                    TITLE FILTER
                  </span>
                )}
                {activeQuery && !isKeywordMode && (
                  <span className="px-2 h-6 rounded-md bg-ink/10 border border-ink/20 text-ink-soft text-[10px] mono-stat flex items-center">
                    <Icon icon="lucide:sparkles" className="text-[10px] mr-1" />
                    SEMANTIC
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11.5px]">
                {inlineSearchOpen ? (
                  <form
                    onSubmit={handleInlineSearch}
                    className="flex items-center gap-2 h-8 pl-2.5 pr-1.5 rounded-lg bg-paper border border-ink/12 focus-within:border-teal-deep transition-colors"
                  >
                    <Icon icon="lucide:search" className="text-[13px] text-teal" />
                    <input
                      autoFocus
                      type="text"
                      value={inlineQuery}
                      onChange={(e) => setInlineQuery(e.target.value)}
                      placeholder="Filter by title..."
                      className="bg-transparent outline-none text-[12px] text-ink-soft placeholder:text-ink/35 w-32 md:w-44"
                    />
                    <button
                      type="button"
                      onClick={handleCloseInlineSearch}
                      className="text-ink/40 hover:text-ink/70 p-0.5"
                    >
                      <Icon icon="lucide:x" className="text-[12px]" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={toggleInlineSearch}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-ink/12 bg-paper text-ink/55 hover:text-teal hover:border-teal-deep/30 transition"
                    aria-label="Filter by title"
                    title="Filter current results by title"
                  >
                    <Icon icon="lucide:search" className="text-[13px]" />
                  </button>
                )}

                <span className="mono-stat text-ink/45">SORT</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as 'id' | '-id')}
                  className="h-8 pl-2.5 pr-8 rounded-lg bg-paper border border-ink/12 text-[11.5px] text-ink-soft appearance-none cursor-pointer focus:border-teal-deep focus:outline-none"
                  disabled={isKeywordMode}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading */}
            {(loading || keywordLoading) && (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full mb-2" />
                <p className="text-ink/45 text-[13px]">
                  {keywordLoading ? 'Loading all papers for keyword search...' : 'Loading papers...'}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-[13px]">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="lucide:alert-triangle" className="text-[14px]" />
                  <span className="font-semibold">Error loading papers</span>
                </div>
                <p>{error}</p>
                <button
                  onClick={loadPapers}
                  className="mt-2 text-[12px] text-red-600 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results list */}
            {!loading && !keywordLoading && (
              <div className="space-y-4">
                {displayItems.length === 0 && (
                  <div className="text-center py-12 text-ink/40">
                    <Icon icon="lucide:search-x" className="text-[32px] mx-auto mb-3" />
                    <p className="text-[14px]">
                      {isKeywordMode
                        ? `No papers found with "${keywordQuery}" in the title`
                        : activeQuery
                        ? `No papers found for "${activeQuery}"`
                        : 'No papers found with the selected filters.'}
                    </p>
                    <button
                      onClick={handleResetAll}
                      className="mt-3 text-[12px] text-teal-deep hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {displayItems.map((paper) => (
                  <Link
                    key={paper.id}
                    href={`/paper/${paper.id}`}
                    className="group block rounded-2xl border border-ink/10 bg-paper hover:border-teal-deep/30 hover:shadow-[0_16px_40px_-16px_rgba(11,29,42,0.2)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5 md:p-6">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 h-6 rounded-md bg-ink text-paper text-[9.5px] mono-stat font-semibold flex items-center">
                          {formatStudyType(paper.study_type)}
                        </span>
                        <span className="text-[10px] mono-stat text-ink/45">{paper.id}</span>
                        <span className="text-ink/15">·</span>
                        <span className="text-[10.5px] text-ink/55">{paper.processing_time}ms processing</span>
                        {paper.has_errors && (
                          <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-red-500">
                            <Icon icon="lucide:alert-triangle" className="text-[12px]" />
                            PROCESSING ERRORS
                          </span>
                        )}
                        {!paper.has_errors && (
                          <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-teal-deep">
                            <Icon icon="lucide:badge-check" className="text-[12px]" />
                            VERIFIED
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="serif text-[17px] md:text-[19px] tracking-tight leading-[1.3] mb-2.5 group-hover:text-teal-deep transition-colors">
                        {paper.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-[13px] text-ink-soft leading-[1.55] mb-4 line-clamp-2">
                        {paper.tldr}
                      </p>

                      {/* Tags + Footer */}
                      <div className="flex flex-wrap items-center gap-2">
                        {paper.specialty_tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 h-6 rounded-md bg-teal-deep/8 text-teal-deep text-[10.5px] mono-stat font-medium flex items-center"
                          >
                            {tag}
                          </span>
                        ))}
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-ink/45">
                          <Icon icon="lucide:arrow-right" className="text-[12px] group-hover:text-teal-deep transition-colors" />
                          <span className="group-hover:text-teal-deep transition-colors">View details</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination — hidden in keyword mode */}
            {!loading && !keywordLoading && !isKeywordMode && totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-ink/12 rounded-lg text-[12px] text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/[0.04] transition"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {getPaginationRange(page, totalPages).map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-ink/30 px-1">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum as number)}
                        className={`w-9 h-9 rounded-lg text-[12px] font-medium transition ${
                          page === pageNum
                            ? 'bg-ink text-paper'
                            : 'text-ink-soft hover:bg-ink/[0.04]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-ink/12 rounded-lg text-[12px] text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/[0.04] transition"
                >
                  Next →
                </button>
              </div>
            )}


            {/* Empty state hint */}
            {!loading && !keywordLoading && displayItems.length > 0 && (
              <div className="mt-10 p-6 rounded-2xl border border-dashed border-ink/12 bg-paper-warm/30 text-center">
                <Icon icon="lucide:database" className="text-[24px] text-ink/20 mb-2" />
                
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}