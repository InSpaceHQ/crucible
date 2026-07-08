import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: authTables.users,

  profile: defineTable({
    id: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    occupation: v.union(v.id("occupations"), v.literal("None")),
    role: v.optional(v.string()),
  })
    .index("occupation", ["occupation"])
    .index("by_user_id", ["id"])
    .index("by_email", ["email"]),

  occupations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  games: defineTable({
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
  }),

  teams: defineTable({
    name: v.string(),
    logo: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  teamGames: defineTable({
    teamId: v.id("teams"),
    gameId: v.id("games"),
  })
    .index("by_team", ["teamId"])
    .index("by_game", ["gameId"]),

  players: defineTable({
    name: v.string(),
    gameId: v.id("games"),
    teamId: v.id("teams"),
  }).index("by_team", ["teamId"]),

  schedule: defineTable({
    timestamp: v.number(),
    activity: v.string(),
    description: v.string(),
    link: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
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
    competitionId: v.optional(v.id("competitions")),
    entries: v.array(
      v.object({
        playerId: v.id("players"),
        score: v.number(),
      }),
    ),
  })
    .index("by_start_time", ["startTime"])
    .index("by_competition", ["competitionId"]),

  playerStats: defineTable({
    playerId: v.id("players"),
    kills: v.number(),
    wins: v.number(),
    matches: v.number(),
  })
    .index("by_kills", ["kills"])
    .index("by_player", ["playerId"]),

  pointsLog: defineTable({
    playerId: v.id("players"),
    amount: v.number(),
    reason: v.string(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_player_timestamp", ["playerId", "timestamp"]),

  kv: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  competitions: defineTable({
    name: v.string(),
    gameId: v.id("games"),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed"),
    ),
    season: v.string(),
  }).index("by_game", ["gameId"]),

  competitionMatches: defineTable({
    competitionId: v.id("competitions"),
    phase: v.union(v.literal("group"), v.literal("knockout")),
    group: v.optional(v.string()),
    round: v.number(),
    matchIndex: v.number(),
    homeTeamId: v.id("teams"),
    awayTeamId: v.id("teams"),
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("completed"),
    ),
    startTime: v.optional(v.number()),
  })
    .index("by_competition", ["competitionId"])
    .index("by_competition_phase", ["competitionId", "phase", "round"]),

  competitionStandings: defineTable({
    competitionId: v.id("competitions"),
    group: v.string(),
    teamId: v.id("teams"),
    position: v.number(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDifference: v.number(),
    points: v.number(),
  })
    .index("by_competition", ["competitionId"])
    .index("by_competition_group", ["competitionId", "group"]),

  rulesets: defineTable({
    gameId: v.id("games"),
    sections: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
      }),
    ),
  }).index("by_game", ["gameId"]),
});
