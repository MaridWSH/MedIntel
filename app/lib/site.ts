export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    return 'http://localhost:3000';
  }
  return url.replace(/\/$/, '');
}

export function getApiBase(): string {
  // Server-side rendering — including the prerender pass during `next build` —
  // can reach the backend directly instead of going out through the public
  // hostname and back in through the reverse proxy. Without this, building the
  // frontend requires the public URL to already be serving, which deadlocks a
  // cold deploy: the backend cannot be live before the image that fronts it
  // exists. The browser never sees this value; the guard keeps a non-public
  // env var out of the client bundle regardless of how this module is imported.
  if (typeof window === 'undefined') {
    const internal = process.env.MEDINTEL_INTERNAL_API_BASE;
    if (internal) {
      return internal.replace(/\/$/, '');
    }
  }

  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base) {
    return base.replace(/\/$/, '');
  }
  return `${getSiteUrl()}/api`;
}
