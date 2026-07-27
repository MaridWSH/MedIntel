import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a free CiteRounds closed-beta account.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
