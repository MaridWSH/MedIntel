import Link from 'next/link';
import type { Metadata } from 'next';
import Icon from '../components/ui/Icon';
import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import HeroSearch from '../components/site/HeroSearch';
import type { Paper, PaperListResponse } from '../lib/papers/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://citerounds.com/api';

export const metadata: Metadata = {
  title: 'AI-assisted medical literature review',
  description:
    'CiteRounds helps clinicians and researchers understand open-access medical papers with structured summaries, source-linked findings, and a visible fidelity self-check.',
  alternates: { canonical: '/' },
};

// ── Evidence Engine agent data ──────────────────────────────────────────
const AGENTS = [
  { id: '01', kind: 'AI AGENT', icon: 'lucide:scan-text', title: 'Summary extraction', desc: 'Produces a TLDR, structured narrative, study type, specialty tags, and PICO fields when the study supports them.', badges: ['PICO', 'SOURCE TEXT'] },
  { id: '02', kind: 'AI AGENT', icon: 'lucide:stethoscope', title: 'Key findings', desc: 'Extracts the main outcomes, reported statistics, source quotes, and limitations from the paper.', badges: ['QUOTED EVIDENCE'] },
  { id: '03', kind: 'AI AGENT', icon: 'lucide:network', title: 'Structured breakdown', desc: 'Organises background, methods, results, limitations, and implications into a navigable concept tree.', badges: ['TYPED NODES'] },
  { id: '04', kind: 'AI AGENT', icon: 'lucide:shield-alert', title: 'Summary fidelity', desc: 'Checks important generated claims against the source. This is a model self-check, not peer review, GRADE, or a risk-of-bias assessment.', badges: ['MODEL SELF-CHECK'] },
  { id: '05', kind: 'PRODUCT TOOL', icon: 'lucide:image', title: 'Shareable card', desc: 'Renders selected generated content into a downloadable card that carries an AI-generated disclaimer.', badges: ['DOWNLOADABLE'] },
  { id: '06', kind: 'PRODUCT TOOL', icon: 'lucide:quote', title: 'Citation export', desc: 'Links to the original paper and exports a formatted citation, BibTeX, or RIS from source metadata.', badges: ['RIS', 'BIBTEX'], highlight: true },
];

/*
 * Real numbers, checked against the database (see the queries in the MVP review).
 *
 * These previously read: "50.4M papers indexed · 17 sources" (the corpus is four
 * orders of magnitude smaller and comes from one source), "1,200+ board-certified
 * physician reviewers" (there are none), and a "0.04% emendation rate ... audited
 * quarterly" (no such audit exists). Nothing goes in this block that can't be
 * derived from the data.
 */
const METRICS = [
  { value: '3,419', suffix: '', label: 'PAPERS WITH SUMMARIES', desc: 'Local catalogue rows with an earlier-generation TLDR or detailed summary.' },
  { value: '34', suffix: 's', label: 'MEDIAN SYNTHESIS TIME', desc: '33.5-second median across 6,679 earlier pipeline outputs with recorded timing.' },
  { value: '85', suffix: '%', label: 'PASS MODEL SELF-CHECK', desc: 'Of 3,399 verifier outputs, 85.3% met the pipeline’s automated fidelity threshold.' },
  { value: '4', suffix: '', label: 'SPECIALISED AI AGENTS', desc: 'Summary, findings, concept map, and source-fidelity self-check.' },
];

