import Link from 'next/link';
import { getAllSlugs } from '../../lib/papers';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export default function PapersListPage() {
  const slugs = getAllSlugs();

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">All Papers</h1>
        <div className="grid gap-4">
          {slugs.map((slug) => (
            <Link 
              key={slug} 
              href={`/paper/${slug}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {slug}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}