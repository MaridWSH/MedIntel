import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product feedback',
  description: 'Rate the CiteRounds beta and tell us what to improve next.',
  robots: { index: false, follow: false },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
