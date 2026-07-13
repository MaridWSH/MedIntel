import Icon from '../ui/Icon';

/**
 * Every claim in this strip is now one we can actually stand behind.
 *
 * It previously advertised "50,418,727 papers indexed" (the real figure is four
 * orders of magnitude smaller), "Reviewed by 1,200+ physicians" (no physician has
 * reviewed anything here), and "CME accredited · EG-MS · AB-2938" — an
 * accreditation number that does not exist. Claiming CME accreditation you do not
 * hold is not a cosmetic problem, so none of it comes back without a source.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://med.aidashnews.tech/api';

async function getPaperCount(): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/papers?per_page=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.total === 'number' ? data.total : null;
  } catch {
    return null;
  }
}

export default async function TopUtilityStrip() {
  const count = await getPaperCount();

  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] font-mono font-medium tracking-[0.04em] uppercase">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
            {count === null
              ? 'Papers summarised'
              : `${count.toLocaleString()} papers summarised`}
          </span>
          <span className="hidden md:flex items-center gap-2 text-paper/55">
            <Icon icon="lucide:bot" className="text-teal-bright text-[11px]" />
            AI-generated summaries &middot; Not a substitute for the source paper
          </span>
        </div>

        <div className="flex items-center gap-4 text-paper/65">
          <span>BETA &middot; v0.9.4</span>
          <span className="hidden md:inline text-paper/30">&middot;</span>
          <span className="hidden md:inline">Not clinical advice</span>
        </div>
      </div>
    </div>
  );
}
