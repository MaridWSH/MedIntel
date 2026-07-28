export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    return 'http://localhost:3000';
  }
  return url.replace(/\/$/, '');
}

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base) {
    return base.replace(/\/$/, '');
  }
  return `${getSiteUrl()}/api`;
}
