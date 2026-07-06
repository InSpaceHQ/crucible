import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    const teams = await ctx.db.query("teams").collect();
    const teamById = Object.fromEntries(teams.map((t) => [t._id, t.name]));

    return players.map((p) => ({
      _id: p._id,
      name: p.name,
      teamName: teamById[p.teamId] ?? "Unassigned",
    }));
  },
});
