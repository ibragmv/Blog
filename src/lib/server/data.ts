import type { LinkRecord, PostRecord } from '@/lib/content';
import type { NextFetchOptions } from '@/lib/server/convex-http';
import { queryConvex } from '@/lib/server/convex-http';

const REALTIME_FETCH_OPTIONS: NextFetchOptions = {
  cache: 'no-store',
};

function mergeFetchOptions(
  defaultOptions: NextFetchOptions,
  overrideOptions?: NextFetchOptions
): NextFetchOptions {
  if (!overrideOptions) {
    return defaultOptions;
  }

  return {
    ...defaultOptions,
    ...overrideOptions,
    next: {
      ...defaultOptions.next,
      ...overrideOptions.next,
      ...(overrideOptions.next?.tags ? { tags: overrideOptions.next.tags } : {}),
    },
  };
}

export async function getHomePagePost(options?: NextFetchOptions) {
  return queryConvex<PostRecord | null>(
    'posts:getHomePage',
    {},
    mergeFetchOptions(REALTIME_FETCH_OPTIONS, options)
  );
}

export async function getPublishedPosts(limit?: number, options?: NextFetchOptions) {
  return queryConvex<PostRecord[]>(
    'posts:listPublished',
    limit ? { limit } : {},
    mergeFetchOptions(REALTIME_FETCH_OPTIONS, options)
  );
}

export async function getPublishedPostBySlug(slug: string, options?: NextFetchOptions) {
  return queryConvex<PostRecord | null>(
    'posts:getPublishedBySlug',
    { slug },
    mergeFetchOptions(REALTIME_FETCH_OPTIONS, options)
  );
}

export async function getPublicLinks(options?: NextFetchOptions) {
  return queryConvex<LinkRecord[]>(
    'links:listPublic',
    {},
    mergeFetchOptions(REALTIME_FETCH_OPTIONS, options)
  );
}
