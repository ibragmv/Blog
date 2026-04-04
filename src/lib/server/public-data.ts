import { fetchQuery } from 'convex/nextjs';
import { cache } from 'react';
import { api } from '@/lib/server/convex';

export const HOME_FALLBACK_CONTENT =
  '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.';

export const getHomePagePost = cache(async () => fetchQuery(api.posts.getHomePage, {}));

export const listPublishedPosts = cache(async () => fetchQuery(api.posts.listPublished, {}));

export const getPublishedPostBySlug = cache(async (slug: string) =>
  fetchQuery(api.posts.getPublishedBySlug, { slug })
);

export const listPublicLinks = cache(async () => fetchQuery(api.links.listPublic, {}));
