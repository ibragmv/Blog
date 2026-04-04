import { fetchQuery } from 'convex/nextjs';
import { cache } from 'react';
import type { PostRecord } from '@/lib/content';
import { api } from '@/lib/server/convex';

function asPublishedHomePost(post: PostRecord | null) {
  return post?.published ? post : null;
}

export const getHomePagePost = cache(async () =>
  asPublishedHomePost(await fetchQuery(api.posts.getHomePage, {}))
);

export const listPublishedPosts = cache(async () => fetchQuery(api.posts.listPublished, {}));

export const getPublishedPostBySlug = cache(async (slug: string) =>
  fetchQuery(api.posts.getPublishedBySlug, { slug })
);

export const listPublicLinks = cache(async () => fetchQuery(api.links.listPublic, {}));
