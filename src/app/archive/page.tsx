import type { Metadata } from 'next';
import { ArchiveIndex } from '@/components/archive-index';
import { ArchiveListLiveSync } from '@/components/public-live-sync';
import { PublicRealtimeProvider } from '@/components/public-realtime-provider';
import { listPublishedPosts } from '@/lib/server/public-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Essays, notes, and archive entries by Ibragim Ibragimov.',
  alternates: {
    canonical: '/archive',
  },
};

export default async function ArchivePage() {
  const posts = await listPublishedPosts();

  return (
    <>
      <PublicRealtimeProvider>
        <ArchiveListLiveSync initialPosts={posts} />
      </PublicRealtimeProvider>
      <ArchiveIndex posts={posts} />
    </>
  );
}
