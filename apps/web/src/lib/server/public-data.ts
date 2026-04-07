import { fetchQuery } from 'convex/nextjs';
import { cache } from 'react';
import type { PostRecord } from '@/lib/content';
import { api } from '@/lib/server/convex';
import {
  isConvexServiceUnavailableError,
  warnOnConvexServiceUnavailable,
} from '@/lib/server/convex-errors';

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

  try {
    return asPublishedHomePost(await fetchQuery(api.posts.getHomePage, {}));
  } catch (error) {
    if (isConvexServiceUnavailableError(error)) {
      warnOnConvexServiceUnavailable('public-data:getHomePagePost', error);
      return null;
    }

    throw error;
  }
});

export const listPublishedPosts = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  try {
    return await fetchQuery(api.posts.listPublished, {});
  } catch (error) {
    if (isConvexServiceUnavailableError(error)) {
      warnOnConvexServiceUnavailable('public-data:listPublishedPosts', error);
      return [];
    }

    throw error;
  }
});

export const getPublishedPostBySlug = cache(async (slug: string) => {
  if (!hasPublicConvexUrl()) {
    return null;
  }

  try {
    return await fetchQuery(api.posts.getPublishedBySlug, { slug });
  } catch (error) {
    if (isConvexServiceUnavailableError(error)) {
      warnOnConvexServiceUnavailable(`public-data:getPublishedPostBySlug:${slug}`, error);
      return null;
    }

    throw error;
  }
});

export const listPublicLinks = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  try {
    return await fetchQuery(api.links.listPublic, {});
  } catch (error) {
    if (isConvexServiceUnavailableError(error)) {
      warnOnConvexServiceUnavailable('public-data:listPublicLinks', error);
      return [];
    }

    throw error;
  }
});
