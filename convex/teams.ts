import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();
    const gamesById = Object.fromEntries(games.map((g) => [g._id, g]));

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await ctx.db
          .query("players")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        return {
          ...team,
          game: gamesById[team.gameId] ?? null,
          players: players.map((p) => ({
            ...p,
            game: gamesById[p.gameId] ?? null,
          })),
        };
      }),
    );

    return teamsWithPlayers;
  },
});
