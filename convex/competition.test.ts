/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("seedCompetition creates a competition document", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });

  const _teamIds = await t.run(async (ctx) => {
    const ids: string[] = [];
    for (let i = 0; i < 20; i++) {
      const id = await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
      ids.push(id);
    }
    return ids;
  });

  const result = await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  expect(result).toHaveProperty("competitionId");
  expect(result).toHaveProperty("fixtureCount", 40);
  expect(result).toHaveProperty("standingsCount", 20);

  const competitions = await t.run(async (ctx) => {
    return await ctx.db.query("competitions").collect();
  });
  expect(competitions).toHaveLength(1);
  expect(competitions[0].gameId).toBe(gameId);
  expect(competitions[0].status).toBe("active");
});

test("seedCompetition creates 4 groups of 5 teams with round-robin fixtures", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });

  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  const standings = await t.run(async (ctx) => {
    return await ctx.db.query("competitionStandings").collect();
  });

  const groups = new Set(standings.map((s) => s.group));
  expect(groups).toEqual(new Set(["A", "B", "C", "D"]));

  for (const group of groups) {
    const inGroup = standings.filter((s) => s.group === group);
    expect(inGroup).toHaveLength(5);
  }

  const matches = await t.run(async (ctx) => {
    return await ctx.db.query("competitionMatches").collect();
  });

  const groupMatches = matches.filter((m) => m.phase === "group");
  const groupAMatches = groupMatches.filter((m) => m.group === "A");

  expect(groupMatches).toHaveLength(40);
  expect(groupAMatches).toHaveLength(10);

  const teamAIds = standings
    .filter((s) => s.group === "A")
    .map((s) => s.teamId);
  const teamAMatchesForTeam0 = groupAMatches.filter(
    (m) => m.homeTeamId === teamAIds[0] || m.awayTeamId === teamAIds[0],
  );
  expect(teamAMatchesForTeam0).toHaveLength(4);
});

test("updateMatchResult recalculates group standings", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  const matches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });

  const groupMatch = matches.find((m) => m.phase === "group")!;
  expect(groupMatch).toBeDefined();

  await t.mutation(api.competition.updateMatchResult, {
    matchId: groupMatch._id,
    homeScore: 3,
    awayScore: 1,
  });

  const updated = await t.run(async (ctx) => {
    return await ctx.db.get(groupMatch._id);
  });
  expect(updated?.homeScore).toBe(3);
  expect(updated?.awayScore).toBe(1);
  expect(updated?.status).toBe("completed");

  const standings = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });

  const homeStanding = standings.find(
    (s) => s.teamId === groupMatch.homeTeamId,
  );
  const awayStanding = standings.find(
    (s) => s.teamId === groupMatch.awayTeamId,
  );

  expect(homeStanding?.played).toBe(1);
  expect(homeStanding?.won).toBe(1);
  expect(homeStanding?.points).toBe(3);
  expect(homeStanding?.goalsFor).toBe(3);
  expect(homeStanding?.goalsAgainst).toBe(1);

  expect(awayStanding?.played).toBe(1);
  expect(awayStanding?.lost).toBe(1);
  expect(awayStanding?.points).toBe(0);
  expect(awayStanding?.goalsFor).toBe(1);
  expect(awayStanding?.goalsAgainst).toBe(3);

  expect(homeStanding?.goalDifference).toBe(2);
  expect(awayStanding?.goalDifference).toBe(-2);
});

test("advanceKnockout fills bracket after all group matches complete", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  const allMatches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });

  for (const m of allMatches.filter((m) => m.phase === "group")) {
    await t.mutation(api.competition.updateMatchResult, {
      matchId: m._id,
      homeScore: Math.floor(Math.random() * 5),
      awayScore: Math.floor(Math.random() * 5),
    });
  }

  await t.mutation(api.competition.advanceKnockout, {
    competitionId,
  });

  const bracket = await t.query(api.competition.listBracket, {
    competitionId,
  });

  expect(bracket).toHaveLength(3);
  expect(bracket[0].round).toBe(6);
  expect(bracket[0].matches).toHaveLength(4);
  expect(bracket[1].round).toBe(7);
  expect(bracket[1].matches).toHaveLength(2);
  expect(bracket[2].round).toBe(8);
  expect(bracket[2].matches).toHaveLength(1);

  const qfMatches = bracket[0].matches;
  const qfTeams = qfMatches.flatMap((m) => [m.homeTeam, m.awayTeam]);
  expect(qfTeams.every((t) => t !== null)).toBe(true);

  const qfTeamIds = qfMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
  const uniqueTeams = new Set(qfTeamIds);
  expect(uniqueTeams.size).toBe(8);
});

test("advanceKnockout assigns QF pairings that match advancing teams", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  const matches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });

  // Set deterministic results: home teams always win 1-0
  for (const m of matches.filter((m) => m.phase === "group")) {
    await t.mutation(api.competition.updateMatchResult, {
      matchId: m._id,
      homeScore: 1,
      awayScore: 0,
    });
  }

  await t.mutation(api.competition.advanceKnockout, { competitionId });

  const standings = await t.query(api.competition.listStandings, {
    competitionId,
  });

  const expectedQualifiers = standings.flatMap((g) =>
    g.entries.slice(0, 2).map((e) => e.teamId),
  );

  const bracket = await t.query(api.competition.listBracket, {
    competitionId,
  });
  const qfTeamIds = bracket[0].matches.flatMap((m) => [
    m.homeTeamId,
    m.awayTeamId,
  ]);

  for (const id of expectedQualifiers) {
    expect(qfTeamIds).toContain(id);
  }
  expect(qfTeamIds.length).toBe(expectedQualifiers.length);
});

