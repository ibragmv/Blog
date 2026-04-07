import { fetchQuery } from 'convex/nextjs';
import { cache } from 'react';
import type { PostRecord } from '@/lib/content';
import { api } from '@/lib/server/convex';
import {
  isConvexServiceUnavailableError,
  warnOnConvexServiceUnavailable,
} from '@/lib/server/convex-errors';

const CONVEX_RETRY_DELAYS_MS = [250, 500, 1_000];

function hasPublicConvexUrl() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

function asPublishedHomePost(post: PostRecord | null) {
  return post?.published ? post : null;
}

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function runPublicQuery<T>(scope: string, query: () => Promise<T>, fallback: T): Promise<T> {
  let lastUnavailableError: unknown;

  try {
    return await query();
  } catch (error) {
    if (!isConvexServiceUnavailableError(error)) {
      throw error;
    }

    lastUnavailableError = error;
  }

  for (const delayMs of CONVEX_RETRY_DELAYS_MS) {
    await wait(delayMs);

    try {
      return await query();
    } catch (error) {
      if (!isConvexServiceUnavailableError(error)) {
        throw error;
      }

      lastUnavailableError = error;
    }
  }

  warnOnConvexServiceUnavailable(scope, lastUnavailableError);
  return fallback;
}

export const getHomePagePost = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return null;
  }

  return runPublicQuery(
    'public-data:getHomePagePost',
    async () => asPublishedHomePost(await fetchQuery(api.posts.getHomePage, {})),
    null
  );
});

export const listPublishedPosts = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  return runPublicQuery(
    'public-data:listPublishedPosts',
    () => fetchQuery(api.posts.listPublished, {}),
    []
  );
});

export const getPublishedPostBySlug = cache(async (slug: string) => {
  if (!hasPublicConvexUrl()) {
    return null;
  }

  return runPublicQuery(
    `public-data:getPublishedPostBySlug:${slug}`,
    () => fetchQuery(api.posts.getPublishedBySlug, { slug }),
    null
  );
});

export const listPublicLinks = cache(async () => {
  if (!hasPublicConvexUrl()) {
    return [];
  }

  return runPublicQuery(
    'public-data:listPublicLinks',
    () => fetchQuery(api.links.listPublic, {}),
    []
  );
});
