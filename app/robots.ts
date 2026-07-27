import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/account/', '/dashboard/'],
    },
    sitemap: 'https://citerounds.com/sitemap.xml',
    host: 'https://citerounds.com',
  };
}
