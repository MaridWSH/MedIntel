import Link from 'next/link';
import { getAllPapers } from '../../lib/papers';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export default async function PapersListPage() {
  const papers = await getAllPapers();

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative max-w-[1380px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">All Papers</h1>
        <div className="grid gap-4">
          {papers.map((paper) => (
            <Link 
              key={paper.id} 
              href={`/paper/${paper.slug || paper.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {paper.title}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}