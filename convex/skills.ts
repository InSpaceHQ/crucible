import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();
    const gamesById = Object.fromEntries(games.map((g) => [g._id, g]));

    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const players = await ctx.db.query("players").collect();
    const playersById = Object.fromEntries(
      players.map((p) => [
        p._id,
        {
          ...p,
          game: gamesById[p.gameId] ?? null,
          team: teamsById[p.teamId] ?? null,
        },
      ]),
    );

    const skills = await ctx.db.query("skills").collect();

    const skillsWithHolders = await Promise.all(
      skills.map(async (skill) => {
        const holders = await ctx.db
          .query("skillHolders")
          .withIndex("by_skill", (q) => q.eq("skillId", skill._id))
          .collect();

        return {
          ...skill,
          points: skill.points ?? 0,
          game: skill.gameId ? (gamesById[skill.gameId] ?? null) : null,
          holders: holders
            .map((h) => playersById[h.playerId])
            .filter((p): p is NonNullable<typeof p> => p != null),
        };
      }),
    );

    return skillsWithHolders;
  },
});
