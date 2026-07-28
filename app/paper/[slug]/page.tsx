import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import PaperDetailView from '../../../components/paper/PaperDetailView';
import { getApiBase, getSiteUrl } from '../../../app/lib/site';
import type { FullText, Paper } from '../../../lib/papers/types';

const API_BASE = getApiBase();
const SITE_URL = getSiteUrl();

async function getPaperById(id: string): Promise<Paper | null> {
  const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error(`Failed to fetch paper ${id}:`, res.status);
    return null;
  }

  return res.json();
}

/**
 * Fetched on the server, alongside the paper: for the ~52% of papers with no AI
 * summary this IS the page content, so rendering it client-side would mean an
 * empty first paint and nothing for crawlers. Never throws — a paper without
 * full text still has a page.
 */
async function getFullText(id: string): Promise<FullText | null> {
  try {
    const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(id)}/fulltext`, {
      next: { revalidate: 300 },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPaperById(slug);
  if (!paper) {
    return {
      title: 'Paper not found',
      robots: { index: false, follow: false },
    };
  }

  const description = (paper.tldr || paper.excerpt || paper.detailed_summary || '').replace(/\s+/g, ' ').trim();
  return {
    title: paper.title || `Paper ${paper.id}`,
    description: description.slice(0, 160),
    alternates: { canonical: `/paper/${encodeURIComponent(paper.id)}` },
    openGraph: {
      type: 'article',
      title: paper.title || `Paper ${paper.id}`,
      description: description.slice(0, 200),
      url: `/paper/${encodeURIComponent(paper.id)}`,
    },
  };
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [paper, fullText] = await Promise.all([getPaperById(slug), getFullText(slug)]);

  if (!paper) {
    notFound();
  }

  const paperJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${SITE_URL}/paper/${encodeURIComponent(paper.id)}#article`,
    headline: paper.title,
    name: paper.title,
    url: `${SITE_URL}/paper/${encodeURIComponent(paper.id)}`,
    description: (paper.tldr || paper.excerpt || paper.detailed_summary || '').replace(/\s+/g, ' ').trim().slice(0, 500),
    isAccessibleForFree: true,
    publisher: { '@id': `${SITE_URL}/#organization` },
    identifier: paper.id,
    ...(paper.author_list
      ? {
          author: paper.author_list.split(',').map((name) => ({
            '@type': 'Person',
            name: name.trim(),
          })),
        }
      : {}),
    ...(paper.journal ? { isPartOf: { '@type': 'Periodical', name: paper.journal } } : {}),
    ...(paper.doi ? { sameAs: `https://doi.org/${paper.doi.replace(/^https?:\/\/doi\.org\//, '')}` } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paperJsonLd).replace(/</g, '\\u003c') }}
      />
      <TopUtilityStrip />
      <SiteHeader />
      <PaperDetailView paper={paper} fullText={fullText} />
      <SiteFooter />
    </>
  );
}
