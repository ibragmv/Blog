import { api } from '@convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import type { Metadata } from 'next';
import { PublicLinks } from '@/components/public-links';

export const metadata: Metadata = {
  title: 'Links',
  description: 'A curated list of places to find Ibragim Ibragimov online.',
  alternates: {
    canonical: '/links',
  },
};

export default async function LinksPage() {
  const preloadedLinks = await preloadQuery(api.links.listPublic, {});
  return <PublicLinks preloadedLinks={preloadedLinks} />;
}
