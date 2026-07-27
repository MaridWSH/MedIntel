import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical research workflow survey',
  description: 'Tell us how you currently find and review medical research.',
  robots: { index: false, follow: false },
};

export default function ResearchSurveyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
