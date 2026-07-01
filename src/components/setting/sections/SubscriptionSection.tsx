import { Calendar, ArrowRight, Archive, Download, ArrowUpCircle } from "lucide-react";
import { INVOICES } from "@/lib/settings-data";

export default function SubscriptionSection() {
  return (
    <article id="subscription" className="scroll-mt-28">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-tight">
          Subscription &amp; Billing
        </h2>
        <span className="text-[10px] mono-stat text-ink/40">01 / 05</span>
      </div>

      {/* Current plan */}
      <div className="bg-ink text-paper rounded-2xl overflow-hidden">
        <div className="px-6 md:px-8 py-6 md:py-7 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 h-6 rounded-md bg-teal-bright text-ink text-[9.5px] mono-stat font-semibold inline-flex items-center">
                CURRENT PLAN
              </span>
              <span className="text-[10px] mono-stat text-teal-bright">
                SINCE MARCH 2024
              </span>
            </div>
            <h3 className="font-serif text-[36px] md:text-[44px] tracking-tight text-paper leading-none">
              Professional
            </h3>
            <p className="text-[13px] text-paper/70 leading-[1.5] mt-2.5 max-w-[420px]">
              All six agents, unlimited full syntheses, saved paper library,
              email digests. Billed annually at $152/year.
            </p>

            <div className="flex items-end gap-1.5 mt-5">
              <span className="font-serif text-[36px] leading-none tracking-tight text-paper">
                $152
              </span>
              <span className="text-[12px] text-paper/55 mb-1.5">/ year</span>
              <span className="text-[10px] mono-stat text-paper/40 mb-2 ml-3">
                ≈ $12.67 / MONTH · ANNUAL SAVINGS
              </span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 md:border-l md:border-paper/15 md:pl-6 flex flex-col justify-between gap-4">
            <div>
              <div className="text-[10px] mono-stat text-paper/45 mb-2">
                NEXT BILLING DATE
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-teal-bright" size={14} />
                <span className="text-[14px] font-medium">15 March 2025</span>
              </div>
              <div className="text-[11px] text-paper/55 mt-1">
                Auto-renews via Visa •••• 4821
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 bg-teal-bright text-ink text-[12px] font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(11,125,114,0.55)]">
                Manage plan
                <ArrowRight size={13} />
              </button>
              <button className="inline-flex items-center justify-center px-3.5 h-9 border border-paper/25 text-paper/85 text-[12px] font-semibold rounded-md hover:bg-paper/10 transition-colors">
                Cancel renewal
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-paper/10 px-6 md:px-8 py-4 flex items-center justify-between text-[10.5px] mono-stat text-paper/55">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-teal-bright animate-pulse" />
              ACTIVE · 287 SYNTHESSES THIS CYCLE
            </span>
            <span className="hidden md:inline">
              CME BUNDLE: <span className="text-teal-bright font-semibold">ENABLED</span>
            </span>
          </div>
          <span>RENEWS IN 47 DAYS</span>
        </div>
      </div>

      {/* Usage + upgrade */}
      <div className="grid grid-cols-12 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden mt-5">
        <div className="col-span-12 md:col-span-7 bg-paper p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] mono-stat text-ink/55">
              USAGE · CURRENT CYCLE
            </h4>
            <span className="text-[10px] mono-stat text-ink/40">RESETS 15 MAR</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <div className="font-serif text-[32px] leading-none tracking-tight">
                287<span className="text-ink/30 text-[18px]">∞</span>
              </div>
              <div className="text-[9.5px] mono-stat text-ink/45 mt-1.5">
                FULL SYNTHESSES
              </div>
              <div className="text-[11px] text-ink-soft mt-1">Unlimited tier</div>
            </div>
            <div>
              <div className="font-serif text-[32px] leading-none tracking-tight">
                14<span className="text-teal text-[18px]">h</span>
              </div>
              <div className="text-[9.5px] mono-stat text-ink/45 mt-1.5">
                CME CREDITS
              </div>
              <div className="text-[11px] text-ink-soft mt-1">14h of 50h goal</div>
            </div>
            <div>
              <div className="font-serif text-[32px] leading-none tracking-tight">
                1,204
              </div>
              <div className="text-[9.5px] mono-stat text-ink/45 mt-1.5">
                SAVED PAPERS
              </div>
              <div className="text-[11px] text-ink-soft mt-1">47 collections</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 bg-paper-warm p-6 md:p-7">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="text-teal-deep" size={15} />
            <h4 className="text-[13px] font-semibold text-ink">
              Considering Research Pro?
            </h4>
          </div>
          <p className="text-[12px] text-ink-soft leading-[1.5] mb-4">
            Bulk export, systematic review builder, PRISMA flow diagrams and 5
            collaborator seats. Pro-rate to upgrade today.
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="font-serif text-[28px] leading-none tracking-tight">$39</span>
            <span className="text-[11.5px] text-ink/55">/ month</span>
            <span className="text-[10px] mono-stat text-teal-deep ml-1.5">
              +$22.33 PRORATE
            </span>
          </div>
          <button className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 bg-ink text-paper text-[12px] font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(11,29,42,0.4)]">
            Upgrade plan
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Payment method */}
      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="col-span-12 md:col-span-7 bg-paper border border-ink/12 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] mono-stat text-ink/55">PAYMENT METHOD</h4>
            <button className="text-[11px] mono-stat text-teal-deep hover:underline">
              EDIT
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-9 rounded-md bg-ink flex items-center justify-center">
              <span className="text-paper text-[10px] font-bold font-serif italic">
                VISA
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-ink">
                Visa ending in 4821
              </div>
              <div className="text-[11.5px] text-ink/55 mt-0.5">
                Expires 09/27 · Default payment method
              </div>
            </div>
            <span className="px-2 h-6 rounded-full bg-teal-deep/10 border border-teal-deep/25 text-teal-deep text-[9.5px] mono-stat font-semibold inline-flex items-center">
              PRIMARY
            </span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 bg-paper-warm border border-ink/12 rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-[11px] mono-stat text-ink/55 mb-2">BILLING EMAIL</div>
          <div className="text-[14px] font-medium text-ink mb-3">
            k.el-sherif@cardiology.eg
          </div>
          <div className="text-[11.5px] text-ink/55 leading-[1.45]">
            Invoices and receipts are sent here. Edit your contact email in
            the Account tab.
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="mt-5 bg-paper border border-ink/12 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
          <h4 className="text-[11px] mono-stat text-ink/55">BILLING HISTORY</h4>
          <button className="text-[11px] mono-stat text-teal-deep hover:underline inline-flex items-center gap-1">
            DOWNLOAD ALL
            <Archive size={12} />
          </button>
        </div>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-[9.5px] mono-stat text-ink/40 border-b border-ink/8">
              <th className="text-left font-medium px-6 py-3">INVOICE</th>
              <th className="text-left font-medium px-6 py-3 hidden md:table-cell">DATE</th>
              <th className="text-left font-medium px-6 py-3">AMOUNT</th>
              <th className="text-left font-medium px-6 py-3 hidden md:table-cell">STATUS</th>
              <th className="text-right font-medium px-6 py-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((invoice, i) => (
              <tr
                key={invoice.id}
                className={`hover:bg-ink/5 transition-colors ${
                  i < INVOICES.length - 1 ? "border-b border-ink/8" : ""
                }`}
              >
                <td className="px-6 py-3.5 font-medium">{invoice.id}</td>
                <td className="px-6 py-3.5 text-ink-soft tnum hidden md:table-cell">
                  {invoice.date}
                </td>
                <td className="px-6 py-3.5 tnum">{invoice.amount}</td>
                <td className="px-6 py-3.5 hidden md:table-cell">
                  {invoice.status === "paid" ? (
                    <span className="px-1.5 h-5 rounded text-[9px] mono-stat bg-teal-deep/12 text-teal-deep inline-flex items-center">
                      PAID
                    </span>
                  ) : (
                    <span className="px-1.5 h-5 rounded text-[9px] mono-stat bg-ink/8 border border-ink/10 text-ink-soft inline-flex items-center">
                      PRORATE
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-ink/12 hover:bg-ink/5 transition-colors">
                    <Download size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
