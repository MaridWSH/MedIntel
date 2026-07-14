'use client';

import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

/**
 * Every claim in this strip is one we can stand behind.
 *
 * It previously advertised "50,418,727 papers indexed" (four orders of magnitude
 * out), "Reviewed by 1,200+ physicians" (no physician has reviewed anything here),
 * and "CME accredited · EG-MS · AB-2938" — an accreditation number that does not
 * exist. None of it comes back without a source.
 *
 * This is a client component on purpose. It was an async server component, but
 * it's imported by pages that are themselves 'use client' (search, login,
 * register, …), which pulled it into the client bundle and ran the fetch in the
 * browser on every render — 18 requests for a single navigation. Fetching once
 * here, with a module-level cache, is honest about where it actually runs.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://med.aidashnews.tech/api';

// Survives remounts across client-side navigation, so the count is fetched once.
let cachedCount: number | null = null;

export default function TopUtilityStrip() {
  const [count, setCount] = useState<number | null>(cachedCount);

  useEffect(() => {
    if (cachedCount !== null) return;

    let cancelled = false;
    fetch(`${API_BASE}/papers?per_page=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || typeof data?.total !== 'number') return;
        cachedCount = data.total;
        setCount(data.total);
      })
      .catch(() => {
        /* leave the count out rather than show a made-up one */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-ink text-paper">
      <div className="max-w-[1380px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px] font-mono font-medium tracking-[0.04em] uppercase">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
            {count === null ? 'Papers summarised' : `${count.toLocaleString()} papers summarised`}
          </span>
          <span className="hidden md:flex items-center gap-2 text-paper/55">
            <Icon icon="lucide:bot" className="text-teal-bright text-[11px]" />
            AI-generated summaries &middot; Not a substitute for the source paper
          </span>
        </div>

        <div className="flex items-center gap-4 text-paper/65">
          <span>CLOSED BETA</span>
          <span className="hidden md:inline text-paper/30">&middot;</span>
          <span className="hidden md:inline">Not clinical advice</span>
        </div>
      </div>
    </div>
  );
}
