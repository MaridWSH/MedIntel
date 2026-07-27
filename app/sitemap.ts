import type { MetadataRoute } from 'next';

import type { PaperListResponse } from '../lib/papers/types';

const SITE_URL = 'https://citerounds.com';
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || `${SITE_URL}/api`).replace(/\/$/, '');
const PAGE_SIZE = 100;

const publicRoutes: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
  { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/paper`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
];

async function getPaperUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const firstResponse = await fetch(
      `${API_BASE}/papers?page=1&per_page=${PAGE_SIZE}&sort=id`,
      { next: { revalidate: 3600 } },
    );
    if (!firstResponse.ok) return [];

    const firstPage = (await firstResponse.json()) as PaperListResponse;
    const pages = Math.max(1, firstPage.pages || 1);
    const remainingPages = await Promise.all(
      Array.from({ length: pages - 1 }, (_, index) => index + 2).map(async (page) => {
        const response = await fetch(
          `${API_BASE}/papers?page=${page}&per_page=${PAGE_SIZE}&sort=id`,
          { next: { revalidate: 3600 } },
        );
        if (!response.ok) return [];
        const data = (await response.json()) as PaperListResponse;
        return data.items || [];
      }),
    );

    const papers = [
      ...(firstPage.items || []),
      ...remainingPages.flat(),
    ];

    return papers
      .filter((paper) => paper.id)
      .map((paper) => ({
        url: `${SITE_URL}/paper/${encodeURIComponent(paper.id)}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch {
    // Keep the core sitemap available if the paper API is temporarily down.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...publicRoutes, ...(await getPaperUrls())];
}
