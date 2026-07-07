import { query } from "./_generated/server";
import { fetchActiveTeams } from "./teams";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await fetchActiveTeams(ctx.db);
    const players = await ctx.db.query("players").collect();
    const playerTeam: Record<string, string> = {};
    for (const p of players) {
      if (p.teamId) playerTeam[p._id] = p.teamId;
    }

    const fixtures = await ctx.db
      .query("fixtures")
      .withIndex("by_start_time")
      .order("asc")
      .collect();

    const stats: Record<
      string,
      { w: number; d: number; l: number; gd: number }
    > = {};
    for (const t of teams) {
      stats[t._id] = { w: 0, d: 0, l: 0, gd: 0 };
    }

    for (const fixture of fixtures) {
      if (fixture.entries.length < 2) continue;

      const t1 = playerTeam[fixture.entries[0].playerId];
      const t2 = playerTeam[fixture.entries[1].playerId];
      if (!t1 || !t2 || t1 === t2) continue;

      const s1 = fixture.entries[0].score;
      const s2 = fixture.entries[1].score;

      if (s1 > s2) {
        stats[t1].w++;
        stats[t1].gd += s1 - s2;
        stats[t2].l++;
        stats[t2].gd += s2 - s1;
      } else if (s1 < s2) {
        stats[t1].l++;
        stats[t1].gd += s1 - s2;
        stats[t2].w++;
        stats[t2].gd += s2 - s1;
      } else {
        stats[t1].d++;
        stats[t2].d++;
      }
    }

    const standings = teams
      .map((t) => {
        const s = stats[t._id];
        return {
          team: { _id: t._id, name: t.name, logo: t.logo },
          wins: s.w,
          draws: s.d,
          losses: s.l,
          goalDifference: s.gd,
          points: s.w * 3 + s.d,
        };
      })
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.wins - a.wins,
      )
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return standings;
  },
});
