import type { Metadata } from 'next';
import { PublicLinks } from '@/components/public-links';
import { LinksLiveSync } from '@/components/public-live-sync';
import { PublicRealtimeProvider } from '@/components/public-realtime-provider';
import { listPublicLinks } from '@/lib/server/public-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Links',
  description: 'A curated list of places to find Ibragim Ibragimov online.',
  alternates: {
    canonical: '/links',
  },
};

export default async function LinksPage() {
  const links = await listPublicLinks();

  return (
    <>
      <PublicRealtimeProvider>
        <LinksLiveSync initialLinks={links} />
      </PublicRealtimeProvider>
      <PublicLinks links={links} />
    </>
  );
}
