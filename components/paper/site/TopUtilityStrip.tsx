import Icon from '../ui/Icon';

export default function TopUtilityStrip() {
  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] font-mono font-medium tracking-[0.04em] uppercase">
        {/* Left: stats */}
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
            50,418,727 papers indexed
          </span>
          <span className="hidden md:flex items-center gap-2 text-paper/55">
            <Icon icon="lucide:shield-check" className="text-teal-bright text-[11px]" />
            Synthesised by 6 specialised agents &middot; Reviewed by 1,200+ physicians
          </span>
        </div>

        {/* Right: badges */}
        <div className="flex items-center gap-4 text-paper/65">
          <span>BETA &middot; v0.9.4</span>
          <span className="hidden md:inline text-paper/30">&middot;</span>
          <span className="hidden md:inline">CME accredited &middot; EG-MS &middot; AB-2938</span>
        </div>
      </div>
    </div>
  );
}
