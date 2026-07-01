import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';

export default function PaperLoading() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8 animate-pulse">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="h-3 bg-ink/8 rounded w-24" />
            <div className="h-6 bg-ink/8 rounded w-full" />
            <div className="h-6 bg-ink/8 rounded w-5/6" />
            <div className="h-px bg-ink/8 my-5" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-ink/8" />
                <div className="flex-1">
                  <div className="h-2.5 bg-ink/8 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="space-y-3">
              <div className="h-3 bg-ink/6 rounded w-28" />
              <div className="h-7 bg-ink/8 rounded w-4/5" />
              <div className="h-7 bg-ink/8 rounded w-3/5" />
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 bg-ink/6 rounded-xl flex-1" />
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <div className="h-3 bg-ink/6 rounded w-full" />
              <div className="h-3 bg-ink/6 rounded w-11/12" />
              <div className="h-3 bg-ink/6 rounded w-9/12" />
            </div>

            <div className="grid grid-cols-4 gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-ink/6 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
