import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

const BASE = 1783173600000;

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("pointsLog").take(1);
    if (existing.length > 0) return { seeded: false };

    const allPlayers = await ctx.db.query("players").collect();
    const playerMap = new Map<string, Id<"players">>();
    for (const p of allPlayers) {
      playerMap.set(p.name, p._id);
    }

    const add = async (opts: {
      name: string;
      amount: number;
      reason: string;
      hourOffset: number;
    }) => {
      const id = playerMap.get(opts.name);
      if (!id) return;
      await ctx.db.insert("pointsLog", {
        playerId: id,
        amount: opts.amount,
        reason: opts.reason,
        timestamp: BASE + opts.hourOffset * 3_600_000,
      });
    };

    await add({
      name: "Aisha Khan",
      amount: 100,
      reason: "Match win vs Pulse",
      hourOffset: 0,
    });
    await add({
      name: "Kai Nakamura",
      amount: 80,
      reason: "Match win vs Nova",
      hourOffset: 1,
    });
    await add({
      name: "Yuki Tanaka",
      amount: 60,
      reason: "Match win vs Vertex",
      hourOffset: 2,
    });
    await add({
      name: "Zara Patel",
      amount: 40,
      reason: "Assist bonus",
      hourOffset: 3,
    });
    await add({
      name: "Idris Adebayo",
      amount: 50,
      reason: "Match win vs Apex",
      hourOffset: 4,
    });
    await add({
      name: "Marcus Chen",
      amount: 30,
      reason: "Assist bonus",
      hourOffset: 5,
    });
    await add({
      name: "Sofia Reyes",
      amount: 70,
      reason: "Match win vs Pulse",
      hourOffset: 6,
    });
    await add({
      name: "Leo Torres",
      amount: 20,
      reason: "Participation",
      hourOffset: 7,
    });
    await add({
      name: "Aisha Khan",
      amount: -10,
      reason: "Penalty: late arrival",
      hourOffset: 12,
    });
    await add({
      name: "Kai Nakamura",
      amount: 50,
      reason: "MVP bonus",
      hourOffset: 14,
    });
    await add({
      name: "Yuki Tanaka",
      amount: 30,
      reason: "Assist bonus",
      hourOffset: 16,
    });
    await add({
      name: "Zara Patel",
      amount: 90,
      reason: "Match win vs Nova",
      hourOffset: 20,
    });
    await add({
      name: "Idris Adebayo",
      amount: 20,
      reason: "Participation",
      hourOffset: 22,
    });
    await add({
      name: "Marcus Chen",
      amount: 60,
      reason: "Match win vs Vertex",
      hourOffset: 24,
    });
    await add({
      name: "Sofia Reyes",
      amount: 40,
      reason: "Assist bonus",
      hourOffset: 28,
    });
    await add({
      name: "Leo Torres",
      amount: 50,
      reason: "Match win vs Apex",
      hourOffset: 32,
    });
    await add({
      name: "Aisha Khan",
      amount: 50,
      reason: "MVP bonus",
      hourOffset: 36,
    });

    return { seeded: true };
  },
});
