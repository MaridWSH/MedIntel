import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import AnalyticsProvider from '@/providers/AnalyticsProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://citerounds.com'),
  title: {
    default: 'CiteRounds | AI-assisted medical literature review',
    template: '%s | CiteRounds',
  },
  description:
    'CiteRounds helps clinicians and researchers review open-access medical literature with structured, source-linked AI summaries.',
  applicationName: 'CiteRounds',
  category: 'medical research software',
  creator: 'CiteRounds',
  publisher: 'CiteRounds',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'CiteRounds',
    locale: 'en_US',
    title: 'CiteRounds | AI-assisted medical literature review',
    description:
      'Review open-access medical papers with structured summaries, source-linked findings, and an explicit automated fidelity status.',
    url: 'https://citerounds.com/',
  },
  twitter: {
    card: 'summary',
    title: 'CiteRounds | AI-assisted medical literature review',
    description:
      'Review open-access medical papers with structured, source-linked AI summaries.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://citerounds.com/#organization',
        name: 'CiteRounds',
        url: 'https://citerounds.com/',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://citerounds.com/#website',
        name: 'CiteRounds',
        url: 'https://citerounds.com/',
        publisher: { '@id': 'https://citerounds.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://citerounds.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${jetBrainsMono.variable} ${newsreader.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
