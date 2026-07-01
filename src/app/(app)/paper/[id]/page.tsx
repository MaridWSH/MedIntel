import { ArrowLeft, ExternalLink, BookOpen, HeartPulse, Microscope, BadgeCheck, Clock, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { PAPERS } from "@/lib/data";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = PAPERS.find((p) => p.id === id) ?? PAPERS[0];

  return (
    <main className="max-w-[1380px] mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft hover:text-teal-deep transition-colors">
          <ArrowLeft size={14} /> Back to search
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-paper border border-ink/12 rounded-2xl p-6 md:p-8 shadow-[0_8px_24px_-6px_rgba(11,29,42,0.1)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[10px] mono-stat text-ink/45 mb-2 flex items-center gap-2">
                  <BookOpen size={12} className="text-teal-deep" /> {paper.journal} · <span className="tnum">{paper.date}</span>
                </div>
                <h1 className="font-serif text-[28px] md:text-[34px] leading-[1.15] tracking-tight">{paper.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-ink text-paper text-[9.5px] font-mono font-semibold uppercase tracking-[0.04em]">
                <span className="w-1 h-1 rounded-full bg-teal-bright" /> {paper.status}
              </span>
              <span className="px-2 h-6 rounded-md bg-ink/[0.08] border border-ink/10 text-[10px] font-mono font-medium uppercase text-ink-soft">HR = {paper.hrValue}</span>
              <span className="px-2 h-6 rounded-md bg-ink/[0.08] border border-ink/10 text-[10px] font-mono font-medium uppercase text-ink-soft">P = {paper.pValue}</span>
              <span className="px-2 h-6 rounded-md bg-teal/10 border border-teal/20 text-teal-deep text-[9.5px] font-mono font-medium uppercase">{paper.gradeLabel}</span>
            </div>

            <p className="serif-body text-[16px] leading-[1.6] text-ink-soft mb-8">{paper.tldr}</p>

            <div className="space-y-6">
              <section>
                <h2 className="font-serif text-[20px] tracking-tight mb-3 flex items-center gap-2">
                  <HeartPulse size={18} className="text-teal-deep" /> Clinical bottom line
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-soft">
                  In adults with type 2 diabetes and established cardiovascular disease, once-weekly semaglutide significantly reduced the risk of major adverse cardiovascular events compared with placebo.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-[20px] tracking-tight mb-3 flex items-center gap-2">
                  <Microscope size={18} className="text-teal-deep" /> PICO summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
                  <div className="bg-paper-warm/50 border border-ink/10 rounded-xl p-4">
                    <span className="text-[10px] mono-stat text-ink/45">POPULATION</span>
                    <p className="mt-1 text-ink-soft">Adults ≥ 50 years with T2D and atherosclerotic CVD.</p>
                  </div>
                  <div className="bg-paper-warm/50 border border-ink/10 rounded-xl p-4">
                    <span className="text-[10px] mono-stat text-ink/45">INTERVENTION</span>
                    <p className="mt-1 text-ink-soft">Once-weekly subcutaneous semaglutide 1.0 mg.</p>
                  </div>
                  <div className="bg-paper-warm/50 border border-ink/10 rounded-xl p-4">
                    <span className="text-[10px] mono-stat text-ink/45">COMPARATOR</span>
                    <p className="mt-1 text-ink-soft">Placebo plus standard of care.</p>
                  </div>
                  <div className="bg-paper-warm/50 border border-ink/10 rounded-xl p-4">
                    <span className="text-[10px] mono-stat text-ink/45">OUTCOME</span>
                    <p className="mt-1 text-ink-soft">Reduced MACE by 26% (HR 0.74; 95% CI 0.58–0.95).</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <div className="text-[10px] mono-stat text-ink/45 mb-3">QUICK ACTIONS</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-ink text-paper text-[12px] font-semibold hover:bg-teal-deep transition-colors">
                <ExternalLink size={13} /> PubMed
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-ink/15 text-[12px] font-medium hover:bg-ink/5 transition-colors">
                <Share2 size={13} /> Share
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-ink/15 text-[12px] font-medium hover:bg-ink/5 transition-colors">
                <Bookmark size={13} /> Save
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-ink/15 text-[12px] font-medium hover:bg-ink/5 transition-colors">
                <BadgeCheck size={13} /> Validate
              </button>
            </div>
          </div>

          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <div className="text-[10px] mono-stat text-ink/45 mb-3">METRICS</div>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Citations</span>
                <span className="font-semibold tnum">{paper.citations.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Published</span>
                <span className="font-semibold tnum">{paper.publishedYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Study type</span>
                <span className="font-semibold">{paper.studyType.replace(/-/g, " ")}</span>
              </div>
            </div>
          </div>

          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <div className="text-[10px] mono-stat text-ink/45 mb-3">TAGS</div>
            <div className="flex flex-wrap gap-1.5">
              {paper.tags.map((tag) => (
                <span key={tag} className="px-2.5 h-7 rounded-full bg-ink/[0.04] border border-ink/10 text-[11px] text-ink-soft inline-flex items-center">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
