"use client";

export function TopBar() {
  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] font-mono font-medium tracking-[0.04em] uppercase">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
            50,418,727 papers indexed
          </span>
        </div>
        <div className="flex items-center gap-4 opacity-65">
          <span>BETA · v0.9.4</span>
        </div>
      </div>
    </div>
  );
}
