import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const sessionValidator = v.object({
  id: v.id("sessions"),
  email: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
});

function serializeSession(session: Doc<"sessions">) {
  return {
    id: session._id,
    email: session.email,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

export const create = mutation({
  args: {
    tokenHash: v.string(),
    email: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      email: args.email,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const getByTokenHash = query({
  args: {
    tokenHash: v.string(),
  },
  returns: v.union(sessionValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (query) => query.eq("tokenHash", args.tokenHash))
      .first();

    return session ? serializeSession(session) : null;
  },
});

export const removeByTokenHash = mutation({
  args: {
    tokenHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (query) => query.eq("tokenHash", args.tokenHash))
      .collect();

    await Promise.all(sessions.map((session) => ctx.db.delete("sessions", session._id)));

    return null;
  },
});
