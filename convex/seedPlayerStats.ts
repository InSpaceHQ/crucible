import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

const SEED_STATS: Record<
  string,
  { kills: number; wins: number; matches: number }
> = {
  "Aisha Khan": { kills: 47, wins: 8, matches: 10 },
  "Kai Nakamura": { kills: 42, wins: 7, matches: 10 },
  "Yuki Tanaka": { kills: 38, wins: 6, matches: 10 },
  "Zara Patel": { kills: 36, wins: 6, matches: 10 },
  "Idris Adebayo": { kills: 33, wins: 5, matches: 10 },
  "Marcus Chen": { kills: 31, wins: 5, matches: 10 },
  "Sofia Reyes": { kills: 28, wins: 4, matches: 10 },
  "Leo Torres": { kills: 25, wins: 3, matches: 10 },
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("playerStats").take(1);
    if (existing.length > 0) return { seeded: false };

    const allPlayers = await ctx.db.query("players").collect();
    const playersByName = new Map<string, Id<"players">>();
    for (const p of allPlayers) {
      playersByName.set(p.name, p._id);
    }

    for (const [name, stats] of Object.entries(SEED_STATS)) {
      const playerId = playersByName.get(name);
      if (!playerId) continue;
      await ctx.db.insert("playerStats", {
        playerId,
        kills: stats.kills,
        wins: stats.wins,
        matches: stats.matches,
      });
    }

    return { seeded: true };
  },
});
