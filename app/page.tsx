import Link from 'next/link';
import Icon from '../components/ui/Icon';
import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import HeroSearch from '../components/site/HeroSearch';
import type { Paper, PaperListResponse } from '../lib/papers/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://med.aidashnews.tech/api';

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
async function getRecentPapers(): Promise<Paper[]> {
  try {
    const res = await fetch(`${API_BASE}/papers?page=1&per_page=6&sort=id`, {
      next: { revalidate: 300 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[HOME] API error:', res.status, text.slice(0, 200));
      return [];
    }

    const data: PaperListResponse = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('[HOME] Fetch error:', err);
    return [];
  }
}

export default async function Home() {
  // Fetch papers from API for the home page
  let recentPapers: Paper[] = [];
  let firstPaperId = '';

  try {
    recentPapers = await getRecentPapers();
    if (recentPapers.length > 0) {
      firstPaperId = recentPapers[0].id;
    }
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
         *  § 01 · HERO — How it works
         * ═════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="relative pt-12 lg:pt-16 pb-20">
          {/* Atmospheric */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
          <div className="absolute inset-x-0 top-0 h-[640px] pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 35%, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.06) 40%, rgba(246,243,234,0) 70%)' }} />

          <div className="max-w-[1380px] mx-auto px-6 relative">
            {/* Live badge */}
            <div className="fade-in flex justify-center mb-9">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink/12 bg-paper/80 backdrop-blur-sm">
                <span className="flex items-center gap-1.5 text-teal">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
                  <span className="mono-stat">Live</span>
                </span>
                <span className="text-ink/30">&mdash;</span>
                <span className="text-[11.5px] text-ink-soft">Evidence Engine v0.9 &middot; 4 AI agents &middot; closed beta</span>
              </div>
            </div>

            {/* Headline */}
            <div className="fade-in d-1 text-center max-w-[1100px] mx-auto">
              <h1 className="display text-[52px] md:text-[72px] lg:text-[96px] tracking-[-0.03em] leading-[0.96]">
                Medical literature,
                <br />
                finally <span className="italic text-teal">understood</span>.
              </h1>
            </div>

            {/* Subhead */}
            <div className="fade-in d-2 mt-7 text-center max-w-[620px] mx-auto">
              <p className="serif-body text-[17px] md:text-[19px] text-ink-soft leading-[1.5]">
                Six specialised agents read the paper and return a structured summary, a breakdown of the
                findings, a shareable card, and a clinical bottom line &mdash; in about thirty seconds.
              </p>
            </div>

            {/* Search bar */}
            <div className="fade-in d-3 mt-10 max-w-[760px] mx-auto">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-bright/30 via-teal-deep/20 to-teal-bright/20 blur-2xl opacity-50 rounded-[26px]" />
                <div className="relative bg-paper border border-ink/15 rounded-[22px] shadow-[0_30px_70px_-30px_rgba(11,29,42,0.35),0_2px_8px_-4px_rgba(11,29,42,0.1)] overflow-hidden">
                  <HeroSearch />
                  {/* Filter rail */}
                  <div className="border-t border-ink/8 px-4 py-2.5 flex items-center gap-2 text-[11.5px] bg-paper-warm/60 overflow-x-auto">
                    {['Cardiology', 'Systematic review', '2022 — 2024'].map((f) => (
                      <span key={f} className="flex items-center gap-1 px-2.5 h-7 rounded-full border border-ink/12 text-ink-soft shrink-0 cursor-pointer">
                        {f}
                        <Icon icon="lucide:chevron-down" className="text-[11px] text-ink/40" />
                      </span>
                    ))}
                    <span className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-ink text-paper shrink-0">
                      Level I &ge;
                      <Icon icon="lucide:chevron-down" className="text-[11px] text-paper/60" />
                    </span>
                    <div className="ml-auto hidden md:flex items-center gap-1.5 text-ink/55 shrink-0">
                      <span className="mono-stat text-ink/45">N</span>
                      <span className="font-medium text-ink-soft">1,847</span>
                      <span>papers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="fade-in d-4 mt-7 flex flex-col md:flex-row items-center justify-center gap-3">
              <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-6 h-12 bg-ink text-paper rounded-[14px] text-[14px] font-semibold w-full md:w-auto">
                Sign up &mdash; free for physicians
                <Icon icon="lucide:arrow-right" className="text-[15px]" />
              </Link>
              {firstPaperId ? (
                <Link href={`/paper/${firstPaperId}`} className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-paper border border-ink/15 text-ink rounded-[14px] text-[14px] font-semibold hover-tint w-full md:w-auto">
                  <Icon icon="lucide:play" className="text-[14px] text-teal" />
                  Try a paper &mdash; no signup
                </Link>
              ) : (
                <Link href="/search" className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-paper border border-ink/15 text-ink rounded-[14px] text-[14px] font-semibold hover-tint w-full md:w-auto">
                  <Icon icon="lucide:play" className="text-[14px] text-teal" />
                  Browse papers
                </Link>
              )}
            </div>

            <div className="fade-in d-5 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] text-ink/55">
              {['Free during beta', 'Every output links to its source', 'AI-generated · not clinician-reviewed'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Icon icon="lucide:check" className="text-teal text-[13px]" />
                  {t}
                </span>
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
              Health Specialisations "trust Claritas". Neither organisation has any
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
                Claritas is in closed beta. The corpus is open-access research from PubMed Central,
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
                            <Icon icon="lucide:badge-check" className="text-[12px]" />
                            VERIFIED
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
                        <span className="mono-stat text-ink/45">{paper.processing_time?.toFixed(1) ?? '—'}s</span>
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
