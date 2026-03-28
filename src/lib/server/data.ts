import type { LinkRecord, PostRecord } from '@/lib/content';
import type { NextFetchOptions } from '@/lib/server/convex-http';
import { queryConvex } from '@/lib/server/convex-http';

const PUBLIC_REVALIDATE_SECONDS = 60;

const PUBLIC_POSTS_OPTIONS: NextFetchOptions = {
  next: {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: ['posts'],
  },
};

const HOME_PAGE_OPTIONS: NextFetchOptions = {
  next: {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: ['posts', 'post:home'],
  },
};

const PUBLIC_LINKS_OPTIONS: NextFetchOptions = {
  next: {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: ['links'],
  },
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
    mergeFetchOptions(HOME_PAGE_OPTIONS, options)
  );
}

export async function getPublishedPosts(limit?: number, options?: NextFetchOptions) {
  return queryConvex<PostRecord[]>(
    'posts:listPublished',
    limit ? { limit } : {},
    mergeFetchOptions(PUBLIC_POSTS_OPTIONS, options)
  );
}

export async function getPublishedPostBySlug(slug: string, options?: NextFetchOptions) {
  return queryConvex<PostRecord | null>(
    'posts:getPublishedBySlug',
    { slug },
    mergeFetchOptions(
      {
        next: {
          revalidate: PUBLIC_REVALIDATE_SECONDS,
          tags: ['posts', `post:${slug}`],
        },
      },
      options
    )
  );
}

export async function getPublicLinks(options?: NextFetchOptions) {
  return queryConvex<LinkRecord[]>(
    'links:listPublic',
    {},
    mergeFetchOptions(PUBLIC_LINKS_OPTIONS, options)
  );
}
