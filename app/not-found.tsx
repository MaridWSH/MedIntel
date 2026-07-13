import Link from 'next/link';
import Icon from '../components/ui/Icon';
import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';

export default function NotFound() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 30%, rgba(20,184,166,0.12) 0%, rgba(246,243,234,0) 70%)',
          }}
        />

        <div className="relative max-w-[680px] mx-auto px-6 py-20 text-center">
          {/* 404 glyph */}
          <div className="fade-in mb-8">
            <span className="display text-[120px] md:text-[160px] text-ink/8 tracking-tighter leading-none select-none">
              404
            </span>
          </div>

          <div className="fade-in d-2 mb-4">
            <div className="mono-stat text-teal-deep mb-3">PAGE NOT FOUND</div>
            <h1 className="display text-[36px] md:text-[48px] tracking-tight mb-5">
              This page doesn&rsquo;t exist
              <span className="italic text-teal"> — yet.</span>
            </h1>
          </div>

          <p className="fade-in d-3 serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.55] max-w-[480px] mx-auto mb-10">
            The page you&rsquo;re looking for may have been moved, or the URL might be wrong.
            Start from the Evidence Engine, or search the papers we&rsquo;ve summarised.
          </p>

          <div className="fade-in d-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-teal-deep text-paper text-[13.5px] font-semibold"
            >
              <Icon icon="lucide:arrow-left" className="text-[15px]" />
              Back to Evidence Engine
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] border border-ink/15 text-ink text-[13.5px] font-medium hover-tint"
            >
              Sign in
              <Icon icon="lucide:arrow-right" className="text-[14px]" />
            </Link>
          </div>

          {/* Trust note */}
          {/* Was "50M+ PAPERS INDEXED · CME ACCREDITED · 1,200+ PHYSICIANS" — none of it true. */}
          <div className="fade-in d-5 mt-14 flex items-center justify-center gap-4 text-[10.5px] mono-stat text-ink/40">
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:bot" className="text-[11px] text-teal" />
              AI-SUMMARISED OPEN LITERATURE
            </span>
            <span className="text-ink/20">·</span>
            <span>BETA</span>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
