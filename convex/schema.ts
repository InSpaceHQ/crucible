import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
  }),

  teams: defineTable({
    name: v.string(),
    gameId: v.id("games"),
    logo: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  players: defineTable({
    name: v.string(),
    gameId: v.id("games"),
    teamId: v.id("teams"),
  }).index("by_team", ["teamId"]),

  schedule: defineTable({
    timestamp: v.number(),
    activity: v.string(),
    description: v.string(),
  }).index("by_timestamp", ["timestamp"]),

  skills: defineTable({
    name: v.string(),
    gameId: v.optional(v.id("games")),
    description: v.optional(v.string()),
    points: v.optional(v.number()),
  }),

  skillHolders: defineTable({
    skillId: v.id("skills"),
    playerId: v.id("players"),
  }).index("by_skill", ["skillId"]),

  fixtures: defineTable({
    gameId: v.id("games"),
    startTime: v.number(),
    endTime: v.number(),
    entries: v.array(
      v.object({
        playerId: v.id("players"),
        score: v.number(),
      }),
    ),
  }).index("by_start_time", ["startTime"]),

  playerStats: defineTable({
    playerId: v.id("players"),
    kills: v.number(),
    wins: v.number(),
    matches: v.number(),
  }).index("by_kills", ["kills"]),

  pointsLog: defineTable({
    playerId: v.id("players"),
    amount: v.number(),
    reason: v.string(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_player_timestamp", ["playerId", "timestamp"]),
});
