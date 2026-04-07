import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { listPublishedPosts } from '@/lib/server/public-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/archive'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/links'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/archive/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
