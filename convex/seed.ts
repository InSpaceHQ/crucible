import { mutation } from "./_generated/server";

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

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("games").take(1);
    if (existing.length > 0) return { seeded: false };

    const gameIds: Record<string, string> = {};
    for (const game of SEED_GAMES) {
      gameIds[game.name] = await ctx.db.insert("games", game);
    }

    const teamIds: Record<string, string> = {};
    for (const team of SEED_TEAMS) {
      teamIds[team.name] = await ctx.db.insert("teams", {
        name: team.name,
        gameId: gameIds[team.game] as any,
        logo: team.logo,
        order: team.order,
      });
    }

    for (const player of SEED_PLAYERS) {
      await ctx.db.insert("players", {
        name: player.name,
        gameId: gameIds[player.game] as any,
        teamId: teamIds[player.team] as any,
      });
    }

    return { seeded: true };
  },
});
