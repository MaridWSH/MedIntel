'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { getFacets, listPapers, searchPapers } from '../../lib/papers';
import type { FacetValue, Paper } from '../../lib/papers/types';

/*
 * Filter options come from /papers/facets, not from a list in this file. The
 * hardcoded list offered "cross_sectional", "cohort_study" and "case_control" —
 * the data stores "cross-sectional", "cohort" and "case-control", so those three
 * filters always returned nothing — and it omitted narrative_review, the second
 * largest category. Same for specialties.
 */
const MAX_SPECIALTY_FACETS = 12;

const SORT_OPTIONS = [
  { value: 'id', label: 'Most recent' },
  { value: '-id', label: 'Oldest first' },
];

const prettify = (value: string) =>
  value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const EVIDENCE_LEVELS: FacetValue[] = [
  { value: 'high', count: 0 },
  { value: 'moderate', count: 0 },
  { value: 'low', count: 0 },
  { value: 'very_low', count: 0 },
];

const EVIDENCE_LABELS: Record<string, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  very_low: 'Very low',
};

interface FacetFilterProps {
  name: string;
  icon: string;
  title: string;
  facets: FacetValue[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  format: (value: string) => string;
  showCounts?: boolean;
  disabled?: boolean;
}

function FacetFilter({
  name,
  icon,
  title,
  facets,
  selected,
  onSelect,
  format,
  showCounts = true,
  disabled = false,
}: FacetFilterProps) {
  if (facets.length === 0) return null;

  return (
    <fieldset className="mb-3 overflow-hidden rounded-lg border border-ink/12 bg-paper disabled:opacity-55" disabled={disabled}>
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center justify-between px-4 h-11">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
          <Icon icon={icon} className="text-[14px] text-teal-deep" />
          {title}
        </span>
        {selected && !disabled && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] font-semibold uppercase tracking-wide text-teal-deep hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div className="px-3 pb-4 pt-1">
        <ul className="space-y-0.5">
          {facets.map((f) => (
            <li key={f.value}>
              <label className="flex items-center gap-2 px-2 h-8 rounded-md hover:bg-ink/[0.04] cursor-pointer text-[12.5px]">
                <input
                  type="radio"
                  name={name}
                  checked={selected === f.value}
                  onChange={() => onSelect(f.value)}
                  className="accent-[var(--teal-deep)] w-3.5 h-3.5"
                />
                <span className="text-ink-soft truncate">{format(f.value)}</span>
                {showCounts && (
                  <span className="ml-auto text-[10.5px] mono-stat text-ink/40 shrink-0">
                    {f.count.toLocaleString()}
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </fieldset>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── State ─────────────────────────────────────────────────────────
  const [items, setItems] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Search & filters
  const [searchInput, setSearchInput] = useState(initialQuery);

  // Facets, loaded from the API
  const [specialtyFacets, setSpecialtyFacets] = useState<FacetValue[]>([]);
  const [studyTypeFacets, setStudyTypeFacets] = useState<FacetValue[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);

  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedStudyType, setSelectedStudyType] = useState<string | null>(null);
  const [selectedEvidenceGrade, setSelectedEvidenceGrade] = useState<string | null>(null);
  const [sort, setSort] = useState<'id' | '-id'>('id');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active search query (what was actually submitted).
  // Seeded from ?q= so /search?q=diabetes — the link the landing page produces —
  // actually searches instead of showing an unfiltered listing.
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  useEffect(() => {
    getFacets()
      .then((f) => {
        setStudyTypeFacets(f.study_types);
        setSpecialtyFacets(f.specialties.slice(0, MAX_SPECIALTY_FACETS));
      })
      .catch(() => {
        setStudyTypeFacets([]);
        setSpecialtyFacets([]);
      });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Load papers ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadPapers() {
      try {
      setLoading(true);
      /*
       * One search path. /api/papers/search is semantic-first and falls back to
       * keyword matching server-side, so there is nothing for the client to pick
       * between. The old semantic/keyword toggles called endpoints that did not
       * exist (they 404'd on every use).
       */
      const response = activeQuery.trim()
        ? await searchPapers({ q: activeQuery, page, per_page: perPage })
        : await listPapers({
            page,
            per_page: perPage,
            // The API takes one value per facet, so the UI deliberately exposes
            // one radio selection per group rather than pretending to support
            // multi-select filtering.
            study_type: selectedStudyType,
            specialty: selectedSpecialty,
            evidence_level: selectedEvidenceGrade,
            sort,
          });

        if (cancelled) return;
        setError(null);
        setItems(response.items);
        setTotalPages(response.pages);
        setTotal(response.total);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load papers');
        setItems([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPapers();
    return () => {
      cancelled = true;
    };
  }, [activeQuery, page, perPage, selectedSpecialty, selectedStudyType, selectedEvidenceGrade, sort, reloadKey]);

  // ── Handlers ──────────────────────────────────────────────────────

  // Submit search
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const submittedQuery = searchInput.trim();
    setActiveQuery(submittedQuery);
    if (submittedQuery) {
      setSelectedSpecialty(null);
      setSelectedStudyType(null);
      setSelectedEvidenceGrade(null);
    }
    setPage(1);
    router.replace(submittedQuery ? `/search?q=${encodeURIComponent(submittedQuery)}` : '/search', { scroll: false });
  }

  // Clear search
  function handleClearSearch() {
    setSearchInput('');
    setActiveQuery('');
    setPage(1);
    router.replace('/search', { scroll: false });
  }

  function selectSpecialty(specialty: string | null) {
    setSelectedSpecialty(specialty);
    setPage(1);
    setMobileFiltersOpen(false);
  }

  function selectStudyType(studyType: string | null) {
    setSelectedStudyType(studyType);
    setPage(1);
    setMobileFiltersOpen(false);
  }

  function selectEvidenceGrade(grade: string | null) {
    setSelectedEvidenceGrade(grade);
    setPage(1);
    setMobileFiltersOpen(false);
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
    setSelectedSpecialty(null);
    setSelectedStudyType(null);
    setSelectedEvidenceGrade(null);
    setSort('id');
    setActiveQuery('');
    setSearchInput('');
    setPage(1);
    setPerPage(20);
    router.replace('/search', { scroll: false });
  }

  // ── Helpers ───────────────────────────────────────────────────────
  const hasActiveFilters =
    selectedSpecialty !== null ||
    selectedStudyType !== null ||
    selectedEvidenceGrade !== null ||
    activeQuery !== '';
  const hasBrowseFilters =
    selectedSpecialty !== null ||
    selectedStudyType !== null ||
    selectedEvidenceGrade !== null;

  // Evidence grade is filtered server-side now. It used to be applied to the
  // current page in memory, so the sidebar quietly removed rows while the header
  // went on reporting the unfiltered total.
  const filteredItems = items;

  const formatStudyType = prettify;

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

          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 pt-7 pb-6 relative">
            {/* Title */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="fade-in">
                <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45 mb-3">
                  <Link href="/" className="hover:text-teal-deep">CITEROUNDS</Link>
                  <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                  <span>SEARCH</span>
                </div>
                <h1 className="display text-[34px] md:text-[42px] tracking-tight">
                  Search the <span className="italic text-teal">evidence catalogue</span>
                </h1>
              </div>

              <div className="fade-in d-1 hidden md:flex items-center gap-1.5 px-2.5 h-7 rounded-full border border-teal-deep/25 bg-teal-deep/[0.07] text-[10.5px] mono-stat text-teal-deep">
                <Icon icon="lucide:brain" className="text-[11px]" />
                SEMANTIC SEARCH
              </div>
            </div>

            {/* Search bar */}
            <div className="fade-in d-2 max-w-[920px]">
              <div className="overflow-hidden rounded-lg border border-ink/15 bg-paper shadow-[0_18px_45px_-32px_rgba(11,29,42,0.45)] transition-shadow focus-within:border-teal-deep/50 focus-within:ring-2 focus-within:ring-teal-deep/20">
                <form onSubmit={handleSearch} role="search" className="flex items-center gap-2 p-2">
                  <Icon icon="lucide:search" className="ml-2 shrink-0 text-[19px] text-teal-deep" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-11 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink/40 sm:text-[15px]"
                    placeholder="Ask a clinical question or search a topic"
                    aria-label="Search the evidence catalogue"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink/45 hover:bg-ink/5 hover:text-ink"
                    >
                      <Icon icon="lucide:x" className="text-[16px]" />
                    </button>
                  )}
                  <span className="hidden items-center gap-1 rounded border border-ink/12 px-2 py-1 text-[10px] text-ink/50 md:flex mono">⌘K</span>
                  <button
                    type="submit"
                    className="btn-primary inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-ink px-3.5 text-[13px] font-semibold text-paper sm:px-5"
                  >
                    <span className="hidden sm:inline">Search papers</span>
                    <Icon icon="lucide:sparkles" className="text-[14px] text-teal-bright" />
                  </button>
                </form>

                {/* Filter rail */}
                <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60 overflow-x-auto">
                  <span className="text-[10px] mono-stat text-ink/45 shrink-0">FILTERS</span>

                  {/* Active filter chips */}
                  {selectedSpecialty && (
                    <button
                      onClick={() => selectSpecialty(null)}
                      className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-md bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[11px]"
                    >
                      {prettify(selectedSpecialty)}
                      <Icon icon="lucide:x" className="text-[10px]" />
                    </button>
                  )}
                  {selectedStudyType && (
                    <button
                      onClick={() => selectStudyType(null)}
                      className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-md bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[11px]"
                    >
                      {formatStudyType(selectedStudyType)}
                      <Icon icon="lucide:x" className="text-[10px]" />
                    </button>
                  )}
                  {selectedEvidenceGrade && (
                    <button
                      onClick={() => selectEvidenceGrade(null)}
                      className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-md bg-teal-deep/10 border border-teal-deep/20 text-teal-deep text-[11px]"
                    >
                      {EVIDENCE_LABELS[selectedEvidenceGrade] ?? prettify(selectedEvidenceGrade)} evidence
                      <Icon icon="lucide:x" className="text-[10px]" />
                    </button>
                  )}
                  {activeQuery && (
                    <span className="shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-md bg-ink text-paper text-[11px]">
                      <Icon icon="lucide:search" className="text-[10px]" />
                      &quot;{activeQuery}&quot;
                    </span>
                  )}

                  {!hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="shrink-0 text-[11px] text-teal-deep font-medium hover:underline px-2 h-7 inline-flex items-center gap-1 lg:hidden"
                    >
                      <Icon icon="lucide:sliders-horizontal" className="text-[12px]" />
                      Open filters
                    </button>
                  )}

                  <div className="ml-auto shrink-0 flex items-center gap-2 pl-3 border-l border-ink/10 text-ink/55">
                    <span className="mono-stat text-ink/45">N</span>
                    <span className="font-semibold text-ink-soft">{loading ? '—' : total.toLocaleString()}</span>
                    <span>{activeQuery ? 'ranked matches' : 'papers synthesised'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
         *  RESULTS WORKSPACE
         * ═══════════════════════════════════════════════════════════════ */}
        <section className="relative max-w-[1380px] mx-auto px-4 sm:px-6 py-7 md:py-8 grid grid-cols-12 gap-8">
          {/* LEFT: Filters sidebar */}
          <aside className={`${mobileFiltersOpen ? 'fixed inset-0 z-50 bg-ink/35' : 'hidden'} lg:static lg:z-auto lg:col-span-3 lg:block lg:bg-transparent fade-in d-2`}>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 cursor-default lg:hidden"
            />
            <div className="relative ml-auto h-full w-[min(360px,calc(100vw-28px))] overflow-y-auto bg-paper p-4 shadow-2xl lg:sticky lg:top-[88px] lg:ml-0 lg:h-auto lg:w-auto lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto lg:bg-transparent lg:p-0 lg:pr-2 lg:shadow-none lg:overscroll-contain lg:[scrollbar-gutter:stable]">
              <div className="flex items-center justify-between mb-4 lg:sticky lg:top-0 lg:z-10 lg:bg-paper lg:py-1">
                <h2 className="serif text-[18px] tracking-tight flex items-center gap-2">
                  <Icon icon="lucide:sliders-horizontal" className="text-[16px] text-teal-deep" />
                  Browse filters
                </h2>
                <div className="flex items-center gap-3">
                {hasBrowseFilters && (
                  <button
                    onClick={handleResetAll}
                    className="text-[10.5px] mono-stat text-teal-deep hover:underline"
                  >
                    RESET ALL
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/12 text-ink-soft lg:hidden"
                >
                  <Icon icon="lucide:x" className="text-[16px]" />
                </button>
                </div>
              </div>

              {activeQuery && (
                <div className="mb-4 rounded-lg border border-amber-ink/25 bg-amber-bg/70 p-3 text-[12px] leading-[1.5] text-ink-soft">
                  Search results are ranked semantically. Clear the search query to browse by specialty,
                  study type, or evidence signal.
                </div>
              )}

              {/* Specialty — options and counts come from the API. */}
              <FacetFilter
                name="specialty"
                icon="lucide:stethoscope"
                title="Specialty"
                facets={specialtyFacets}
                selected={selectedSpecialty}
                onSelect={selectSpecialty}
                format={prettify}
                disabled={Boolean(activeQuery)}
              />

              <FacetFilter
                name="study-type"
                icon="lucide:file-text"
                title="Study type"
                facets={studyTypeFacets}
                selected={selectedStudyType}
                onSelect={selectStudyType}
                format={prettify}
                disabled={Boolean(activeQuery)}
              />

              <FacetFilter
                name="evidence-grade"
                icon="lucide:award"
                title="Single-paper evidence signal"
                facets={EVIDENCE_LEVELS}
                selected={selectedEvidenceGrade}
                onSelect={selectEvidenceGrade}
                format={(v) => EVIDENCE_LABELS[v] ?? prettify(v)}
                showCounts={false}
                disabled={Boolean(activeQuery)}
              />

              {/* Per page */}
              <div className="bg-paper border border-ink/12 rounded-lg overflow-hidden">
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="serif text-[18px] tracking-tight">
                  {activeQuery ? `Search: "${activeQuery}"` : 'Synthesised papers'}
                  <span className="italic text-teal">.</span>
                </h2>
                <span className="mono-stat text-ink/45 px-2 h-6 rounded-md bg-ink/5 flex items-center">
                  {/* Ranked, not exhaustive: the API caps semantic results, so "200 results"
                      for a query means "the 200 best", which "RESULTS" alone implies badly. */}
                  {loading
                    ? activeQuery ? 'SEARCHING' : 'LOADING'
                    : activeQuery
                      ? `TOP ${total.toLocaleString()} BY RELEVANCE`
                      : `${total.toLocaleString()} PAPERS`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11.5px]">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-ink/12 bg-paper px-3 font-medium text-ink-soft lg:hidden"
                >
                  <Icon icon="lucide:sliders-horizontal" className="text-[14px] text-teal-deep" />
                  Filters
                  {hasBrowseFilters && <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" />}
                </button>
                {!activeQuery && (
                  <>
                    <span className="mono-stat text-ink/45">SORT</span>
                    <select
                      value={sort}
                      onChange={(e) => handleSortChange(e.target.value as 'id' | '-id')}
                      aria-label="Sort papers"
                      className="h-9 rounded-md border border-ink/12 bg-paper pl-2.5 pr-8 text-[11.5px] text-ink-soft focus:border-teal-deep focus:outline-none"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full mb-2" />
                <p className="text-ink/45 text-[13px]">Searching&hellip;</p>
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
                  onClick={() => setReloadKey((value) => value + 1)}
                  className="mt-2 text-[12px] text-red-600 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results list */}
            {!loading && (
              <div className="space-y-4">
                {filteredItems.length === 0 && !error && (
                      <div className="text-center py-12 text-ink/40">
                        <Icon icon="lucide:search-x" className="text-[32px] mx-auto mb-3" />
                        <p className="text-[14px]">
                          {activeQuery
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

                {filteredItems.map((paper) => (
                  <Link
                    key={paper.id}
                    href={`/paper/${paper.id}`}
                    className="group block overflow-hidden rounded-lg border border-ink/10 bg-paper transition-all duration-200 hover:border-teal-deep/30 hover:shadow-[0_14px_36px_-22px_rgba(11,29,42,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep"
                  >
                    <div className="p-5 md:p-6">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="flex min-h-6 items-center rounded-md bg-ink px-2 text-[10px] font-semibold uppercase tracking-wide text-paper">
                          {formatStudyType(paper.study_type)}
                        </span>
                        {paper.overall_evidence_level && (
                          <span className="flex min-h-6 items-center rounded-md border border-teal-deep/20 bg-teal-deep/8 px-2 text-[10.5px] font-medium text-teal-deep">
                            {prettify(paper.overall_evidence_level)} evidence signal
                          </span>
                        )}
                        {paper.sample_size && (
                          <span className="flex min-h-6 items-center rounded-md border border-ink/12 px-2 text-[10.5px] text-ink/60">
                            {paper.sample_size}
                          </span>
                        )}
                        {paper.has_errors && (
                          <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-red-500">
                            <Icon icon="lucide:alert-triangle" className="text-[12px]" />
                            PROCESSING ERRORS
                          </span>
                        )}
                        {paper.has_summary && paper.tldr ? (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-ink/45">
                          <Icon icon="lucide:bot" className="text-[12px]" />
                          AI summary available
                        </span>
                        ) : !paper.has_errors ? (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-ink/45">
                            <Icon icon="lucide:file-text" className="text-[12px]" />
                            Source record
                          </span>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h3 className="serif text-[17px] md:text-[19px] tracking-tight leading-[1.3] mb-2.5 group-hover:text-teal-deep transition-colors">
                        {paper.title}
                      </h3>

                      {/* Summary */}
                      {paper.tldr ? (
                        <p className="text-[13.5px] text-ink-soft leading-[1.6] mb-4 line-clamp-2">
                          {paper.tldr}
                        </p>
                      ) : (
                        <p className="mb-4 text-[12.5px] leading-[1.55] text-ink/50">
                          No AI summary is available yet. Open the record to inspect the source metadata
                          and any available full text.
                        </p>
                      )}

                      {/* Tags + Footer */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-ink/8 pt-4">
                        {paper.journal && (
                          <span className="mr-1 max-w-full truncate text-[11.5px] italic text-ink/50 md:max-w-[46%]">
                            {paper.journal}
                          </span>
                        )}
                        {paper.specialty_tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="flex min-h-6 items-center rounded-md bg-teal-deep/8 px-2 text-[10.5px] font-medium text-teal-deep"
                          >
                            {prettify(tag)}
                          </span>
                        ))}
                        <div className="ml-auto flex items-center gap-1.5 text-[11.5px] font-semibold text-teal-deep">
                          <span>Review evidence</span>
                          <Icon icon="lucide:arrow-right" className="text-[12px] group-hover:text-teal-deep transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-ink/12 rounded-lg text-[12px] text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/[0.04] transition"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-[12px] font-medium transition ${
                          page === pageNum
                            ? 'bg-ink text-paper'
                            : 'text-ink-soft hover:bg-ink/[0.04]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-ink/30 px-1">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`w-9 h-9 rounded-lg text-[12px] font-medium transition ${
                          page === totalPages
                            ? 'bg-ink text-paper'
                            : 'text-ink-soft hover:bg-ink/[0.04]'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
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

          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/*
 * useSearchParams() forces the subtree to render client-side, and Next requires a
 * Suspense boundary around it or the whole route deopts to dynamic rendering.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
