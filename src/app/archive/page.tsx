import { api } from '@convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import type { Metadata } from 'next';
import { ArchiveIndex } from '@/components/archive-index';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Essays, notes, and archive entries by Ibragim Ibragimov.',
  alternates: {
    canonical: '/archive',
  },
};

export default async function ArchivePage() {
  const preloadedPosts = await preloadQuery(api.posts.listPublished, {});
  return <ArchiveIndex preloadedPosts={preloadedPosts} />;
}
