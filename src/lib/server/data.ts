import type { LinkRecord, PostRecord } from '@/lib/content';
import { queryConvex } from '@/lib/server/convex-http';

export async function getHomePagePost() {
  return queryConvex<PostRecord | null>('posts:getHomePage');
}

export async function getPublishedPosts(limit?: number) {
  return queryConvex<PostRecord[]>('posts:listPublished', limit ? { limit } : {});
}

export async function getPublishedPostBySlug(slug: string) {
  return queryConvex<PostRecord | null>('posts:getPublishedBySlug', { slug });
}

export async function getPublicLinks() {
  return queryConvex<LinkRecord[]>('links:listPublic');
}
