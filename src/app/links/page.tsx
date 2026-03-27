import type { Metadata } from 'next';
import { PublicLinks } from '@/components/public-links';
import { getPublicLinks } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Links',
  description: 'A curated list of places to find Ibragim Ibragimov online.',
  alternates: {
    canonical: '/links',
  },
};

export default async function LinksPage() {
  const links = await getPublicLinks();
  return <PublicLinks links={links} />;
}
