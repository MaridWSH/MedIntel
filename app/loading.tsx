import TopUtilityStrip from '../components/site/TopUtilityStrip';
import SiteHeader from '../components/site/SiteHeader';

export default function Loading() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-12">
        {/* Skeleton: paper detail layout */}
        <div className="grid grid-cols-12 gap-8 animate-pulse">
          {/* Sidebar skeleton */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="h-4 bg-ink/8 rounded w-3/4" />
            <div className="h-3 bg-ink/6 rounded w-full" />
            <div className="h-3 bg-ink/6 rounded w-5/6" />
            <div className="h-px bg-ink/8 my-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink/8" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-ink/8 rounded w-2/3" />
                  <div className="h-2 bg-ink/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="h-3 bg-ink/6 rounded w-32" />
              <div className="h-8 bg-ink/8 rounded w-4/5" />
              <div className="h-8 bg-ink/8 rounded w-3/5" />
              <div className="h-3 bg-ink/6 rounded w-1/2" />
            </div>

            {/* Tab bar */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-ink/6 rounded-xl flex-1" />
              ))}
            </div>

            {/* Content blocks */}
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-ink/6 rounded w-full" />
              <div className="h-4 bg-ink/6 rounded w-11/12" />
              <div className="h-4 bg-ink/6 rounded w-10/12" />
              <div className="h-4 bg-ink/6 rounded w-full" />
              <div className="h-4 bg-ink/6 rounded w-8/12" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-ink/6 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
