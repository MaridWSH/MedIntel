import { Clock, ArrowRight } from "lucide-react";
import { Paper, STATUS_META } from "@/types/types";

export default function PaperCard({ paper }: { paper: Paper }) {
  const status = STATUS_META[paper.status];

  return (
    <article className="relative bg-paper border border-ink/12 rounded-2xl shadow-[0_8px_24px_-6px_rgba(11,29,42,0.15)] overflow-hidden transition-all duration-200 hover:bg-ink/[0.05]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-medium tracking-[0.04em] uppercase text-ink/55">
              <span className="font-semibold text-ink-soft">{paper.journal}</span>
              <span className="text-ink/25">·</span>
              <span className="tnum">{paper.date}</span>
            </div>
            <h3 className="font-serif text-[18px] leading-[1.2] tracking-tight max-w-[340px] line-clamp-2 text-ink">
              {paper.title}
            </h3>
          </div>
          <div
            className={`shrink-0 inline-flex items-center gap-1 px-2 h-6 rounded-full ${
              status.isValidated ? "bg-ink text-paper" : "bg-ink/10 text-ink/60"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                status.isValidated ? "bg-teal-bright" : "bg-ink/30"
              }`}
            />
            <span className="text-[9.5px] font-mono font-semibold uppercase tracking-[0.04em]">
              {status.label}
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-ink-soft leading-[1.4] line-clamp-2 mb-4">
          {paper.tldr}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="inline-flex items-center gap-1 px-1.5 h-6 rounded-md bg-ink text-paper text-[10px] font-mono font-medium tracking-[0.04em] uppercase">
            <span>HR</span>
            <span className="text-paper/60">=</span>
            <span className="font-semibold">{paper.hrValue}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-1.5 h-6 rounded-md bg-ink/[0.08] border border-ink/10 text-[10px] font-mono font-medium tracking-[0.04em] uppercase text-ink-soft">
            <span>P</span>
            <span className="font-medium">{paper.pValue}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-1.5 h-6 rounded-md bg-teal/10 border border-teal/20 text-teal-deep">
            <span className="text-[9.5px] font-mono font-medium tracking-[0.04em] uppercase">
              {paper.gradeLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 h-6 rounded-full bg-ink/[0.04] border border-ink/10 text-[10px] text-ink-soft inline-flex items-center font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/8 px-5 py-3 bg-paper-warm/40 flex items-center justify-between text-[10px] font-mono font-medium tracking-[0.04em] uppercase text-ink/55">
        <span className="flex items-center gap-1">
          <Clock size={11} className="text-teal" />
          {paper.timeAgo}
        </span>
        <a
          href={paper.viewHref}
          className="text-teal-deep hover:underline font-medium inline-flex items-center gap-0.5"
        >
          VIEW
          <ArrowRight size={9} />
        </a>
      </div>
    </article>
  );
}
