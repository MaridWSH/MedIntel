import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';

export default function Loading() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-3 border-ink/15 border-t-teal rounded-full animate-spin" />
          <p className="text-[13px] text-ink/50 mono-stat">Loading&hellip;</p>
        </div>
      </main>
    </>
  );
}
