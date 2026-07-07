import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rulesets")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    gameId: v.id("games"),
    sections: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rulesets")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
      return existing._id;
    }

    return await ctx.db.insert("rulesets", {
      gameId: args.gameId,
      sections: args.sections,
    });
  },
});
