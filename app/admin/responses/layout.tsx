import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Survey responses',
  description: 'Administrator view for CiteRounds research survey and product feedback responses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResponsesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
