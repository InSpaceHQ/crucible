import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    const playersById = Object.fromEntries(players.map((p) => [p._id, p]));

    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const games = await ctx.db.query("games").collect();
    const gamesById = Object.fromEntries(games.map((g) => [g._id, g]));

    const stats = await ctx.db
      .query("playerStats")
      .withIndex("by_kills")
      .order("desc")
      .collect();

    return stats.map((entry) => {
      const player = playersById[entry.playerId] ?? null;
      const team = player ? (teamsById[player.teamId] ?? null) : null;
      const game = player ? (gamesById[player.gameId] ?? null) : null;
      return {
        ...entry,
        player: player
          ? {
              name: player.name,
              game: game
                ? { name: game.name, displayName: game.displayName }
                : null,
              team: team ? { name: team.name, logo: team.logo } : null,
            }
          : null,
      };
    });
  },
});
