import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdminSession } from "./auth";
import { ConvexError, v } from "convex/values";

const linkValidator = v.object({
  id: v.id("links"),
  title: v.string(),
  url: v.string(),
  icon: v.string(),
  order: v.number(),
  createdAt: v.number(),
});

function serializeLink(link: Doc<"links">) {
  return {
    id: link._id,
    title: link.title,
    url: link.url,
    icon: link.icon,
    order: link.order,
    createdAt: link.createdAt,
  };
}

function buildLinkDocument(args: {
  title: string;
  url: string;
  icon: string;
  order: number;
}, createdAt: number) {
  return {
    title: args.title.trim(),
    url: args.url.trim(),
    icon: args.icon.trim() || "default",
    order: args.order,
    createdAt,
  };
}

export const listPublic = query({
  args: {},
  returns: v.array(linkValidator),
  handler: async (ctx) => {
    const links = await ctx.db.query("links").withIndex("by_order").collect();
    return links.map(serializeLink);
  },
});

export const listAdmin = query({
  args: {
    sessionToken: v.string(),
  },
  returns: v.array(linkValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const links = await ctx.db.query("links").withIndex("by_order").collect();
    return links.map(serializeLink);
  },
});

export const save = mutation({
  args: {
    sessionToken: v.string(),
    linkId: v.optional(v.id("links")),
    title: v.string(),
    url: v.string(),
    icon: v.string(),
    order: v.number(),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);

    if (!args.title.trim() || !args.url.trim()) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Title and URL are required.",
      });
    }

    if (args.linkId) {
      const existingLink = await ctx.db.get("links", args.linkId);

      if (!existingLink) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Link not found.",
        });
      }

      await ctx.db.replace("links", args.linkId, buildLinkDocument(args, existingLink.createdAt));
      return args.linkId;
    }

    return await ctx.db.insert("links", buildLinkDocument(args, Date.now()));
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    linkId: v.id("links"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken);
    const link = await ctx.db.get("links", args.linkId);

    if (!link) {
      return null;
    }

    await ctx.db.delete("links", args.linkId);
    return null;
  },
});
