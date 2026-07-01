import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { papers } from '../../lib/papers';

export const metadata: Metadata = {
  title: 'Search & discovery · Claritas',
  description: 'Search 50M+ medical papers synthesised by six AI agents.',
};

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
  'Systematic review',
  'Randomised controlled trial',
  'Meta-analysis',
  'Cohort study',
  'Case-control',
  'Guideline',
];

export default function SearchPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative">
        {/* Search header band */}
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
                <div className="flex items-center gap-3 pl-5 pr-3 py-3.5">
                  <Icon icon="lucide:search" className="text-[20px] text-teal shrink-0" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink/35 w-full"
                    placeholder="Search 50M+ medical papers, understood in seconds"
                  />
                  <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">⌘K</span>
                  <button className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5">
                    Synthesise
                    <Icon icon="lucide:sparkles" className="text-[14px] text-teal-bright" />
                  </button>
                </div>

                {/* Filter rail */}
                <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60 overflow-x-auto">
                  <span className="text-[10px] mono-stat text-ink/45 shrink-0">FILTERS</span>
                  <button className="shrink-0 text-[11px] text-teal-deep font-medium hover:underline px-2 h-7 inline-flex items-center gap-1">
                    <Icon icon="lucide:plus" className="text-[12px]" />
                    Add filter
                  </button>
                  <div className="ml-auto shrink-0 flex items-center gap-2 pl-3 border-l border-ink/10 text-ink/55">
                    <span className="mono-stat text-ink/45">N</span>
                    <span className="font-semibold text-ink-soft">{papers.length.toLocaleString()}</span>
                    <span>papers synthesised</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results workspace */}
        <section className="relative max-w-[1380px] mx-auto px-6 py-8 grid grid-cols-12 gap-8">
          {/* LEFT: Filters sidebar */}
          <aside className="col-span-12 lg:col-span-3 fade-in d-2">
            <div className="lg:sticky lg:top-[88px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="serif text-[18px] tracking-tight flex items-center gap-2">
                  <Icon icon="lucide:sliders-horizontal" className="text-[16px] text-teal-deep" />
                  Filters
                </h2>
                <button className="text-[10.5px] mono-stat text-teal-deep hover:underline">RESET ALL</button>
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
                          <input type="checkbox" className="accent-[var(--teal-deep)] w-3.5 h-3.5" />
                          <span className="text-ink-soft">{s}</span>
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
                          <input type="checkbox" className="accent-[var(--teal-deep)] w-3.5 h-3.5" />
                          <span className="text-ink-soft">{t}</span>
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
                          <input type="checkbox" className="accent-[var(--teal-deep)] w-3.5 h-3.5" />
                          <span className="text-ink-soft">{g}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Year range */}
              <div className="bg-paper border border-ink/12 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11">
                  <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
                    <Icon icon="lucide:calendar" className="text-[14px] text-teal-deep" />
                    Year range
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/45" />
                </div>
                <div className="px-4 pb-4 pt-1 flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={2020}
                    className="w-full h-9 px-3 rounded-lg bg-paper border border-ink/12 text-[12px] text-ink mono focus:border-teal-deep focus:outline-none"
                  />
                  <span className="text-ink/30">—</span>
                  <input
                    type="number"
                    defaultValue={2024}
                    className="w-full h-9 px-3 rounded-lg bg-paper border border-ink/12 text-[12px] text-ink mono focus:border-teal-deep focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: Results */}
          <div className="col-span-12 lg:col-span-9 fade-in d-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="serif text-[18px] tracking-tight">
                  Synthesised papers
                  <span className="italic text-teal">.</span>
                </h2>
                <span className="mono-stat text-ink/45 px-2 h-6 rounded-md bg-ink/5 flex items-center">
                  {papers.length} RESULTS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11.5px]">
                <span className="mono-stat text-ink/45">SORT</span>
                <select className="h-8 pl-2.5 pr-8 rounded-lg bg-paper border border-ink/12 text-[11.5px] text-ink-soft appearance-none cursor-pointer focus:border-teal-deep focus:outline-none">
                  <option>Most recent</option>
                  <option>Highest evidence grade</option>
                  <option>Most cited</option>
                </select>
              </div>
            </div>

            {/* Results list */}
            <div className="space-y-4">
              {papers.map((paper) => (
                <Link
                  key={paper.slug}
                  href={`/paper/${paper.slug}`}
                  className="group block rounded-2xl border border-ink/10 bg-paper hover:border-teal-deep/30 hover:shadow-[0_16px_40px_-16px_rgba(11,29,42,0.2)] transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 h-6 rounded-md bg-ink text-paper text-[9.5px] mono-stat font-semibold flex items-center">
                        {paper.journal}
                      </span>
                      <span className="text-[10px] mono-stat text-ink/45">{paper.citation}</span>
                      <span className="text-ink/15">·</span>
                      <span className="text-[10.5px] text-ink/55">{paper.centers} centres</span>
                      <span className="text-ink/15">·</span>
                      <span className="text-[10.5px] text-ink/55">{paper.authors} authors</span>
                      {paper.validated && (
                        <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-teal-deep">
                          <Icon icon="lucide:badge-check" className="text-[12px]" />
                          PHYSICIAN VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="serif text-[17px] md:text-[19px] tracking-tight leading-[1.3] mb-2.5 group-hover:text-teal-deep transition-colors">
                      {paper.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-[13px] text-ink-soft leading-[1.55] mb-4 line-clamp-2">
                      {paper.tldr.summary}
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="mono-stat text-ink/40">HR</span>
                        <span className="mono text-[14px] font-semibold text-ink">{paper.stats.hr}</span>
                        <span className="text-[11px] text-ink/50">({paper.stats.ci})</span>
                      </div>
                      <div className="w-px h-4 bg-ink/10" />
                      <div className="flex items-center gap-2">
                        <span className="mono-stat text-ink/40">P</span>
                        <span className="mono text-[13px] font-medium text-ink">{paper.stats.pValue}</span>
                      </div>
                      <div className="w-px h-4 bg-ink/10" />
                      <span className="mono-stat px-2 h-6 rounded-md bg-teal-deep/10 text-teal-deep flex items-center">
                        GRADE {paper.stats.grade}
                      </span>
                      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-ink/45">
                        <Icon icon="lucide:clock" className="text-[12px]" />
                        {paper.tldr.meta.synthesised}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty state hint */}
            <div className="mt-10 p-6 rounded-2xl border border-dashed border-ink/12 bg-paper-warm/30 text-center">
              <Icon icon="lucide:database" className="text-[24px] text-ink/20 mb-2" />
              <p className="text-[13px] text-ink-soft mb-1">
                Showing all synthesised papers. More are being processed daily.
              </p>
              <p className="text-[11px] text-ink/45">
                Use the search bar above to find specific topics, or add filters to narrow results.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
