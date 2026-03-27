export const SITE_CONFIG = {
  title: 'Ibragim Ibragimov',
  siteName: 'Ibragim Ibragimov',
  description:
    'Personal blog, essays, and notes by Ibragim Ibragimov with a private admin panel powered by Convex.',
  titleSeparator: '|',
  logo: '/logo.svg',
  author: 'Ibragim Ibragimov',
  locale: 'en_US',
  socialHandle: '@ibragmv',
} as const;

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';

  return candidate.startsWith('http') ? candidate : `https://${candidate}`;
}

export function getSiteHost() {
  return new URL(getSiteUrl()).host;
}
