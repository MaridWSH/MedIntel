import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical research workflow survey · Claritas',
  description: 'Tell us how you currently find and review medical research.',
};

export default function ResearchSurveyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
