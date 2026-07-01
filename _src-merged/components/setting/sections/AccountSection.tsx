"use client";

import { useState } from "react";
import { ChevronDown, BadgeCheck, Upload, Check } from "lucide-react";

export default function AccountSection() {
  const [saved, setSaved] = useState(true);

  return (
    <article id="account" className="scroll-mt-28">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-tight">
          Account
        </h2>
        <span className="text-[10px] mono-stat text-ink/40">05 / 05</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Profile */}
        <div className="col-span-12 md:col-span-7 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ink/8">
            <div className="relative w-14 h-14 rounded-full bg-teal-deep/15 border border-teal-deep/30 flex items-center justify-center font-serif text-[20px] font-medium text-teal-deep">
              KE
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-ink">
                Khaled El-Sherif, MD
              </div>
              <div className="text-[11.5px] text-ink-soft mt-0.5">
                Consultant Cardiologist · Al-Moasat University Hospital
              </div>
            </div>
            <button className="text-[11px] mono-stat text-teal-deep hover:underline">
              CHANGE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] mono-stat text-ink/45 mb-1.5 block">
                FIRST NAME
              </label>
              <input
                type="text"
                defaultValue="Khaled"
                onChange={() => setSaved(false)}
                className="w-full h-10 px-3 rounded-md bg-paper-warm/60 border border-ink/12 text-[13px] outline-none focus:border-teal-deep transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] mono-stat text-ink/45 mb-1.5 block">
                LAST NAME
              </label>
              <input
                type="text"
                defaultValue="El-Sherif"
                onChange={() => setSaved(false)}
                className="w-full h-10 px-3 rounded-md bg-paper-warm/60 border border-ink/12 text-[13px] outline-none focus:border-teal-deep transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] mono-stat text-ink/45 mb-1.5 block">
                EMAIL
              </label>
              <input
                type="email"
                defaultValue="k.el-sherif@cardiology.eg"
                onChange={() => setSaved(false)}
                className="w-full h-10 px-3 rounded-md bg-paper-warm/60 border border-ink/12 text-[13px] outline-none focus:border-teal-deep transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] mono-stat text-ink/45 mb-1.5 block">
                PRIMARY SPECIALTY
              </label>
              <div className="relative">
                <select
                  onChange={() => setSaved(false)}
                  className="w-full h-10 px-3 pr-8 rounded-md bg-paper-warm/60 border border-ink/12 text-[13px] outline-none appearance-none focus:border-teal-deep"
                >
                  <option>Cardiology</option>
                  <option>Internal Medicine</option>
                  <option>Endocrinology</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] mono-stat text-ink/45 mb-1.5 block">
                SUBSPECIALTY
              </label>
              <div className="relative">
                <select
                  onChange={() => setSaved(false)}
                  className="w-full h-10 px-3 pr-8 rounded-md bg-paper-warm/60 border border-ink/12 text-[13px] outline-none appearance-none focus:border-teal-deep"
                >
                  <option>Interventional Cardiology</option>
                  <option>Heart Failure</option>
                  <option>Electrophysiology</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-ink/8 flex items-center justify-between">
            <span className="text-[11px] mono-stat text-ink/45">
              CHANGES SAVE AUTOMATICALLY
            </span>
            <button
              onClick={() => setSaved(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-ink text-paper text-[12px] font-semibold rounded-md transition-colors hover:bg-ink-soft"
            >
              <Check className="text-teal-bright" size={13} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Medical license */}
        <div className="col-span-12 md:col-span-5 bg-paper-warm border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <BadgeCheck className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">Medical License</h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-5">
            Verified annually with the Egyptian Medical Syndicate.
          </p>

          <div className="p-4 rounded-lg bg-paper border border-ink/12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] mono-stat text-ink/45">EG-MS LICENSE</span>
              <span className="px-1.5 h-5 rounded text-[9px] mono-stat bg-teal-deep/12 text-teal-deep font-semibold inline-flex items-center">
                VERIFIED
              </span>
            </div>
            <div className="font-serif text-[18px] font-medium tracking-tight text-ink">
              #EG-29384
            </div>
            <div className="text-[11px] text-ink-soft mt-1">
              Issued 2009 · Expires 09/2025
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-ink-soft">Verification status</span>
              <span className="text-[11px] font-medium text-teal-deep">Auto-renews</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-ink-soft">Arab Board status</span>
              <span className="text-[11px] font-medium text-teal-deep">
                Fellow, class of 2014
              </span>
            </div>
          </div>

          <button className="mt-5 inline-flex items-center gap-1.5 text-[11.5px] text-teal-deep hover:underline">
            <Upload size={13} />
            Upload renewed license
          </button>
        </div>
      </div>
    </article>
  );
}
