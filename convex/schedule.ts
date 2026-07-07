import { mutation, query } from "./_generated/server";

import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("schedule")
      .withIndex("by_timestamp")
      .order("asc")
      .collect();
  },
});

export const listByTimestamp = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("schedule")
      .withIndex("by_timestamp")
      .order("asc")
      .collect();
  },
});

export const listByCreation = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("schedule")
      .withIndex("by_creation_time")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    timestamp: v.number(),
    activity: v.string(),
    description: v.string(),
    link: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("schedule", {
      timestamp: args.timestamp,
      activity: args.activity,
      description: args.description,
      link: args.link,
      linkLabel: args.linkLabel,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("schedule"),
    timestamp: v.optional(v.number()),
    activity: v.optional(v.string()),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("schedule") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
