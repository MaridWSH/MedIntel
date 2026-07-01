import Link from "next/link";

export default function Stepper() {
  return (
    <aside className="col-span-12 lg:col-span-4 fade-up delay-2">
      <div className="lg:sticky lg:top-[88px]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10.5px] mono-stat text-ink/55">PROGRESS</div>
          <div className="text-[10.5px] mono-stat text-teal-deep font-semibold">STEP 02 / 05</div>
        </div>

        <div className="relative h-1 rounded-full bg-ink/8 overflow-hidden mb-7">
          <div className="absolute inset-y-0 left-0 bg-teal-deep rounded-full" style={{ width: "40%" }}></div>
          <div className="absolute inset-y-0 left-[40%] w-[15%] bg-teal-bright/40 rounded-full"></div>
        </div>

        <ol className="space-y-2.5">
          <li>
            <div className="relative flex items-start gap-3 p-3 rounded-xl">
              <div className="shrink-0 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-[11px] mono-stat font-semibold">
                <iconify-icon icon="lucide:check" className="text-[14px] text-teal-bright"></iconify-icon>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] mono-stat text-ink/40 mb-0.5">STEP 01 · COMPLETED</div>
                <div className="text-[13.5px] text-ink-soft font-medium leading-tight">Email & credentials</div>
                <div className="text-[11.5px] text-ink/50 mt-0.5">amelia.sharif@gmail.com</div>
              </div>
              <button type="button" className="text-[10.5px] mono-stat text-teal-deep hover:underline pt-1.5">EDIT</button>
            </div>
          </li>

          <li>
            <div className="relative flex items-start gap-3 p-3 rounded-xl bg-paper-warm border border-teal-deep/15">
              <div className="absolute -left-px top-0 bottom-0 w-px bg-teal-deep rounded-full"></div>
              <div className="shrink-0 relative w-8 h-8 rounded-full bg-teal-deep text-paper flex items-center justify-center text-[11px] mono-stat font-semibold">
                <span>02</span>
                <span className="absolute inset-0 rounded-full bg-teal-bright pulse-ring"></span>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] mono-stat text-teal-deep mb-0.5">STEP 02 · IN PROGRESS</div>
                <div className="text-[13.5px] text-ink font-medium leading-tight">Physician verification</div>
                <div className="text-[11.5px] text-ink/55 mt-0.5">Medical licence or institutional email</div>
              </div>
            </div>
          </li>

          <li>
            <div className="flex items-start gap-3 p-3 rounded-xl">
              <div className="shrink-0 w-8 h-8 rounded-full bg-paper border border-ink-15 text-ink/40 flex items-center justify-center text-[11px] mono-stat font-semibold">03</div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] mono-stat text-ink/40 mb-0.5">STEP 03 · UPCOMING</div>
                <div className="text-[13.5px] text-ink/55 leading-tight">Select your plan</div>
              </div>
            </div>
          </li>

          <li>
            <div className="flex items-start gap-3 p-3 rounded-xl">
              <div className="shrink-0 w-8 h-8 rounded-full bg-paper border border-ink-15 text-ink/40 flex items-center justify-center text-[11px] mono-stat font-semibold">04</div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] mono-stat text-ink/40 mb-0.5">STEP 04 · OPTIONAL</div>
                <div className="text-[13.5px] text-ink/55 leading-tight">CME bundle add-on</div>
              </div>
            </div>
          </li>

          <li>
            <div className="flex items-start gap-3 p-3 rounded-xl">
              <div className="shrink-0 w-8 h-8 rounded-full bg-paper border border-ink-15 text-ink/40 flex items-center justify-center text-[11px] mono-stat font-semibold">05</div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] mono-stat text-ink/40 mb-0.5">STEP 05 · FINAL</div>
                <div className="text-[13.5px] text-ink/55 leading-tight">Confirm & start trial</div>
              </div>
            </div>
          </li>
        </ol>

        <div className="mt-7 p-4 rounded-2xl bg-paper-warm/60 border border-ink-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <iconify-icon icon="lucide:shield-check" className="text-[16px] text-teal-deep"></iconify-icon>
            <div className="text-[11.5px] font-semibold text-ink">Encrypted at the credential</div>
          </div>
          <p className="text-[11.5px] text-ink-soft leading-[1.5]">
            Licence numbers are hashed with AES-256 and never appear in plain text outside the verification step. We will not store your credential after validation.
          </p>
          <div className="mt-3 pt-3 border-t border-ink/8 grid grid-cols-3 gap-2 text-[9.5px] mono-stat text-ink/45">
            <div>HIPAA<span className="block text-[8.5px] text-ink/35 mt-0.5">ALIGNED</span></div>
            <div>GDPR<span className="block text-[8.5px] text-ink/35 mt-0.5">ART. 9</span></div>
            <div>ISO 27001<span className="block text-[8.5px] text-ink/35 mt-0.5">IN PROGRESS</span></div>
          </div>
        </div>

        <Link href="#" className="mt-5 flex items-center gap-2 text-[11.5px] text-ink-soft hover:text-teal-deep">
          <iconify-icon icon="lucide:life-buoy" className="text-[14px] text-teal"></iconify-icon>
          Having trouble verifying? Talk to our clinical team — 24h response.
        </Link>
      </div>
    </aside>
  );
}
