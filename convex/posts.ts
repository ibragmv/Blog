import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdminSession } from "./auth";
import { ConvexError, v } from "convex/values";

const postValidator = v.object({
  id: v.id("posts"),
  title: v.string(),
  titleEn: v.optional(v.string()),
  slug: v.string(),
  content: v.string(),
  contentEn: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  published: v.boolean(),
  isPage: v.boolean(),
});

function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function serializePost(post: Doc<"posts">) {
  return {
    id: post._id,
    title: post.title,
    ...(post.titleEn !== undefined ? { titleEn: post.titleEn } : {}),
    slug: post.slug,
    content: post.content,
    ...(post.contentEn !== undefined ? { contentEn: post.contentEn } : {}),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    published: post.published,
    isPage: post.isPage,
  };
}

function buildPostDocument(args: {
  title: string;
  slug: string;
  content: string;
  titleEn?: string;
  contentEn?: string;
  published: boolean;
  isPage?: boolean;
}, createdAt: number, updatedAt: number) {
  const normalizedSlug = args.slug.trim().toLowerCase();
  const titleEn = normalizeOptionalString(args.titleEn);
  const contentEn = normalizeOptionalString(args.contentEn);

  return {
    title: args.title.trim(),
    slug: normalizedSlug,
    content: args.content,
    createdAt,
    updatedAt,
    published: args.published,
    isPage: args.isPage ?? normalizedSlug === "home",
    ...(titleEn !== undefined ? { titleEn } : {}),
    ...(contentEn !== undefined ? { contentEn } : {}),
  };
}

export const listPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(postValidator),
  handler: async (ctx, args) => {
    const postsQuery = ctx.db
      .query("posts")
      .withIndex("by_published_and_isPage_and_createdAt", (query) =>
        query.eq("published", true).eq("isPage", false),
      )
      .order("desc");

    const posts =
      args.limit !== undefined
        ? await postsQuery.take(args.limit)
        : await postsQuery.collect();

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
      .query("posts")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .first();

    if (!post || !post.published) {
      return null;
    }

    return serializePost(post);
  },
});

export const getHomePage = query({
  args: {},
  returns: v.union(postValidator, v.null()),
  handler: async (ctx) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (query) => query.eq("slug", "home"))
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

    const posts = await ctx.db.query("posts").withIndex("by_createdAt").order("desc").collect();
    return posts.map(serializePost);
  },
});

export const getAdminById = query({
  args: {
    sessionToken: v.string(),
    postId: v.id("posts"),
  },
  returns: v.union(postValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const post = await ctx.db.get("posts", args.postId);
    return post ? serializePost(post) : null;
  },
});

export const save = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.optional(v.id("posts")),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    titleEn: v.optional(v.string()),
    contentEn: v.optional(v.string()),
    published: v.boolean(),
    isPage: v.optional(v.boolean()),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);

    if (!args.title.trim() || !args.slug.trim() || !args.content.trim()) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Title, slug, and content are required.",
      });
    }

    const normalizedSlug = args.slug.trim().toLowerCase();
    const conflictingPost = (
      await ctx.db
        .query("posts")
        .withIndex("by_slug", (query) => query.eq("slug", normalizedSlug))
        .collect()
    ).find((post) => post._id !== args.postId);

    if (conflictingPost) {
      throw new ConvexError({
        code: "SLUG_TAKEN",
        message: "Another post already uses this slug.",
      });
    }

    if (args.postId) {
      const existingPost = await ctx.db.get("posts", args.postId);

      if (!existingPost) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Post not found.",
        });
      }

      await ctx.db.replace(
        "posts",
        args.postId,
        buildPostDocument(args, existingPost.createdAt, Date.now()),
      );

      return args.postId;
    }

    return await ctx.db.insert("posts", buildPostDocument(args, Date.now(), Date.now()));
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const post = await ctx.db.get("posts", args.postId);

    if (!post) {
      return null;
    }

    await ctx.db.delete("posts", args.postId);
    return null;
  },
});
