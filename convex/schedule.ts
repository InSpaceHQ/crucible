import { query } from "./_generated/server";

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
