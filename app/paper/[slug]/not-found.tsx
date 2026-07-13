import Link from 'next/link';
import Icon from '../../../components/ui/Icon';
import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';

export default function PaperNotFound() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[350px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 45% 55% at 50% 30%, rgba(20,184,166,0.10) 0%, rgba(246,243,234,0) 70%)',
          }}
        />

        <div className="relative max-w-[620px] mx-auto px-6 py-20 text-center">
          <div className="fade-in mb-6 flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center">
              <Icon icon="lucide:file-search" className="text-[24px] text-teal-bright" />
            </div>
          </div>

          <div className="fade-in d-1 mono-stat text-teal-deep mb-3">PAPER NOT FOUND</div>

          <h1 className="fade-in d-2 display text-[32px] md:text-[42px] tracking-tight mb-4">
            This paper isn&rsquo;t in
            <span className="italic text-teal"> our corpus.</span>
          </h1>

          <p className="fade-in d-3 serif-body text-[15.5px] text-ink-soft leading-[1.55] max-w-[460px] mx-auto mb-10">
            The paper you&rsquo;re looking for may not yet be synthesised, or the URL is incorrect.
            Our corpus is open-access research from PubMed Central, and only part of it is summarised so far.
          </p>

          <div className="fade-in d-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 h-11 px-6 rounded-[14px] bg-teal-deep text-paper text-[13px] font-semibold"
            >
              <Icon icon="lucide:search" className="text-[14px]" />
              Search the Evidence Engine
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[14px] border border-ink/15 text-ink text-[13px] font-medium hover-tint"
            >
              Browse all papers
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
