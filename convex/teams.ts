import type { DatabaseReader } from "./_generated/server";
import { query } from "./_generated/server";

export async function fetchActiveTeams(db: DatabaseReader) {
  const teams = await db
    .query("teams")
    .withIndex("by_order")
    .order("asc")
    .collect();
  return teams.filter((t) => t.order >= 0);
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();
    const gamesById = Object.fromEntries(games.map((g) => [g._id, g]));

    const teamGames = await ctx.db.query("teamGames").collect();
    const teamGamesByTeam: Record<string, typeof games> = {};
    for (const tg of teamGames) {
      if (!teamGamesByTeam[tg.teamId]) teamGamesByTeam[tg.teamId] = [];
      const game = gamesById[tg.gameId];
      if (game) teamGamesByTeam[tg.teamId].push(game);
    }

    const teams = await fetchActiveTeams(ctx.db);

    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await ctx.db
          .query("players")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        return {
          ...team,
          games: teamGamesByTeam[team._id] ?? [],
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
