import { fetchQuery } from 'convex/nextjs';
import { cache } from 'react';
import type { PostRecord } from '@/lib/content';
import { api } from '@/lib/server/convex';

function hasPublicConvexUrl() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

function asPublishedHomePost(post: PostRecord | null) {
  return post?.published ? post : null;
}

export const getHomePagePost = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return null;
  }

  return asPublishedHomePost(await fetchQuery(api.posts.getHomePage, {}));
});

export const listPublishedPosts = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  return fetchQuery(api.posts.listPublished, {});
});

export const getPublishedPostBySlug = cache(async (slug: string) => {
  if (!hasPublicConvexUrl()) {
    return null;
  }

  return fetchQuery(api.posts.getPublishedBySlug, { slug });
});

export const listPublicLinks = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  return fetchQuery(api.links.listPublic, {});
});
