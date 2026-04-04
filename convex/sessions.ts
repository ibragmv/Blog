import { ConvexError, v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

const sessionValidator = v.object({
  id: v.id('sessions'),
  email: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
});

function serializeSession(session: Doc<'sessions'>) {
  return {
    id: session._id,
    email: session.email,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const create = mutation({
  args: {
    tokenHash: v.string(),
    email: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id('sessions'),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    if (!args.tokenHash.trim() || !normalizedEmail) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Session token hash and email are required.',
      });
    }

    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_tokenHash', (query) => query.eq('tokenHash', args.tokenHash))
      .first();

    if (existingSession) {
      if (
        existingSession.email === normalizedEmail &&
        existingSession.expiresAt === args.expiresAt
      ) {
        return existingSession._id;
      }

      await ctx.db.patch('sessions', existingSession._id, {
        email: normalizedEmail,
        expiresAt: args.expiresAt,
      });

      return existingSession._id;
    }

    return await ctx.db.insert('sessions', {
      email: normalizedEmail,
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
      .query('sessions')
      .withIndex('by_tokenHash', (query) => query.eq('tokenHash', args.tokenHash))
      .first();

    if (!session || session.expiresAt <= Date.now()) {
      return null;
    }

    return serializeSession(session);
  },
});

export const removeByTokenHash = mutation({
  args: {
    tokenHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_tokenHash', (query) => query.eq('tokenHash', args.tokenHash))
      .collect();

    await Promise.all(sessions.map((session) => ctx.db.delete('sessions', session._id)));

    return null;
  },
});
