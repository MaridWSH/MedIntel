import Link from "next/link";
import type { Plan } from "./PlanCards";

interface ConfirmPanelProps {
  firstName: string;
  lastName: string;
  specialty: string;
  plan: Plan;
  cmeEnabled: boolean;
  monthlyTotal: number;
}

const planLabels: Record<Plan, string> = {
  free: "Free",
  professional: "Professional",
  research: "Research Pro",
};

const planPrices: Record<Plan, number> = {
  free: 0,
  professional: 19,
  research: 39,
};

export default function ConfirmPanel({ firstName, lastName, specialty, plan, cmeEnabled, monthlyTotal }: ConfirmPanelProps) {
  return (
    <div className="mt-8 p-6 md:p-7 rounded-3xl bg-ink text-paper relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-[260px] h-[260px] rounded-full bg-teal-deep/30 blur-[80px] pointer-events-none"></div>
      <div className="absolute inset-0 grain-overlay pointer-events-none"></div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink"></span>
          <span className="text-[10.5px] mono-stat text-teal-bright">READY TO ACTIVATE</span>
        </div>

        <h3 className="serif text-[28px] md:text-[34px] tracking-tight leading-tight text-paper max-w-[460px]">
          Your trial summary.<br />
          <span className="italic text-teal-bright">Activate when ready.</span>
        </h3>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11.5px]">
          <div>
            <div className="text-[9.5px] mono-stat text-paper/45 mb-1">PHYSICIAN</div>
            <div className="text-paper/85 font-medium leading-tight">Dr. {firstName} {lastName}</div>
            <div className="text-paper/45 text-[10.5px] mt-0.5">{specialty}</div>
          </div>
          <div>
            <div className="text-[9.5px] mono-stat text-paper/45 mb-1">PLAN</div>
            <div className="text-paper/85 font-medium leading-tight">{planLabels[plan]}</div>
            <div className="text-paper/45 text-[10.5px] mt-0.5">${planPrices[plan]} / mo after trial</div>
          </div>
          <div>
            <div className="text-[9.5px] mono-stat text-paper/45 mb-1">ADD-ON</div>
            <div className="text-paper/85 font-medium leading-tight">CME bundle · {cmeEnabled ? "on" : "off"}</div>
            <div className="text-paper/45 text-[10.5px] mt-0.5">{cmeEnabled ? "+ $9 / mo" : "—"}</div>
          </div>
          <div>
            <div className="text-[9.5px] mono-stat text-paper/45 mb-1">TOTAL AFTER TRIAL</div>
            <div className="serif text-paper text-[22px] leading-none tracking-tight">${monthlyTotal}</div>
            <div className="text-paper/45 text-[10.5px] mt-0.5">/ mo · billed annually</div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-paper/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10.5px] mono-stat text-paper/55">
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:credit-card" className="text-[12px] text-teal-bright"></iconify-icon>
            NO CARD FOR 12 DAYS
          </span>
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:rotate-ccw" className="text-[12px] text-teal-bright"></iconify-icon>
            CANCEL IN ONE CLICK
          </span>
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:archive" className="text-[12px] text-teal-bright"></iconify-icon>
            KEEP SAVED PAPERS
          </span>
          <span className="flex items-center gap-1.5">
            <iconify-icon icon="lucide:lock" className="text-[12px] text-teal-bright"></iconify-icon>
            PHI · GDPR · HIPAA
          </span>
        </div>

        <div className="mt-7 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <Link href="#" className="btn-primary inline-flex items-center justify-center gap-2 h-14 px-7 rounded-[16px] bg-teal-bright text-ink text-[15px] font-semibold w-full md:w-auto">
            Start 14-day {planLabels[plan]} trial
            <iconify-icon icon="lucide:arrow-right" className="text-[16px]"></iconify-icon>
          </Link>
          <Link href="#" className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-[16px] border border-paper/25 text-paper text-[13.5px] font-medium hover:bg-paper/10 transition-colors w-full md:w-auto">
            Change plan or CME
          </Link>
        </div>

        <p className="mt-4 text-[10.5px] mono-stat text-paper/40">
          By starting the trial you agree to the <Link href="#" className="text-paper/70 hover:text-teal-bright underline">Physician Terms</Link> and <Link href="#" className="text-paper/70 hover:text-teal-bright underline">PHI Policy</Link>.
        </p>
      </div>
    </div>
  );
}
