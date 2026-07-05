import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

function ts(month: string, day: number, hour: number, minute: number): number {
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const iso = `2026-${months[month]}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+01:00`;
  return new Date(iso).getTime();
}

const SEED_FIXTURES = [
  {
    p1: "Aisha Khan",
    p2: "Zara Patel",
    game: "FC26",
    day: 8,
    hour: 14,
    min: 0,
    s1: 3,
    s2: 1,
  },
  {
    p1: "Marcus Chen",
    p2: "Leo Torres",
    game: "FC26",
    day: 8,
    hour: 14,
    min: 20,
    s1: 2,
    s2: 0,
  },
  {
    p1: "Priya Singh",
    p2: "Sofia Reyes",
    game: "MK1",
    day: 8,
    hour: 14,
    min: 40,
    s1: 1,
    s2: 1,
  },
  {
    p1: "James Kim",
    p2: "Ravi Mehta",
    game: "MK1",
    day: 8,
    hour: 15,
    min: 0,
    s1: 2,
    s2: 1,
  },
  {
    p1: "Yuki Tanaka",
    p2: "Maya Okafor",
    game: "FC26",
    day: 9,
    hour: 15,
    min: 20,
    s1: 1,
    s2: 2,
  },
  {
    p1: "Elena Voss",
    p2: "Kai Nakamura",
    game: "FC26",
    day: 9,
    hour: 15,
    min: 40,
    s1: 0,
    s2: 0,
  },
  {
    p1: "Idris Adebayo",
    p2: "Nadia Petrova",
    game: "MK1",
    day: 9,
    hour: 16,
    min: 0,
    s1: 3,
    s2: 1,
  },
  {
    p1: "Lena Dupont",
    p2: "Tomás Silva",
    game: "MK1",
    day: 9,
    hour: 16,
    min: 20,
    s1: 1,
    s2: 2,
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("fixtures").take(1);
    if (existing.length > 0) return { seeded: false };

    const allPlayers = await ctx.db.query("players").collect();
    const playersByName = new Map<string, Id<"players">>();
    for (const p of allPlayers) {
      playersByName.set(p.name, p._id);
    }

    const allGames = await ctx.db.query("games").collect();
    const gamesByName = new Map<string, Id<"games">>();
    for (const g of allGames) {
      gamesByName.set(g.name, g._id);
    }

    for (const f of SEED_FIXTURES) {
      const startTime = ts("Jul", f.day, f.hour, f.min);
      const endTime = startTime + 20 * 60 * 1000;
      const player1Id = playersByName.get(f.p1);
      const player2Id = playersByName.get(f.p2);
      const gameId = gamesByName.get(f.game);
      if (!player1Id || !player2Id || !gameId) continue;

      await ctx.db.insert("fixtures", {
        gameId,
        startTime,
        endTime,
        entries: [
          { playerId: player1Id, score: f.s1 },
          { playerId: player2Id, score: f.s2 },
        ],
      });
    }

    return { seeded: true };
  },
});

export const clearFixtures = mutation({
  args: {},
  handler: async (ctx) => {
    while (true) {
      const fixtures = await ctx.db.query("fixtures").take(100);
      for (const f of fixtures) {
        await ctx.db.delete("fixtures", f._id);
      }
      if (fixtures.length < 100) break;
    }
    return { cleared: true };
  },
});
