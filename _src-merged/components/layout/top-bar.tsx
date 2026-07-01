import { ShieldCheck } from "lucide-react";

const TOP_BAR = {
  papersIndexed: "50,418,727",
  agentsCount: 6,
  physiciansCount: "1,200+",
  version: "v0.9.4",
};

export default function TopBar() {
  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] font-mono font-medium tracking-[0.04em] uppercase">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
            {TOP_BAR.papersIndexed} papers indexed
          </span>
          <span className="hidden md:flex items-center gap-2 text-paper/55">
            <ShieldCheck className="text-teal-bright" size={11} />
            Synthesised by {TOP_BAR.agentsCount} specialised agents · Reviewed
            by {TOP_BAR.physiciansCount} physicians
          </span>
        </div>
        <div className="flex items-center gap-4 text-paper/65">
          <span>BETA · {TOP_BAR.version}</span>
          <span className="hidden md:inline text-paper/30">·</span>
          <span className="hidden md:inline">CME accredited · EG-MS · AB-2938</span>
        </div>
      </div>
    </div>
  );
}
