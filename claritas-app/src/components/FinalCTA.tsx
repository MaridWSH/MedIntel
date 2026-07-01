"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-20 md:py-28 border-t border-ink/10 bg-ink text-paper overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full bg-teal-deep/30 blur-[120px]"></div>
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-teal-bright/15 blur-[100px]"></div>
      </div>
      <div className="absolute inset-0 grain-overlay"></div>

      <div className="max-w-[1380px] mx-auto px-6 relative text-center">
        <div className="text-[10.5px] mono-stat text-teal-bright mb-6">§ 05 · START TONIGHT</div>
        <h2 className="display text-[52px] md:text-[84px] lg:text-[104px] tracking-tight max-w-[1100px] mx-auto">
          Tomorrow&apos;s rounds,
          <br />
          <span className="italic text-teal-bright">already read.</span>
        </h2>
        <p className="serif-body text-[18px] md:text-[20px] text-paper/75 mt-7 max-w-[620px] mx-auto">
          Five free papers, every month, forever. The first search takes under twelve seconds. No
          credit card. No commitment. A physician built this for physicians.
        </p>
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="btn-primary inline-flex items-center justify-center gap-2 px-7 h-14 bg-teal-bright text-ink rounded-[16px] text-[15px] font-semibold w-full md:w-auto"
          >
            Sign up — free for physicians
            <iconify-icon icon="lucide:arrow-right" className="text-[16px]"></iconify-icon>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-7 h-14 border border-paper/25 text-paper rounded-[16px] text-[15px] font-semibold hover:bg-paper/10 transition-colors w-full md:w-auto"
          >
            Talk to our team
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10.5px] mono-stat text-paper/55">
          <iconify-icon icon="lucide:lock" className="text-[12px]"></iconify-icon>
          PHI-LICENSED · GDPR · HIPAA-ALIGNED · SOC 2 IN PROGRESS
        </div>
      </div>
    </section>
  );
}