/* ── Fetch papers directly from API ── */
async function getRecentPapers(): Promise<PaperListResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/papers?page=1&per_page=6&sort=id`, {
      next: { revalidate: 300 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[HOME] API error:', res.status, text.slice(0, 200));
      return null;
    }

    const data: PaperListResponse = await res.json();
    return data;
  } catch (err) {
    console.error('[HOME] Fetch error:', err);
    return null;
  }
}

export default async function Home() {
  // Fetch papers from API for the home page
  let recentPapers: Paper[] = [];
  let corpusTotal = 0;

  try {
    const paperData = await getRecentPapers();
    recentPapers = paperData?.items || [];
    corpusTotal = paperData?.total || 0;
  } catch (err) {
    console.error('[HOME] Error:', err);
    recentPapers = [];
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative overflow-x-hidden">

        {/* ═══════════════════════════════════════════════════════════════════
         *  § 01 · PRODUCT-FIRST SEARCH
         * ═════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="relative border-b border-ink/10 bg-paper-warm/35">
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 md:py-14 lg:py-16 relative">
            <div className="grid lg:grid-cols-[minmax(0,1.04fr)_minmax(400px,0.96fr)] gap-8 lg:gap-14 items-center">
              <div className="fade-in min-w-0">
                <div className="inline-flex items-center gap-2 text-[11px] mono-stat text-teal-deep mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-bright" />
                  OPEN-ACCESS EVIDENCE SEARCH
                </div>

                <h1 className="display text-[44px] sm:text-[52px] lg:text-[64px] tracking-[-0.03em] max-w-[780px]">
                  Find the paper.
                  <br />
                  See the evidence.
                  <br />
                  <span className="italic text-teal">Check the source.</span>
                </h1>

                <p className="mt-6 text-[16px] sm:text-[17px] text-ink-soft leading-[1.65] max-w-[660px]">
                  Search the available PubMed Central corpus, review a structured AI summary, and move
                  straight to the original paper when a claim matters.
                </p>

                <div className="mt-8 max-w-[760px]">
                  <HeroSearch />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="text-ink/50 mr-1">Try:</span>
                  {[
                    'heart failure rehabilitation',
                    'GLP-1 cardiovascular outcomes',
                    'sepsis fluid resuscitation',
                  ].map((query) => (
                    <Link
                      key={query}
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="inline-flex min-h-8 items-center rounded-md border border-ink/12 bg-paper px-2.5 text-ink-soft transition-colors hover:border-teal-deep/35 hover:text-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep"
                    >
                      {query}
                    </Link>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-ink/60">
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:database" className="text-[14px] text-teal-deep" />
                    {corpusTotal > 0 ? `${corpusTotal.toLocaleString()} papers in the current catalogue` : 'Live paper catalogue'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:external-link" className="text-[14px] text-teal-deep" />
                    Source link on every paper
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:bot" className="text-[14px] text-teal-deep" />
                    AI-generated, not clinician-reviewed
                  </span>
                </div>
              </div>

              <div className="fade-in d-2 min-w-0">
                {recentPapers[0] ? (
                  <article className="overflow-hidden rounded-lg border border-ink/12 bg-paper shadow-[0_24px_70px_-34px_rgba(11,29,42,0.35)]">
                    <div className="flex items-center justify-between gap-4 border-b border-ink/10 bg-ink px-4 py-3 text-paper sm:px-5">
                      <div className="flex items-center gap-2 text-[11px] mono-stat">
                        <Icon icon="lucide:scan-text" className="text-[14px] text-teal-bright" />
                        LIVE SYNTHESIS PREVIEW
                      </div>
                      <span className="text-[10px] mono text-paper/50">{recentPapers[0].id}</span>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink/55">
                        <span className="rounded-md bg-teal-deep/10 px-2 py-1 font-semibold text-teal-deep">
                          {recentPapers[0].study_type.replace(/[_-]/g, ' ')}
                        </span>
                        {recentPapers[0].overall_evidence_level && (
                          <span className="rounded-md border border-ink/12 px-2 py-1">
                            {recentPapers[0].overall_evidence_level} evidence signal
                          </span>
                        )}
                        {recentPapers[0].sample_size && (
                          <span className="rounded-md border border-ink/12 px-2 py-1">{recentPapers[0].sample_size}</span>
                        )}
                      </div>

                      <h2 className="serif mt-5 text-[24px] leading-[1.25] tracking-tight sm:text-[28px]">
                        {recentPapers[0].title}
                      </h2>

                      {recentPapers[0].journal && (
                        <p className="mt-2 text-[12px] italic text-ink/50">{recentPapers[0].journal}</p>
                      )}

                      <div className="mt-6 border-l-2 border-teal-deep pl-4">
                        <div className="mb-2 text-[10.5px] mono-stat text-ink/45">AI-GENERATED SUMMARY</div>
                        <p className="line-clamp-3 text-[13.5px] leading-[1.65] text-ink-soft">
                          {recentPapers[0].tldr}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-[11.5px] text-ink/55">
                          <Icon icon="lucide:shield-alert" className="text-[14px] text-amber-ink" />
                          Check important claims against the source
                        </p>
                        <Link
                          href={`/paper/${recentPapers[0].id}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-[12.5px] font-semibold text-paper transition-colors hover:bg-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep focus-visible:ring-offset-2"
                        >
                          Review this paper
                          <Icon icon="lucide:arrow-right" className="text-[14px] text-teal-bright" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ) : (
                  <div className="rounded-lg border border-ink/12 bg-paper p-6">
                    <Icon icon="lucide:file-search" className="text-[26px] text-teal-deep" />
                    <h2 className="serif mt-5 text-[26px] tracking-tight">Search, assess, verify.</h2>
                    <p className="mt-3 text-[13.5px] leading-[1.6] text-ink-soft">
                      Search results lead into a structured summary, full source text, fidelity status,
                      concept map, and citation export.
                    </p>
                    <Link href="/search" className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-semibold text-teal-deep hover:underline">
                      Browse the catalogue
                      <Icon icon="lucide:arrow-right" className="text-[14px]" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 grid border-y border-ink/10 bg-paper/55 sm:grid-cols-3">
              {[
                ['01', 'Search by clinical question or topic'],
                ['02', 'Review the structured evidence summary'],
                ['03', 'Open the source before applying a claim'],
              ].map(([num, label], index) => (
                <div key={num} className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${index > 0 ? 'border-t border-ink/10 sm:border-l sm:border-t-0' : ''}`}>
                  <span className="mono text-[10px] font-semibold text-teal-deep">{num}</span>
                  <span className="text-[12.5px] font-medium text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
         *  § 02 · THE EVIDENCE ENGINE
         * ═════════════════════════════════════════════════════════════════ */}
        <section id="evidence-engine" className="relative py-20 md:py-28 border-t border-ink/10">
          <div className="max-w-[1380px] mx-auto px-6">
            <div className="grid grid-cols-12 gap-8 mb-16">
              <div className="col-span-12 md:col-span-5">
                <div className="text-[10.5px] mono-stat text-teal-deep mb-5">§ 02 &middot; THE EVIDENCE ENGINE</div>
                <h2 className="display text-[40px] md:text-[56px] tracking-tight">
                  Four agents extract.
                  <br />
                  <span className="italic text-teal">One doctor decides.</span>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-7 md:pt-12">
                <p className="serif-body text-[17px] md:text-[18px] leading-[1.55] text-ink-soft max-w-[560px]">
                  Three specialised AI steps generate the summary, findings, and concept map. A fourth
                  model checks important generated claims against the source. No clinician reviews these
                  summaries &mdash; you are the reviewer, and the source is always one click away.
                </p>
              </div>
            </div>

            {/* Agent grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
              {AGENTS.map((a) => (
                <article key={a.id} className={`p-7 lg:p-8 relative ${a.highlight ? 'bg-ink text-paper' : 'bg-paper hover-tint'}`}>
                  {a.highlight && (
                    <div className="absolute top-5 right-5 text-[9.5px] mono-stat text-teal-bright flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
                      ALWAYS-ON
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.highlight ? 'bg-teal-bright/15 border border-teal-bright/30' : 'bg-ink text-paper'}`}>
                      <Icon icon={a.icon} className={`text-[20px] ${a.highlight ? 'text-teal-bright' : 'text-teal-bright'}`} />
                    </div>
                    {!a.highlight && <span className="text-[9.5px] mono-stat text-ink/40">{a.kind} {a.id}</span>}
                  </div >
                  <h3 className={`serif text-[20px] tracking-tight mb-2 ${a.highlight ? 'text-paper' : ''}`}>{a.title}</h3>
                  <p className={`text-[13px] leading-[1.55] mb-4 ${a.highlight ? 'text-paper/75' : 'text-ink-soft'}`}>{a.desc}</p>
                  <div id="methodology" className={`flex items-center gap-2 text-[10.5px] mono-stat ${a.highlight ? 'text-paper/65' : 'text-ink/55'}`}>
                    {a.badges.map((b) => (
                      <span key={b} className={`px-2 h-6 rounded-md border inline-flex items-center ${a.highlight ? 'bg-paper/10 border-paper/15' : 'bg-ink/5 border-ink/10'}`}>{b}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {/* Pipeline */}
            <div className="mt-10 bg-paper-warm/50 border border-ink/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-3">
              {[
                { num: '01', label: 'Source XML parsed' },
                { num: '02', label: 'Three extraction agents run' },
                { num: '03', label: 'Model fidelity check runs' },
                { num: '04', label: 'Output published with caveats' },
              ].map(({ num, label }, index) => (
                <div key={num} className="contents">
                <div key={num} className="flex items-center gap-3 text-ink-soft">
                  <div className="w-9 h-9 rounded-lg bg-ink text-paper flex items-center justify-center text-[10px] mono-stat">{num}</div>
                  <span className="text-[13px] font-medium">{label}</span>
                </div>
                {index < 3 && <Icon icon="lucide:arrow-right" className="text-ink/30 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
         *  § 03 · SOCIAL PROOF — Institutions & metrics
         * ═════════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 md:py-28 border-t border-ink/10 bg-paper-warm/40">
          <div className="max-w-[1380px] mx-auto px-6">
            {/*
              This block claimed the Egyptian Medical Syndicate and the Arab Board of
              Health Specialisations "trust the product". Neither organisation has any
              relationship with this product. Naming real accreditation bodies as
              endorsers when they have not endorsed you is not marketing licence.
              Replaced with what the corpus actually is.
            */}
            <div className="text-center max-w-[760px] mx-auto mb-14">
              <div className="text-[10.5px] mono-stat text-teal-deep mb-5">§ 03 &middot; IN PRACTICE</div>
              <h2 className="display text-[36px] md:text-[52px] tracking-tight mb-5">
                Open literature,
                <br />
                <span className="italic text-teal">read in minutes</span>.
              </h2>
              <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.5] max-w-[620px] mx-auto">
                CiteRounds is in closed beta. The corpus is open-access research from PubMed Central,
                summarised by AI and checked against the source &mdash; not a substitute for reading it.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
              {METRICS.map((m) => (
                <div key={m.label} className="bg-paper p-7 md:p-8">
                  <div className="serif text-[40px] md:text-[52px] leading-none tracking-tight text-ink">
                    {m.value}
                    <span className={['M', '+'].includes(m.suffix) ? 'text-teal' : 'text-ink/35 text-[24px]'}>{m.suffix}</span>
                  </div>
                  <div className="text-[10.5px] mono-stat text-ink/55 mt-3">{m.label}</div>
                  <div className="text-[12px] text-ink-soft mt-2">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
         *  § 04 · SYNTHESISED PAPERS — Paper cards (from API)
         * ═════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 border-t border-ink/10">
          <div className="max-w-[1380px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="mono-stat text-ink/45 mb-1">§ 04 &middot; EVIDENCE ENGINE</div>
                <h2 className="serif text-[24px] md:text-[30px] tracking-tight">
                  Recently synthesised<span className="italic text-teal">.</span>
                </h2>
              </div>
              <Link href="/search" className="text-[12px] text-teal-deep font-medium hover:underline flex items-center gap-1">
                View all
                <Icon icon="lucide:arrow-right" className="text-[13px]" />
              </Link>
            </div>

            {recentPapers.length === 0 ? (
              <div className="text-center py-12 text-ink/40 text-[14px]">
                Loading papers from API...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPapers.map((paper) => (
                  <Link
                    key={paper.id}
                    href={`/paper/${paper.id}`}
                    className="group block rounded-2xl border border-ink/10 bg-paper hover:border-teal-deep/30 hover:shadow-[0_16px_40px_-16px_rgba(11,29,42,0.2)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 h-6 rounded-md bg-ink text-paper text-[9.5px] mono-stat font-semibold flex items-center">
                          {paper.study_type.toUpperCase().replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] mono-stat text-ink/45">{paper.id}</span>
                        {!paper.has_errors && (
                          <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-teal-deep">
                            <Icon icon="lucide:bot" className="text-[12px]" />
                            SUMMARY READY
                          </span>
                        )}
                        {paper.has_errors && (
                          <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-red-500">
                            <Icon icon="lucide:alert-triangle" className="text-[12px]" />
                            ERRORS
                          </span>
                        )}
                      </div>
                      <h3 className="serif text-[15px] tracking-tight leading-[1.3] mb-2.5 group-hover:text-teal-deep transition-colors line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="text-[12px] text-ink/60 leading-[1.5] line-clamp-2">{paper.tldr}</p>
                    </div>
                    <div className="border-t border-ink/8 px-5 py-3 flex items-center justify-between bg-paper-warm/40">
                      <div className="flex items-center gap-3">
                        <span className="mono-stat text-ink/45 flex items-center gap-1">
                          <Icon icon="lucide:activity" className="text-[11px] text-teal" />
                          {paper.study_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-ink/15">|</span>
                        <span className="mono-stat text-ink/45">{paper.sample_size || paper.id}</span>
                      </div>
                      <span className="mono-stat text-teal-deep">{paper.specialty_tags[0] || 'General'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
         *  § 05 · FINAL CTA — Start tonight
         * ═════════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 md:py-28 border-t border-ink/10 bg-ink text-paper overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full bg-teal-deep/30 blur-[120px]" />
            <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-teal-bright/15 blur-[100px]" />
          </div>
          <div className="absolute inset-0 grain-overlay" />

          <div className="max-w-[1380px] mx-auto px-6 relative text-center">
            <div className="text-[10.5px] mono-stat text-teal-bright mb-6">§ 05 &middot; START TONIGHT</div>
            <h2 className="display text-[48px] md:text-[72px] lg:text-[96px] tracking-tight max-w-[1100px] mx-auto">
              Tomorrow&rsquo;s rounds,
              <br />
              <span className="italic text-teal-bright">already read.</span>
            </h2>
            <p className="serif-body text-[17px] md:text-[19px] text-paper/75 mt-7 max-w-[620px] mx-auto">
              Free during the closed beta. No credit card or paid subscription is active.
              Every AI-generated output should be checked against its linked source.
            </p>
            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-3">
              <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-7 h-14 bg-teal-bright text-ink rounded-[16px] text-[15px] font-semibold w-full md:w-auto">
                Sign up &mdash; free for physicians
                <Icon icon="lucide:arrow-right" className="text-[16px]" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-7 h-14 border border-paper/25 text-paper rounded-[16px] text-[15px] font-semibold hover:bg-paper/10 transition-colors w-full md:w-auto">
                See pricing
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-[10.5px] mono-stat text-paper/55">
              <Icon icon="lucide:lock" className="text-[12px]" />
              {/* Was "PHI-LICENSED · GDPR · HIPAA-ALIGNED · SOC 2 IN PROGRESS" — none of it holds. */}
              CLOSED BETA &middot; AI-GENERATED &middot; NOT CLINICAL ADVICE
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
