"use client";

import Link from "next/link";
import { useState } from "react";
import Stepper from "./Stepper";
import PlanCards from "./PlanCards";
import CmeToggle from "./CmeToggle";
import ConfirmPanel from "./ConfirmPanel";

type VerificationMode = "licence" | "institutional";
type Plan = "free" | "professional" | "research";

export default function SignupMain() {
  const [mode, setMode] = useState<VerificationMode>("licence");
  const [firstName, setFirstName] = useState("Amelia");
  const [lastName, setLastName] = useState("El-Sherif");
  const [authority, setAuthority] = useState("Egyptian Medical Syndicate (نقابة الأطباء)");
  const [license, setLicense] = useState("EG-MS-48213-04");
  const [specialty, setSpecialty] = useState("Cardiology");
  const [plan, setPlan] = useState<Plan>("professional");
  const [cmeEnabled, setCmeEnabled] = useState(true);

  const totalPrice = plan === "free" ? 0 : plan === "professional" ? 19 : 39;
  const monthlyTotal = totalPrice + (cmeEnabled ? 9 : 0);

  return (
    <main className="relative pt-10 lg:pt-14 pb-20">
      <div className="absolute inset-0 grid-bg pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-[560px] halo pointer-events-none"></div>

      <div className="max-w-[1080px] mx-auto px-3 sm:px-4 relative">
        {/* Breadcrumb / context */}
        <div className="fade-up flex items-center justify-between mb-7">
          <div className="flex items-center gap-2 text-[11.5px] text-ink/55">
            <Link href="/" className="hover:text-teal-deep">Claritas</Link>
            <iconify-icon icon="lucide:chevron-right" className="text-[12px] text-ink/30"></iconify-icon>
            <span className="text-ink-soft">Sign up</span>
            <iconify-icon icon="lucide:chevron-right" className="text-[12px] text-ink/30"></iconify-icon>
            <span className="text-teal-deep font-medium">Verify credentials</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10.5px] mono-stat text-ink/40">
            <iconify-icon icon="lucide:lock" className="text-[11px]"></iconify-icon>
            ENCRYPTED · TLS 1.3
          </div>
        </div>

        {/* Headline */}
        <div className="fade-up delay-1 mb-9">
          <div className="text-[10.5px] mono-stat text-teal-deep mb-3">§ 02 · PHYSICIAN VERIFICATION</div>
          <h1 className="display text-[44px] md:text-[64px] tracking-tight max-w-[820px]">
            Verify your licence.<br />
            <span className="italic text-teal">Then start the trial.</span>
          </h1>
          <p className="serif-body text-[17px] md:text-[18px] text-ink-soft leading-[1.5] mt-4 max-w-[560px]">
            Every Claritas account is gated by physician-only verification. We accept medical licence numbers from 22 Arab Board states, or any institutional email on the educational TLD list.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 lg:gap-10">
          <Stepper />

          <div className="col-span-12 lg:col-span-8 fade-up delay-3">
            <div className="bg-paper border border-ink-12 rounded-3xl p-2 shadow-[0_24px_60px_-30px_rgba(11,29,42,0.22)]">
              {/* Mode tabs */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setMode("licence")}
                  className={`group relative px-4 py-3 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 ${
                    mode === "licence"
                      ? "bg-ink text-paper"
                      : "bg-paper border border-ink-12 hover-tint"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    mode === "licence" ? "bg-teal-bright/15 border border-teal-bright/30" : "bg-ink/8 border border-ink/10"
                  }`}>
                    <iconify-icon icon="lucide:badge-check" className={`text-[18px] ${mode === "licence" ? "text-teal-bright" : "text-ink-soft"}`}></iconify-icon>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold leading-tight">Medical licence number</div>
                    <div className={`text-[10.5px] mono-stat mt-0.5 ${mode === "licence" ? "text-paper/55" : "text-ink/45"}`}>
                      RECOMMENDED · 30 SECONDS
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("institutional")}
                  className={`group relative px-4 py-3 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 ${
                    mode === "institutional"
                      ? "bg-ink text-paper"
                      : "bg-paper border border-ink-12 hover-tint"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    mode === "institutional" ? "bg-teal-bright/15 border border-teal-bright/30" : "bg-ink/8 border border-ink/10"
                  }`}>
                    <iconify-icon icon="lucide:building-2" className={`text-[18px] ${mode === "institutional" ? "text-teal-bright" : "text-ink-soft"}`}></iconify-icon>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-soft leading-tight">Institutional email</div>
                    <div className={`text-[10.5px] mono-stat mt-0.5 ${mode === "institutional" ? "text-paper/55" : "text-ink/45"}`}>
                      EG-MED.EDU · KSA-MED.SCH
                    </div>
                  </div>
                </button>
              </div>

              <div className="p-5 md:p-6 lg:p-7">
                <div className="mb-7">
                  <h2 className="serif text-[28px] md:text-[32px] tracking-tight leading-tight">
                    {mode === "licence" ? "Confirm your medical credentials" : "Confirm your institutional affiliation"}
                  </h2>
                  <p className="serif-body text-[15.5px] text-ink-soft mt-3 leading-[1.5] max-w-[560px]">
                    {mode === "licence"
                      ? "Enter the licence number issued by your national medical authority. We look it up against the public registries of the Egyptian Medical Syndicate and twelve other Arab Board member states."
                      : "Use an email address issued by your university, medical school, or teaching hospital. We send a one-time verification link and never store your institutional inbox."}
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center justify-between mb-2" htmlFor="first-name">
                        <span className="text-[11.5px] font-medium text-ink-soft">First name</span>
                        <span className="text-[9.5px] mono-stat text-ink/40">AS ON LICENCE</span>
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="field-input w-full h-12 px-4 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink"
                        placeholder="e.g., Amelia"
                      />
                      <p className="text-[10.5px] mono-stat text-teal-deep mt-1.5 flex items-center gap-1.5">
                        <iconify-icon icon="lucide:check-circle-2" className="text-[12px]"></iconify-icon>
                        MATCHES REGISTRY — DR. AMELIA SHARIF
                      </p>
                    </div>
                    <div>
                      <label className="flex items-center justify-between mb-2" htmlFor="last-name">
                        <span className="text-[11.5px] font-medium text-ink-soft">Family name</span>
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="field-input w-full h-12 px-4 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink"
                        placeholder="e.g., El-Sherif"
                      />
                    </div>
                  </div>

                  {mode === "licence" ? (
                    <>
                      <div>
                        <label className="flex items-center justify-between mb-2" htmlFor="authority">
                          <span className="text-[11.5px] font-medium text-ink-soft">Issuing authority</span>
                          <button type="button" className="text-[10.5px] mono-stat text-teal-deep hover:underline flex items-center gap-1">
                            <iconify-icon icon="lucide:info" className="text-[11px]"></iconify-icon> LIST OF REGISTRIES
                          </button>
                        </label>
                        <div className="relative">
                          <select
                            id="authority"
                            value={authority}
                            onChange={(e) => setAuthority(e.target.value)}
                            className="field-input w-full h-12 pl-4 pr-10 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink appearance-none cursor-pointer"
                          >
                            <option>Egyptian Medical Syndicate (نقابة الأطباء)</option>
                            <option>Arab Board of Health Specialisations</option>
                            <option>Saudi Commission for Health Specialties</option>
                            <option>Jordan Medical Association</option>
                            <option>Lebanese Order of Physicians</option>
                          </select>
                          <iconify-icon icon="lucide:chevron-down" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink/45 pointer-events-none"></iconify-icon>
                        </div>
                        <p className="text-[10.5px] mono-stat text-ink/45 mt-1.5">SELECTED REGISTRY · 84,000+ MEMBERS</p>
                      </div>

                      <div>
                        <label className="flex items-center justify-between mb-2" htmlFor="license">
                          <span className="text-[11.5px] font-medium text-ink-soft">Medical licence number</span>
                          <span className="text-[9.5px] mono-stat text-ink/40">FORMAT: EG-MS-XXXXX-YY</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="license"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            className="field-input is-valid w-full h-12 pl-11 pr-10 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink mono font-medium tracking-wider"
                            placeholder="EG-MS-XXXXX-YY"
                          />
                          <iconify-icon icon="lucide:shield-check" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-teal-deep"></iconify-icon>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[11.5px] text-teal-deep flex items-center gap-1.5">
                            <iconify-icon icon="lucide:badge-check" className="text-[14px]"></iconify-icon>
                            Licence verified — Dr. Amelia Sharif, Cardiology subspecialty, active until 2027.
                          </p>
                          <button type="button" className="text-[10.5px] mono-stat text-ink/45 hover:text-teal-deep">REGISTRY ↗</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="flex items-center justify-between mb-2" htmlFor="institutional-email">
                        <span className="text-[11.5px] font-medium text-ink-soft">Institutional email</span>
                        <span className="text-[9.5px] mono-stat text-ink/40">EG · KSA · UAE · JO</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="institutional-email"
                          className="field-input w-full h-12 pl-11 pr-4 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink"
                          placeholder="amelia.sharif@kasralainy.edu.eg"
                        />
                        <iconify-icon icon="lucide:mail" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-teal-deep"></iconify-icon>
                      </div>
                      <p className="text-[10.5px] mono-stat text-ink/45 mt-1.5">VERIFICATION LINK EXPIRES IN 15 MINUTES</p>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center justify-between mb-2" htmlFor="specialty">
                      <span className="text-[11.5px] font-medium text-ink-soft">Primary specialty</span>
                      <span className="text-[9.5px] mono-stat text-ink/40">USED FOR ROUTING REVIEWS</span>
                    </label>
                    <div className="relative">
                      <select
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="field-input w-full h-12 pl-4 pr-10 rounded-xl bg-paper border border-ink-12 text-[14px] text-ink appearance-none cursor-pointer"
                      >
                        <option>Cardiology</option>
                        <option>Internal Medicine</option>
                        <option>Endocrinology</option>
                        <option>Emergency Medicine</option>
                        <option>Pediatrics</option>
                        <option>Other specialty</option>
                      </select>
                      <iconify-icon icon="lucide:chevron-down" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink/45 pointer-events-none"></iconify-icon>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded accent-teal-deep shrink-0" />
                      <span className="text-[12px] text-ink-soft leading-[1.55]">
                        I confirm I am a licensed physician, and I permit Claritas to query the registry above to verify my credential. Claritas will not retain the licence number after verification.
                      </span>
                    </label>
                  </div>

                  <div className="pt-5 mt-2 border-t border-ink/8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45">
                      <iconify-icon icon="lucide:info" className="text-[12px]"></iconify-icon>
                      VERIFICATION RECHECKS ANNUALLY · YOU CAN OPT-OUT ANY TIME
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button type="button" className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl border border-ink-15 text-ink text-[13px] font-medium hover-tint">
                        <iconify-icon icon="lucide:arrow-left" className="text-[13px]"></iconify-icon>
                        Back
                      </button>
                      <button type="button" className="btn-primary btn-ink inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-ink text-paper text-[13px] font-semibold">
                        Continue to plan selection
                        <iconify-icon icon="lucide:arrow-right" className="text-[14px] text-teal-bright"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-12 pt-8 border-t border-ink/8">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[10.5px] mono-stat text-ink/55">NEXT · CHOOSE YOUR PLAN</div>
                    <div className="text-[10.5px] mono-stat text-teal-deep">CONTINUES TO STEP 03</div>
                  </div>

                  <h3 className="serif text-[26px] md:text-[32px] tracking-tight leading-tight mb-4">
                    Which plan fits <span className="italic text-teal">your practice?</span>
                  </h3>
                  <p className="text-[13.5px] text-ink-soft leading-[1.55] max-w-[560px] mb-7">
                    Pre-select now or change later. You start with a 14-day trial on whichever tier you choose; no card required until day 12.
                  </p>

                  <PlanCards selected={plan} onSelect={setPlan} />
                  <CmeToggle enabled={cmeEnabled} onToggle={setCmeEnabled} />

                  <ConfirmPanel
                    firstName={firstName}
                    lastName={lastName}
                    specialty={specialty}
                    plan={plan}
                    cmeEnabled={cmeEnabled}
                    monthlyTotal={monthlyTotal}
                  />
                </div>
              </div>
            </div>

            {/* Help strip below */}
            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-paper-warm/50 border border-ink-10">
                <iconify-icon icon="lucide:users" className="text-[16px] text-teal-deep mb-2"></iconify-icon>
                <div className="text-[12.5px] font-medium text-ink mb-1">Already verified elsewhere?</div>
                <p className="text-[11.5px] text-ink-soft leading-[1.45]">SSO users from a member institution skip this step entirely.</p>
                <Link href="#" className="text-[10.5px] mono-stat text-teal-deep hover:underline mt-2 inline-flex items-center gap-1">CHECK INSTITUTION ↗</Link>
              </div>
              <div className="p-4 rounded-2xl bg-paper-warm/50 border border-ink-10">
                <iconify-icon icon="lucide:help-circle" className="text-[16px] text-teal-deep mb-2"></iconify-icon>
                <div className="text-[12.5px] font-medium text-ink mb-1">Licence not in the registry?</div>
                <p className="text-[11.5px] text-ink-soft leading-[1.45]">Manual verification by our clinical team in under 24 hours.</p>
                <Link href="#" className="text-[10.5px] mono-stat text-teal-deep hover:underline mt-2 inline-flex items-center gap-1">REQUEST MANUAL ↗</Link>
              </div>
              <div className="p-4 rounded-2xl bg-paper-warm/50 border border-ink-10">
                <iconify-icon icon="lucide:shield-question" className="text-[16px] text-teal-deep mb-2"></iconify-icon>
                <div className="text-[12.5px] font-medium text-ink mb-1">Why physician-only?</div>
                <p className="text-[11.5px] text-ink-soft leading-[1.45]">Every validated badge is a real physician&apos;s reputation. We protect it.</p>
                <Link href="#" className="text-[10.5px] mono-stat text-teal-deep hover:underline mt-2 inline-flex items-center gap-1">READ MISSION ↗</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
