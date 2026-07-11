import { notFound } from 'next/navigation';
import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import PaperDetailView from '../../../components/paper/PaperDetailView';
import type { Paper } from '../../../lib/papers/types';

const API_BASE = 'https://med.aidashnews.tech/api';

/* ── Fetch paper by ID ── */
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

/* ── Page ── */
export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = await getPaperById(slug);

  if (!paper) {
    notFound();
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <PaperDetailView paper={paper} />
      <SiteFooter />
    </>
  );
}