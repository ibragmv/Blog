import { ConvexError, v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { requireAdminSession } from './auth';

const HOME_SLUG = 'home';

const postValidator = v.object({
  id: v.id('posts'),
  titleRU: v.string(),
  titleEN: v.optional(v.string()),
  slug: v.string(),
  contentRU: v.string(),
  contentEN: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  published: v.boolean(),
  isPage: v.boolean(),
});

function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function serializePost(post: Doc<'posts'>) {
  return {
    id: post._id,
    titleRU: post.titleRU,
    ...(post.titleEN !== undefined ? { titleEN: post.titleEN } : {}),
    slug: post.slug,
    contentRU: post.contentRU,
    ...(post.contentEN !== undefined ? { contentEN: post.contentEN } : {}),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    published: post.published,
    isPage: post.isPage,
  };
}

function buildPostDocument(
  args: {
    titleRU: string;
    slug: string;
    contentRU: string;
    titleEN?: string;
    contentEN?: string;
    published: boolean;
    isPage?: boolean;
  },
  createdAt: number,
  updatedAt: number
) {
  const normalizedSlug = normalizeSlug(args.slug);
  const titleEN = normalizeOptionalString(args.titleEN);
  const contentEN = normalizeOptionalString(args.contentEN);
  const isHomePage = normalizedSlug === HOME_SLUG;

  return {
    titleRU: args.titleRU.trim(),
    slug: normalizedSlug,
    contentRU: args.contentRU,
    createdAt,
    updatedAt,
    published: args.published,
    isPage: isHomePage || args.isPage === true,
    ...(titleEN !== undefined ? { titleEN } : {}),
    ...(contentEN !== undefined ? { contentEN } : {}),
  };
}

function isSamePostDocument(post: Doc<'posts'>, candidate: ReturnType<typeof buildPostDocument>) {
  return (
    post.titleRU === candidate.titleRU &&
    post.titleEN === candidate.titleEN &&
    post.slug === candidate.slug &&
    post.contentRU === candidate.contentRU &&
    post.contentEN === candidate.contentEN &&
    post.createdAt === candidate.createdAt &&
    post.published === candidate.published &&
    post.isPage === candidate.isPage
  );
}

export const listPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(postValidator),
  handler: async (ctx, args) => {
    const postsQuery = ctx.db
      .query('posts')
      .withIndex('by_published_and_isPage_and_createdAt', (query) =>
        query.eq('published', true).eq('isPage', false)
      )
      .order('desc');

    const posts =
      args.limit !== undefined ? await postsQuery.take(args.limit) : await postsQuery.collect();

    return posts.map(serializePost);
  },
});

export const getPublishedBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(postValidator, v.null()),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query('posts')
      .withIndex('by_published_and_isPage_and_slug_and_updatedAt_and_createdAt', (query) =>
        query.eq('published', true).eq('isPage', false).eq('slug', normalizeSlug(args.slug))
      )
      .order('desc')
      .first();

    return post ? serializePost(post) : null;
  },
});

export const getHomePage = query({
  args: {},
  returns: v.union(postValidator, v.null()),
  handler: async (ctx) => {
    const post = await ctx.db
      .query('posts')
      .withIndex('by_published_and_isPage_and_slug_and_updatedAt_and_createdAt', (query) =>
        query.eq('published', true).eq('isPage', true).eq('slug', HOME_SLUG)
      )
      .order('desc')
      .first();

    return post ? serializePost(post) : null;
  },
});

export const listAdmin = query({
  args: {
    sessionToken: v.string(),
  },
  returns: v.array(postValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);

    const posts = await ctx.db.query('posts').withIndex('by_createdAt').order('desc').collect();
    return posts.map(serializePost);
  },
});

export const getAdminById = query({
  args: {
    sessionToken: v.string(),
    postId: v.id('posts'),
  },
  returns: v.union(postValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const post = await ctx.db.get('posts', args.postId);
    return post ? serializePost(post) : null;
  },
});

export const save = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.optional(v.id('posts')),
    titleRU: v.string(),
    slug: v.string(),
    contentRU: v.string(),
    titleEN: v.optional(v.string()),
    contentEN: v.optional(v.string()),
    published: v.boolean(),
    isPage: v.optional(v.boolean()),
  },
  returns: v.id('posts'),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);

    const normalizedSlug = normalizeSlug(args.slug);

    if (!args.titleRU.trim() || !normalizedSlug || !args.contentRU.trim()) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Russian title, slug, and Russian content are required.',
      });
    }

    if (normalizedSlug === HOME_SLUG && args.isPage === false) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'The home post must always be saved as a page.',
      });
    }

    const conflictingPost = (
      await ctx.db
        .query('posts')
        .withIndex('by_slug_and_updatedAt_and_createdAt', (query) =>
          query.eq('slug', normalizedSlug)
        )
        .order('desc')
        .take(args.postId ? 2 : 1)
    ).find((post) => post._id !== args.postId);

    if (conflictingPost) {
      throw new ConvexError({
        code: 'SLUG_TAKEN',
        message: 'Another post already uses this slug.',
      });
    }

    if (args.postId) {
      const existingPost = await ctx.db.get('posts', args.postId);

      if (!existingPost) {
        throw new ConvexError({
          code: 'NOT_FOUND',
          message: 'Post not found.',
        });
      }

      const nextPost = buildPostDocument(args, existingPost.createdAt, Date.now());

      if (isSamePostDocument(existingPost, nextPost)) {
        return args.postId;
      }

      await ctx.db.replace('posts', args.postId, nextPost);

      return args.postId;
    }

    const now = Date.now();
    return await ctx.db.insert('posts', buildPostDocument(args, now, now));
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.id('posts'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const post = await ctx.db.get('posts', args.postId);

    if (!post) {
      return null;
    }

    await ctx.db.delete('posts', args.postId);
    return null;
  },
});
