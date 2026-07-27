import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search medical literature',
  description:
    'Search open-access medical literature in CiteRounds and inspect structured, source-linked paper summaries.',
  alternates: { canonical: '/search' },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
