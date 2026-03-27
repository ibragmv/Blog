import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type AuthCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSessionToken(sessionToken: string) {
  const encoded = new TextEncoder().encode(sessionToken);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

export async function requireAdminSession(ctx: AuthCtx, sessionToken: string) {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_tokenHash", (query) => query.eq("tokenHash", tokenHash))
    .first();

  if (!session || session.expiresAt <= Date.now()) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Admin session is invalid or expired.",
    });
  }

  return session;
}
