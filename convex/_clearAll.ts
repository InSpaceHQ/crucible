import { v } from "convex/values";
import { mutation } from "./_generated/server";

const TABLES = [
  "competitionMatches",
  "competitionStandings",
  "competitions",
  "fixtures",
  "games",
  "playerStats",
  "players",
  "pointsLog",
  "schedule",
  "skillHolders",
  "skills",
  "teamGames",
  "teams",
] as const;

export const clear = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;

    if (dryRun) {
      return { dryRun: true };
    }

    for (const table of TABLES) {
      while (true) {
        const docs = await (ctx.db.query(table) as any).take(100);
        for (const doc of docs) {
          await (ctx.db.delete as any)(table, doc._id);
        }
        if (docs.length < 100) break;
      }
    }
    return { cleared: true };
  },
});
