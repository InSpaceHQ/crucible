import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
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
});
