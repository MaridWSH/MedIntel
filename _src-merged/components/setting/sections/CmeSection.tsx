import { Award, ArrowUpRight, ArrowDown } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import CertificatePreview from "../CertificatePreview";
import { CME_CATEGORIES, RECENT_CREDITS } from "@/lib/settings-data";

const TOTAL_HOURS = 14.5;
const GOAL_HOURS = 50;
const PERCENT = Math.round((TOTAL_HOURS / GOAL_HOURS) * 100);

export default function CmeSection() {
  return (
    <article id="cme" className="scroll-mt-28">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-tight">
          CME Credits
        </h2>
        <span className="text-[10px] mono-stat text-ink/40">02 / 05</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Accreditation progress */}
        <div className="col-span-12 md:col-span-7 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-[14px] font-semibold text-ink">
                2024 Accreditation Goals
              </h4>
              <p className="text-[11.5px] text-ink-soft mt-1">
                Egyptian Medical Syndicate · Arab Board
              </p>
            </div>
            <span className="text-[10.5px] mono-stat text-teal-deep">ON TRACK</span>
          </div>

          <div className="mt-6 flex items-baseline gap-2 mb-1">
            <span className="font-serif text-[44px] leading-none tracking-tight text-ink">
              14<span className="text-teal">.5</span>
            </span>
            <span className="text-[13px] text-ink/55">
              of {GOAL_HOURS} hours · {PERCENT}% complete
            </span>
          </div>
          <ProgressBar percent={PERCENT} className="mt-2 mb-6" />

          <div className="grid grid-cols-3 gap-3 text-[11.5px]">
            {CME_CATEGORIES.map((cat) => (
              <div key={cat.label} className="p-3 rounded-lg bg-ink/[0.04]">
                <div className="text-[9.5px] mono-stat text-ink/45 mb-1">
                  {cat.label.toUpperCase()}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-ink">{cat.hours}h</span>
                  <span className="text-ink/40 text-[10px]">/ {cat.goalHours}h</span>
                </div>
                <ProgressBar
                  percent={(cat.hours / cat.goalHours) * 100}
                  className="mt-2"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-ink/8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] mono-stat text-ink/55">
              <Award className="text-teal-deep" size={14} />
              ARAB BOARD · CYCLE ENDS 31 DEC 2024
            </div>
            <button className="text-[11px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1">
              VIEW TRANSCRIPT
              <ArrowUpRight size={11} />
            </button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="col-span-12 md:col-span-5 bg-ink text-paper rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-deep/25 via-transparent to-amber-ink/10 pointer-events-none" />
          <div className="relative p-6 md:p-7 flex flex-col h-full">
            <div className="flex items-center justify-between text-[10px] mono-stat text-paper/45 mb-4">
              <span>NEWEST CERTIFICATE</span>
              <span>0.5 HOURS</span>
            </div>
            <div className="flex-1 flex items-center justify-center my-3">
              <CertificatePreview
                hours="0.5"
                track="Cardiology"
                name="K. El-Sherif, MD"
                source="Semaglutide and CV Outcomes · NEJM 2024"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 bg-teal-bright text-ink text-[12px] font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(20,184,166,0.5)]">
              Download PDF
              <ArrowDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent credit activity */}
      <div className="mt-5 bg-paper border border-ink/12 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
          <h4 className="text-[11px] mono-stat text-ink/55">
            RECENT CREDIT ACTIVITY
          </h4>
          <button className="text-[11px] mono-stat text-teal-deep hover:underline">
            VIEW ALL
          </button>
        </div>
        <ul>
          {RECENT_CREDITS.map((credit, i) => (
            <li
              key={credit.title}
              className={`flex items-center gap-4 px-6 py-3.5 hover:bg-ink/5 transition-colors ${
                i < RECENT_CREDITS.length - 1 ? "border-b border-ink/8" : ""
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-teal-bright" />
              <div className="flex-1">
                <div className="text-[12.5px] font-medium text-ink">
                  {credit.title}
                </div>
                <div className="text-[10.5px] mono-stat text-ink/45 mt-0.5">
                  {credit.meta}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12.5px] font-semibold text-teal-deep tnum">
                  {credit.hours}
                </div>
                <div className="text-[10px] mono-stat text-ink/40 tnum mt-0.5">
                  {credit.date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
