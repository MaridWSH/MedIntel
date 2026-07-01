import { notFound } from 'next/navigation';
import { getPaperBySlug, getAllSlugs } from '../../../lib/papers';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import PaperDetailView from '../../../components/paper/PaperDetailView';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default function PaperPage({ params }: { params: { slug: string } }) {
  const paper = getPaperBySlug(params.slug);
  if (!paper) notFound();

  return (
    <>
      <SiteHeader />
      <PaperDetailView paper={paper} />
      <SiteFooter />
    </>
  );
}
