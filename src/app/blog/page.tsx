import type { Metadata } from 'next';
import { BlogIndex } from '@/components/blog-index';
import { getPublishedPosts } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays, notes, and blog posts by Ibragim Ibragimov.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogIndex initialPosts={posts} />;
}
