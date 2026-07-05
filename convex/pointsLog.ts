import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const list = query({
  args: {
    playerId: v.optional(v.id("players")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs: Doc<"pointsLog">[];

    if (args.playerId) {
      const playerId = args.playerId;
      logs = await ctx.db
        .query("pointsLog")
        .withIndex("by_player_timestamp", (q) => q.eq("playerId", playerId))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      logs = await ctx.db
        .query("pointsLog")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit ?? 50);
    }

    const players = await ctx.db.query("players").collect();
    const playersById = Object.fromEntries(players.map((p) => [p._id, p]));

    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    return logs.map((entry) => {
      const player = playersById[entry.playerId] ?? null;
      const team = player ? (teamsById[player.teamId] ?? null) : null;
      return {
        ...entry,
        player: player
          ? {
              name: player.name,
              team: team ? { name: team.name, logo: team.logo } : null,
            }
          : null,
      };
    });
  },
});

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("pointsLog")
      .withIndex("by_timestamp")
      .order("desc")
      .paginate(args.paginationOpts);

    const players = await ctx.db.query("players").collect();
    const playersById = Object.fromEntries(players.map((p) => [p._id, p]));

    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const page = result.page.map((entry) => {
      const player = playersById[entry.playerId] ?? null;
      const team = player ? (teamsById[player.teamId] ?? null) : null;
      return {
        ...entry,
        player: player
          ? {
              name: player.name,
              team: team ? { name: team.name, logo: team.logo } : null,
            }
          : null,
      };
    });

    return { ...result, page };
  },
});
