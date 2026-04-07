export const SITE_CONFIG = {
  title: 'Ibragim Ibragimov',
  siteName: 'Ibragim Ibragimov',
  description:
    'Personal archive, essays, and notes by Ibragim Ibragimov with a private admin panel powered by Convex.',
  titleSeparator: '|',
  author: 'Ibragim Ibragimov',
  locale: 'en_US',
  socialHandle: '@ibragmv',
} as const;

export function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return candidate.startsWith('http') ? candidate : `https://${candidate}`;
}

export function getSiteHost() {
  return new URL(getSiteUrl()).host;
}