test("advanceKnockout fills entire bracket through to Final", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.seedCompetition, {
    gameId,
    name: "Test Competition",
  });

  const allMatches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });

  const groupMatches = allMatches.filter((m) => m.phase === "group");
  for (const m of groupMatches) {
    await t.mutation(api.competition.updateMatchResult, {
      matchId: m._id,
      homeScore: 1,
      awayScore: 0,
    });
  }

  await t.mutation(api.competition.advanceKnockout, { competitionId });

  const qfMatches = allMatches.filter(
    (m) => m.phase === "knockout" && m.round === 6,
  );
  for (const m of qfMatches) {
    const updated = await t.run(async (ctx) => await ctx.db.get(m._id));
    expect(updated?.homeTeamId).not.toBe(updated?.awayTeamId);
  }

  for (const m of qfMatches) {
    await t.mutation(api.competition.updateMatchResult, {
      matchId: m._id,
      homeScore: 2,
      awayScore: 0,
    });
  }

  await t.mutation(api.competition.advanceKnockout, { competitionId });

  const sfMatches = allMatches.filter(
    (m) => m.phase === "knockout" && m.round === 7,
  );
  for (const m of sfMatches) {
    const updated = await t.run(async (ctx) => await ctx.db.get(m._id));
    expect(updated?.homeTeamId).not.toBe(updated?.awayTeamId);
  }

  for (const m of sfMatches) {
    await t.mutation(api.competition.updateMatchResult, {
      matchId: m._id,
      homeScore: 1,
      awayScore: 0,
    });
  }

  await t.mutation(api.competition.advanceKnockout, { competitionId });

  const finalMatch = allMatches.find(
    (m) => m.phase === "knockout" && m.round === 8,
  )!;
  const finalUpdated = await t.run(
    async (ctx) => await ctx.db.get(finalMatch._id),
  );
  expect(finalUpdated?.homeTeamId).toBeDefined();
  expect(finalUpdated?.awayTeamId).toBeDefined();
  expect(finalUpdated?.homeTeamId).not.toBe(finalUpdated?.awayTeamId);
});

test("simulateCompetition produces deterministic results with a champion", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const result = await t.mutation(api.competition.simulateCompetition, {
    gameId,
    name: "Test Competition",
  });

  expect(result.totalMatches).toBe(47);
  expect(result.groupResults).toHaveLength(40);
  expect(result.groupSummaries).toHaveLength(4);
  expect(result.champion).toBeTruthy();

  for (const summary of result.groupSummaries) {
    expect(summary.winnerName).toBeTruthy();
    expect(summary.runnerUpName).toBeTruthy();
  }

  // Verify all matches are completed
  const allMatches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", result.competitionId),
      )
      .collect();
  });
  expect(allMatches.every((m) => m.status === "completed")).toBe(true);

  // Verify standings computed
  const standings = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", result.competitionId),
      )
      .collect();
  });
  expect(standings.every((s) => s.played === 4)).toBe(true);

  // Deterministic: second run gives same champion
  const t2 = convexTest(schema, modules);
  const gameId2 = await t2.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t2.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });
  const result2 = await t2.mutation(api.competition.simulateCompetition, {
    gameId: gameId2,
    name: "Test Competition",
  });

  expect(result2.champion).toBe(result.champion);
  for (let i = 0; i < result.groupSummaries.length; i++) {
    expect(result2.groupSummaries[i].winnerName).toBe(
      result.groupSummaries[i].winnerName,
    );
    expect(result2.groupSummaries[i].runnerUpName).toBe(
      result.groupSummaries[i].runnerUpName,
    );
  }
});

test("startSimulation creates competition with round_1 phase", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.startSimulation, {
    gameId,
    name: "Test Competition",
  });

  const kvEntry = await t.run(async (ctx) => {
    return await ctx.db
      .query("kv")
      .withIndex("by_key", (q: any) =>
        q.eq("key", `sim_state:${competitionId}`),
      )
      .first();
  });
  expect(kvEntry?.value.phase).toBe("round_1");
  const competition = await t.run(async (ctx) => {
    return await ctx.db.get(competitionId);
  });
  expect(competition?.status).toBe("active");
});

test("advancePhase walks through all phases to completion", async () => {
  const t = convexTest(schema, modules);

  const gameId = await t.run(async (ctx) => {
    return await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
  });
  await t.run(async (ctx) => {
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("teams", {
        name: `Team ${i + 1}`,
        logo: `/logos/team${i + 1}.png`,
        order: i,
      });
    }
  });

  const { competitionId } = await t.mutation(api.competition.startSimulation, {
    gameId,
    name: "Test Competition",
  });

  const expectedPhases = [
    "round_1",
    "round_2",
    "round_3",
    "round_4",
    "round_5",
    "knockout_qf",
    "knockout_sf",
    "knockout_final",
  ];

  for (const phase of expectedPhases) {
    const kvEntry = await t.run(async (ctx) => {
      return await ctx.db
        .query("kv")
        .withIndex("by_key", (q: any) =>
          q.eq("key", `sim_state:${competitionId}`),
        )
        .first();
    });
    expect(kvEntry?.value.phase).toBe(phase);
    await t.mutation(api.competition.advancePhase, { competitionId });
  }

  const finalKv = await t.run(async (ctx) => {
    return await ctx.db
      .query("kv")
      .withIndex("by_key", (q: any) =>
        q.eq("key", `sim_state:${competitionId}`),
      )
      .first();
  });
  expect(finalKv?.value.phase).toBe("completed");
  const final = await t.run(async (ctx) => await ctx.db.get(competitionId));
  expect(final?.status).toBe("completed");

  const allMatches = await t.run(async (ctx) => {
    return await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();
  });
  expect(allMatches.every((m) => m.status === "completed")).toBe(true);
});
