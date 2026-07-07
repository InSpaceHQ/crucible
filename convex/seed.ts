import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { fetchActiveTeams } from "./teams";

const SEED_GAMES = [
  { name: "FC26", displayName: "FC26", description: "EA Sports FC 26" },
  { name: "MK1", displayName: "Mortal Kombat 1", description: "" },
];

const SEED_TEAMS = [
  {
    name: "Nova",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Nova&backgroundColor=ff6b6b",
    order: 0,
  },
  {
    name: "Vertex",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vertex&backgroundColor=4ecdc4",
    order: 1,
  },
  {
    name: "Pulse",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Pulse&backgroundColor=ffa502",
    order: 2,
  },
  {
    name: "Apex",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Apex&backgroundColor=7c5cfc",
    order: 3,
  },
  {
    name: "Blaze",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Blaze&backgroundColor=ff3333",
    order: 4,
  },
  {
    name: "Shadow",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Shadow&backgroundColor=1a1a2e",
    order: 5,
  },
  {
    name: "Eclipse",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Eclipse&backgroundColor=333333",
    order: 6,
  },
  {
    name: "Reaper",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Reaper&backgroundColor=8b0000",
    order: 7,
  },
  {
    name: "Frost",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Frost&backgroundColor=66d9ff",
    order: 8,
  },
  {
    name: "Phantom",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Phantom&backgroundColor=696969",
    order: 9,
  },
  {
    name: "Storm",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Storm&backgroundColor=4a90d9",
    order: 10,
  },
  {
    name: "Vanguard",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vanguard&backgroundColor=006400",
    order: 11,
  },
  {
    name: "Comet",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Comet&backgroundColor=ff66ff",
    order: 12,
  },
  {
    name: "Warden",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Warden&backgroundColor=00008b",
    order: 13,
  },
  {
    name: "Fury",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Fury&backgroundColor=ff6600",
    order: 14,
  },
  {
    name: "Raven",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Raven&backgroundColor=2f2f3f",
    order: 15,
  },
  {
    name: "Thunder",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Thunder&backgroundColor=ffd700",
    order: 16,
  },
  {
    name: "Hydra",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Hydra&backgroundColor=006666",
    order: 17,
  },
  {
    name: "Vapor",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vapor&backgroundColor=66ff99",
    order: 18,
  },
  {
    name: "Phoenix",
    gameIds: ["FC26", "MK1"],
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Phoenix&backgroundColor=ff4500",
    order: 19,
  },
  {
    name: "Unassigned",
    gameIds: [],
    logo: "",
    order: -1,
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
  { name: "Ethan Cole", game: "FC26", team: "Blaze" },
  { name: "Dante Cruz", game: "MK1", team: "Blaze" },
  { name: "Nia Osei", game: "MK1", team: "Shadow" },
  { name: "Kofi Mensah", game: "FC26", team: "Shadow" },
  { name: "Liam Frost", game: "FC26", team: "Eclipse" },
  { name: "Sora Tanaka", game: "MK1", team: "Eclipse" },
  { name: "Viktor Volkov", game: "MK1", team: "Reaper" },
  { name: "Ivy Chen", game: "FC26", team: "Reaper" },
  { name: "Noelle Winter", game: "FC26", team: "Frost" },
  { name: "Ryu Hayashi", game: "MK1", team: "Frost" },
  { name: "Wraith Locke", game: "MK1", team: "Phantom" },
  { name: "Jade Monroe", game: "FC26", team: "Phantom" },
  { name: "Cyrus Gale", game: "FC26", team: "Storm" },
  { name: "Luna Park", game: "MK1", team: "Storm" },
  { name: "Atlas Stone", game: "MK1", team: "Vanguard" },
  { name: "Vera Zima", game: "FC26", team: "Vanguard" },
  { name: "Riley Star", game: "FC26", team: "Comet" },
  { name: "Morgan Cross", game: "MK1", team: "Comet" },
  { name: "Solomon Ward", game: "MK1", team: "Warden" },
  { name: "Freya Sol", game: "FC26", team: "Warden" },
  { name: "Blade Ragnar", game: "FC26", team: "Fury" },
  { name: "Selene Moon", game: "MK1", team: "Fury" },
  { name: "Corvus Black", game: "MK1", team: "Raven" },
  { name: "Opal Grey", game: "FC26", team: "Raven" },
  { name: "Torin Stormrider", game: "FC26", team: "Thunder" },
  { name: "Kira Dawn", game: "MK1", team: "Thunder" },
  { name: "Tide Walker", game: "MK1", team: "Hydra" },
  { name: "Mira Deep", game: "FC26", team: "Hydra" },
  { name: "Casper Mist", game: "FC26", team: "Vapor" },
  { name: "Aria Haze", game: "MK1", team: "Vapor" },
  { name: "Blaze Ignis", game: "MK1", team: "Phoenix" },
  { name: "Ember Ash", game: "FC26", team: "Phoenix" },
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
    const existingGames = await ctx.db.query("games").collect();

    let gameIds: Record<string, Id<"games">>;
    if (existingGames.length < 2) {
      gameIds = {};
      for (const game of SEED_GAMES) {
        gameIds[game.name] = await ctx.db.insert("games", game);
      }
    } else {
      gameIds = Object.fromEntries(existingGames.map((g) => [g.name, g._id]));
    }

    const existingTeams = await fetchActiveTeams(ctx.db);
    if (existingTeams.length > 0) return { seeded: false };

    const teamNames = SEED_TEAMS.map((t) => t.name);
    const uniqueTeamNames = new Set(teamNames);
    if (teamNames.length !== uniqueTeamNames.size) {
      throw new Error(
        `Duplicate team names in SEED_TEAMS: ${teamNames.filter((n, i) => teamNames.indexOf(n) !== i).join(", ")}`,
      );
    }

    const teamIds: Record<string, Id<"teams">> = {};
    for (const team of SEED_TEAMS) {
      const teamId = await ctx.db.insert("teams", {
        name: team.name,
        logo: team.logo,
        order: team.order,
      });
      teamIds[team.name] = teamId;
      for (const gameId of team.gameIds) {
        await ctx.db.insert("teamGames", {
          teamId,
          gameId: gameIds[gameId] as Id<"games">,
        });
      }
    }

    const playerNames = SEED_PLAYERS.map((p) => p.name);
    const uniquePlayerNames = new Set(playerNames);
    if (playerNames.length !== uniquePlayerNames.size) {
      throw new Error(
        `Duplicate player names in SEED_PLAYERS: ${playerNames.filter((n, i) => playerNames.indexOf(n) !== i).join(", ")}`,
      );
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
