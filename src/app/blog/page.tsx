import { api } from '@convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import type { Metadata } from 'next';
import { BlogIndex } from '@/components/blog-index';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays, notes, and blog posts by Ibragim Ibragimov.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const preloadedPosts = await preloadQuery(api.posts.listPublished, {});
  return <BlogIndex preloadedPosts={preloadedPosts} />;
}
