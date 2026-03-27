import type { LinkRecord, PostRecord } from '@/lib/content';
import type { NextFetchOptions } from '@/lib/server/convex-http';
import { queryConvex } from '@/lib/server/convex-http';

export async function getHomePagePost(options?: NextFetchOptions) {
  return queryConvex<PostRecord | null>('posts:getHomePage', {}, options);
}

export async function getPublishedPosts(limit?: number, options?: NextFetchOptions) {
  return queryConvex<PostRecord[]>('posts:listPublished', limit ? { limit } : {}, options);
}

export async function getPublishedPostBySlug(slug: string) {
  return queryConvex<PostRecord | null>('posts:getPublishedBySlug', { slug });
}

export async function getPublicLinks() {
  return queryConvex<LinkRecord[]>('links:listPublic');
}
