import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product feedback · Claritas',
  description: 'Rate the Claritas beta and tell us what to improve next.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
