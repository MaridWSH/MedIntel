import Link from 'next/link';
import { listPapers } from '../../lib/papers';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

/*
 * Papers are addressed by PMC id — there is no slug field on the API.
 * This used to call getAllPapers(), which walks every page of the catalogue
 * (7k+ papers, ~72 sequential requests) just to render a list. Fetch one page.
 */
const PER_PAGE = 50;

export default async function PapersListPage() {
  const { items, total } = await listPapers({ page: 1, per_page: PER_PAGE });

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-3xl font-bold">All Papers</h1>
          <span className="text-sm text-ink/50">
            Showing {items.length} of {total.toLocaleString()}
          </span>
        </div>

        <div className="grid gap-4">
          {items.map((paper) => (
            <Link
              key={paper.id}
              href={`/paper/${paper.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {paper.title || paper.id}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/search" className="text-teal-deep hover:underline text-sm">
            Search the full catalogue &rarr;
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
