import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { z } from "zod";

const GameName = z.enum(["MK1", "FC26", "FIFA26"]);

const registerPlayerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  game: GameName,
});

const gameNameMap: Record<string, string> = { FIFA26: "FC26" };

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

export const registerPlayer = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    game: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = registerPlayerSchema.safeParse(args);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { firstName, lastName, game } = parsed.data;
    const dbGameName = gameNameMap[game] ?? game;

    const games = await ctx.db.query("games").collect();
    const found = games.find((g) => g.name === dbGameName);

    if (!found) {
      throw new ConvexError(`Game "${game}" not found`);
    }

    const unassigned = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("order"), -1))
      .first();
    if (!unassigned)
      throw new ConvexError("Unassigned team not found. Run seed first.");

    return await ctx.db.insert("players", {
      name: `${firstName} ${lastName}`,
      gameId: found._id,
      teamId: unassigned._id,
    });
  },
});
