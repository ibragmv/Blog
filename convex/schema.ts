import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    titleEn: v.optional(v.string()),
    slug: v.string(),
    contentRU: v.string(),
    contentEN: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    published: v.boolean(),
    isPage: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_createdAt", ["createdAt"])
    .index("by_published_and_isPage_and_createdAt", ["published", "isPage", "createdAt"]),

  links: defineTable({
    title: v.string(),
    url: v.string(),
    icon: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),

  sessions: defineTable({
    email: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_expiresAt", ["expiresAt"]),
});
