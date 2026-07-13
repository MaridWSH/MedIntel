import { notFound } from 'next/navigation';
import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import PaperDetailView from '../../../components/paper/PaperDetailView';
import type { FullText, Paper } from '../../../lib/papers/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://med.aidashnews.tech/api';

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

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [paper, fullText] = await Promise.all([getPaperById(slug), getFullText(slug)]);

  if (!paper) {
    notFound();
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <PaperDetailView paper={paper} fullText={fullText} />
      <SiteFooter />
    </>
  );
}