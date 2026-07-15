'use client';

import Icon from '../components/ui/Icon';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-paper overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative max-w-[560px] mx-auto px-6 py-20 text-center">
        {/* Error icon */}
        <div className="fade-in mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center">
            <Icon icon="lucide:alert-triangle" className="text-[28px] text-amber-bg" />
          </div>
        </div>

        <div className="fade-in d-1 mb-3">
          <div className="mono-stat text-ink/45 mb-3">SOMETHING WENT WRONG</div>
        </div>

        <h1 className="fade-in d-2 display text-[36px] md:text-[44px] tracking-tight mb-5">
          An unexpected error
          <span className="italic text-teal"> occurred.</span>
        </h1>

        <p className="fade-in d-3 serif-body text-[16px] text-ink-soft leading-[1.55] max-w-[420px] mx-auto mb-10">
          We couldn&rsquo;t complete that request. Try again, and keep the reference below if the problem persists.
        </p>

        {error.digest && (
          <div className="fade-in d-3 inline-flex items-center gap-2 px-3 h-8 rounded-lg bg-ink/5 border border-ink/10 mb-8">
            <span className="mono-stat text-ink/50">REF</span>
            <span className="mono text-[12px] text-ink-soft">{error.digest}</span>
          </div>
        )}

        <div className="fade-in d-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-teal-deep text-paper text-[13.5px] font-semibold"
          >
            <Icon icon="lucide:refresh-cw" className="text-[14px]" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] border border-ink/15 text-ink text-[13.5px] font-medium hover-tint"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
