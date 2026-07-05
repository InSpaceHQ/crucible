import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();
    const gamesById = Object.fromEntries(games.map((g) => [g._id, g]));

    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const players = await ctx.db.query("players").collect();
    const playersById = Object.fromEntries(players.map((p) => [p._id, p]));

    const fixtures = await ctx.db
      .query("fixtures")
      .withIndex("by_start_time")
      .order("asc")
      .collect();

    return fixtures.map((fixture) => ({
      ...fixture,
      game: gamesById[fixture.gameId] ?? null,
      entries: fixture.entries.map((entry) => {
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
      }),
    }));
  },
});

export const updateScore = mutation({
  args: {
    fixtureId: v.id("fixtures"),
    entryIndex: v.number(),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const fixture = await ctx.db.get(args.fixtureId);
    if (!fixture) throw new Error("Fixture not found");

    const entries = fixture.entries.map((e, i) => {
      if (i !== args.entryIndex) return e;
      return { ...e, score: Math.max(0, e.score + args.delta) };
    });

    await ctx.db.patch(args.fixtureId, { entries });
  },
});
