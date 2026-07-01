import Link from 'next/link';
import Icon from '../components/ui/Icon';
import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import { papers } from '../lib/papers';

export default function Home() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative">
        {/* Hero search band */}
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
            className="absolute inset-x-0 top-0 h-[320px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 80% at 30% 20%, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 40%, rgba(246,243,234,0) 70%)',
            }}
          />

          <div className="max-w-[1380px] mx-auto px-6 pt-10 pb-8 relative">
            <div className="fade-in mb-2">
              <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45 mb-3">
                <span>CLARITAS</span>
                <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
                <span>EVIDENCE ENGINE</span>
              </div>
              <h1 className="display text-[40px] md:text-[56px] tracking-tight mb-4">
                Evidence Engine
                <span className="italic text-teal">.</span>
              </h1>
              <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.55] max-w-[560px] mb-8">
                Search 50 million papers synthesised by six AI agents, reviewed by 1,200+ physicians.
                Every study appraised, every claim linked to its source.
              </p>
            </div>

            {/* Search bar */}
            <div className="fade-in d-2 relative max-w-[800px]">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-bright/20 via-teal-deep/15 to-teal-bright/15 blur-2xl opacity-40 rounded-[26px]" />
              <div className="relative bg-paper border border-ink/15 rounded-[22px] shadow-[0_24px_60px_-30px_rgba(11,29,42,0.3),0_2px_8px_-4px_rgba(11,29,42,0.08)] overflow-hidden">
                <div className="flex items-center gap-3 pl-5 pr-3 py-3.5">
                  <Icon icon="lucide:search" className="text-[20px] text-teal shrink-0" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink/35 w-full"
                    placeholder="Search 50M+ medical papers, understood in seconds"
                  />
                  <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">
                    ⌘K
                  </span>
                  <Link
                    href="/search"
                    className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5"
                  >
                    Synthesise
                    <Icon icon="lucide:sparkles" className="text-[14px] text-teal-bright" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick filters */}
            <div className="fade-in d-3 flex flex-wrap items-center gap-2 mt-5">
              <span className="text-[10px] mono-stat text-ink/45 mr-1">POPULAR</span>
              {['GLP-1 agonists', 'SGLT2 inhibitors', 'Immunotherapy', 'Heart failure', 'Diabetes T2'].map(
                (tag) => (
                  <Link
                    key={tag}
                    href="/search"
                    className="px-3 h-7 rounded-full border border-ink/12 bg-paper text-[11.5px] text-ink-soft hover:border-teal-deep/30 hover:bg-teal-deep/5 transition-colors inline-flex items-center"
                  >
                    {tag}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* Papers grid */}
        <section className="max-w-[1380px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mono-stat text-ink/45 mb-1">SYNTHESISED PAPERS</div>
              <h2 className="serif text-[22px] tracking-tight">
                Recently analysed<span className="italic text-teal">.</span>
              </h2>
            </div>
            <Link
              href="/search"
              className="text-[12px] text-teal-deep font-medium hover:underline flex items-center gap-1"
            >
              View all
              <Icon icon="lucide:arrow-right" className="text-[13px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map((paper) => (
              <Link
                key={paper.slug}
                href={`/paper/${paper.slug}`}
                className="fade-in group block rounded-2xl border border-ink/10 bg-paper hover:border-teal-deep/30 hover:shadow-[0_16px_40px_-16px_rgba(11,29,42,0.2)] transition-all duration-300 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 h-6 rounded-md bg-ink text-paper text-[9.5px] mono-stat font-semibold flex items-center">
                      {paper.journal}
                    </span>
                    <span className="text-[10px] mono-stat text-ink/45">{paper.citation}</span>
                    {paper.validated && (
                      <span className="ml-auto flex items-center gap-1 text-[9.5px] mono-stat text-teal-deep">
                        <Icon icon="lucide:badge-check" className="text-[12px]" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <h3 className="serif text-[16px] tracking-tight leading-[1.3] mb-3 group-hover:text-teal-deep transition-colors line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-[12px] text-ink/60 leading-[1.5] line-clamp-2">
                    {paper.tldr.summary}
                  </p>
                </div>

                {/* Card footer */}
                <div className="border-t border-ink/8 px-5 py-3 flex items-center justify-between bg-paper-warm/40">
                  <div className="flex items-center gap-3">
                    <span className="mono-stat text-ink/45 flex items-center gap-1">
                      <Icon icon="lucide:activity" className="text-[11px] text-teal" />
                      HR {paper.stats.hr}
                    </span>
                    <span className="text-ink/15">|</span>
                    <span className="mono-stat text-ink/45">
                      p {paper.stats.pValue}
                    </span>
                  </div>
                  <span className="mono-stat text-teal-deep flex items-center gap-1">
                    GRADE {paper.stats.grade}
                  </span>
                </div>
              </Link>
            ))}

            {/* Placeholder card: "more coming" */}
            <div className="rounded-2xl border border-dashed border-ink/15 bg-paper-warm/20 p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
              <Icon icon="lucide:plus-circle" className="text-[28px] text-ink/20 mb-3" />
              <div className="text-[12.5px] text-ink/45 font-medium mb-1">More papers coming</div>
              <div className="text-[11px] text-ink/35">
                New syntheses added weekly from 17 databases
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-t border-ink/10 bg-paper-warm/40 py-12">
          <div className="max-w-[1380px] mx-auto px-6">
            <div className="grid grid-cols-12 gap-8">
              {[
                {
                  icon: 'lucide:zap',
                  title: 'Six AI agents',
                  desc: 'TLDR, mind map, infographic, appraisal, relevance, and citations — all generated in seconds.',
                },
                {
                  icon: 'lucide:scale',
                  title: 'GRADE appraised',
                  desc: 'Every study scored for risk of bias, randomisation quality, and evidence grade.',
                },
                {
                  icon: 'lucide:graduation-cap',
                  title: 'CME accredited',
                  desc: 'Earn 0.5 CME credits per paper, accredited by ACCME and Arab Board member states.',
                },
                {
                  icon: 'lucide:map',
                  title: 'Source-linked mind maps',
                  desc: 'PICOT elements visually mapped to exact paragraphs in the source text.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="col-span-12 sm:col-span-6 lg:col-span-3 fade-in">
                  <div className="w-10 h-10 rounded-xl bg-teal-bright/10 border border-teal-bright/20 flex items-center justify-center mb-3">
                    <Icon icon={icon} className="text-[18px] text-teal-deep" />
                  </div>
                  <h3 className="text-[14px] font-semibold mb-1.5">{title}</h3>
                  <p className="text-[12.5px] text-ink-soft leading-[1.5]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
