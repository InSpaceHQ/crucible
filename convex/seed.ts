import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const SEED_GAMES = [
  { name: "FC26", displayName: "FC26", description: "EA Sports FC 26" },
  { name: "MK1", displayName: "Mortal Kombat 1", description: "" },
];

const SEED_TEAMS = [
  {
    name: "Nova",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Nova&backgroundColor=ff6b6b",
    order: 0,
  },
  {
    name: "Vertex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vertex&backgroundColor=4ecdc4",
    order: 1,
  },
  {
    name: "Pulse",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Pulse&backgroundColor=ffa502",
    order: 2,
  },
  {
    name: "Apex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Apex&backgroundColor=7c5cfc",
    order: 3,
  },
];

const SEED_PLAYERS = [
  { name: "Aisha Khan", game: "FC26", team: "Nova" },
  { name: "Marcus Chen", game: "FC26", team: "Nova" },
  { name: "Priya Singh", game: "MK1", team: "Nova" },
  { name: "James Kim", game: "MK1", team: "Nova" },
  { name: "Zara Patel", game: "MK1", team: "Vertex" },
  { name: "Leo Torres", game: "MK1", team: "Vertex" },
  { name: "Maya Okafor", game: "FC26", team: "Vertex" },
  { name: "Kai Nakamura", game: "FC26", team: "Vertex" },
  { name: "Yuki Tanaka", game: "FC26", team: "Pulse" },
  { name: "Elena Voss", game: "FC26", team: "Pulse" },
  { name: "Idris Adebayo", game: "MK1", team: "Pulse" },
  { name: "Lena Dupont", game: "MK1", team: "Pulse" },
  { name: "Sofia Reyes", game: "MK1", team: "Apex" },
  { name: "Ravi Mehta", game: "MK1", team: "Apex" },
  { name: "Nadia Petrova", game: "FC26", team: "Apex" },
  { name: "Tomás Silva", game: "FC26", team: "Apex" },
];

const SEED_SKILLS = [
  {
    name: "Best Goal",
    game: "FC26",
    description: "Soccer",
    points: 10,
    holders: ["Aisha Khan", "Marcus Chen", "Yuki Tanaka", "Nadia Petrova"],
  },
  {
    name: "Most Skilled Player",
    game: null,
    description: null,
    points: 25,
    holders: ["Zara Patel", "Kai Nakamura", "Idris Adebayo", "Ravi Mehta"],
  },
  {
    name: "Longest Combo",
    game: "MK1",
    description: null,
    points: 15,
    holders: ["Priya Singh", "Leo Torres", "Lena Dupont", "Sofia Reyes"],
  },
  {
    name: "Quickest Win",
    game: null,
    description: null,
    points: 20,
    holders: ["Elena Voss", "Maya Okafor", "James Kim", "Tomás Silva"],
  },
  {
    name: "Flawless Warlock",
    game: "MK1",
    description: null,
    points: 30,
    holders: ["James Kim", "Idris Adebayo", "Priya Singh", "Zara Patel"],
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("games").take(1);
    if (existing.length > 0) return { seeded: false };

    const gameIds: Record<string, Id<"games">> = {};
    for (const game of SEED_GAMES) {
      gameIds[game.name] = await ctx.db.insert("games", game);
    }

    const teamIds: Record<string, Id<"teams">> = {};
    for (const team of SEED_TEAMS) {
      teamIds[team.name] = await ctx.db.insert("teams", {
        name: team.name,
        gameId: gameIds[team.game] as Id<"games">,
        logo: team.logo,
        order: team.order,
      });
    }

    const playerIds: Record<string, Id<"players">> = {};
    for (const player of SEED_PLAYERS) {
      playerIds[player.name] = await ctx.db.insert("players", {
        name: player.name,
        gameId: gameIds[player.game] as Id<"games">,
        teamId: teamIds[player.team] as Id<"teams">,
      });
    }

    for (const skill of SEED_SKILLS) {
      const skillId = await ctx.db.insert("skills", {
        name: skill.name,
        gameId: skill.game ? (gameIds[skill.game] as Id<"games">) : undefined,
        description: skill.description ?? undefined,
        points: skill.points,
      });

      for (const holderName of skill.holders) {
        const playerId = playerIds[holderName];
        if (playerId) {
          await ctx.db.insert("skillHolders", {
            skillId,
            playerId: playerId as Id<"players">,
          });
        }
      }
    }

    return { seeded: true };
  },
});

export const clearSkills = mutation({
  args: {},
  handler: async (ctx) => {
    while (true) {
      const holders = await ctx.db.query("skillHolders").take(100);
      for (const h of holders) {
        await ctx.db.delete("skillHolders", h._id);
      }
      if (holders.length < 100) break;
    }

    while (true) {
      const skills = await ctx.db.query("skills").take(100);
      for (const s of skills) {
        await ctx.db.delete("skills", s._id);
      }
      if (skills.length < 100) break;
    }

    return { cleared: true };
  },
});

export const seedSkills = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSkills = await ctx.db.query("skills").take(1);
    if (existingSkills.length > 0) return { seeded: false };

    const games = await ctx.db.query("games").collect();
    const gameIds: Record<string, Id<"games">> = Object.fromEntries(
      games.map((g) => [g.name, g._id]),
    );

    const players = await ctx.db.query("players").collect();
    const playerIds: Record<string, Id<"players">> = Object.fromEntries(
      players.map((p) => [p.name, p._id]),
    );

    for (const skill of SEED_SKILLS) {
      const skillId = await ctx.db.insert("skills", {
        name: skill.name,
        gameId: skill.game ? (gameIds[skill.game] as Id<"games">) : undefined,
        description: skill.description ?? undefined,
        points: skill.points,
      });

      for (const holderName of skill.holders) {
        const playerId = playerIds[holderName];
        if (playerId) {
          await ctx.db.insert("skillHolders", {
            skillId,
            playerId: playerId as Id<"players">,
          });
        }
      }
    }

    return { seeded: true };
  },
});
