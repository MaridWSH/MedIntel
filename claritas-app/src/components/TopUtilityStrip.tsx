"use client";

export default function TopUtilityStrip() {
  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] mono-stat">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink"></span>
            50,418,727 papers indexed
          </span>
          <span className="hidden md:flex items-center gap-2 text-paper/55">
            <iconify-icon icon="lucide:shield-check" className="text-teal-bright text-[11px]"></iconify-icon>
            Synthesised by 6 specialised agents · Reviewed by 1,200+ physicians
          </span>
        </div>
        <div className="flex items-center gap-4 text-paper/65">
          <span>BETA · v0.9.4</span>
          <span className="hidden md:inline text-paper/30">·</span>
          <span className="hidden md:inline">CME accredited · EG-MS · AB-2938</span>
        </div>
      </div>
    </div>
  );
}
