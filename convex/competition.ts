import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

const GROUP_NAMES = ["A", "B", "C", "D"];

function snakeDraft(teams: string[], numGroups: number): string[][] {
  const groups: string[][] = Array.from({ length: numGroups }, () => []);
  for (let i = 0; i < teams.length; i++) {
    const groupIdx =
      Math.floor(i / numGroups) % 2 === 0
        ? i % numGroups
        : numGroups - 1 - (i % numGroups);
    groups[groupIdx].push(teams[i]);
  }
  return groups;
}

function generateGroupFixtures(
  teamsInGroup: string[],
  groupName: string,
  competitionId: Id<"competitions">,
  roundOffset: number,
) {
  const fixtures: Array<{
    competitionId: Id<"competitions">;
    phase: "group";
    group: string;
    round: number;
    matchIndex: number;
    homeTeamId: Id<"teams">;
    awayTeamId: Id<"teams">;
    status: "scheduled";
  }> = [];

  const n = teamsInGroup.length;
  const isOdd = n % 2 !== 0;
  const totalRounds = isOdd ? n : n - 1;
  const teams = [...teamsInGroup];
  if (isOdd) teams.push("BYE" as Id<"teams">);

  const half = teams.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    let matchIndex = 0;
    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];
      if (home === "BYE" || away === "BYE") continue;

      const homeIsHigherSeed = i === 0;
      fixtures.push({
        competitionId,
        phase: "group",
        group: groupName,
        round: roundOffset + round,
        matchIndex,
        homeTeamId: homeIsHigherSeed
          ? (home as Id<"teams">)
          : (away as Id<"teams">),
        awayTeamId: homeIsHigherSeed
          ? (away as Id<"teams">)
          : (home as Id<"teams">),
        status: "scheduled",
      });
      matchIndex++;
    }

    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  return fixtures;
}

async function seedCompetitionInternal(
  ctx: any,
  gameId: Id<"games">,
  name: string,
): Promise<{
  competitionId: Id<"competitions">;
  teamOrders: Record<string, number>;
}> {
  const allTeams = await ctx.db
    .query("teams")
    .withIndex("by_order")
    .order("asc")
    .collect();

  if (allTeams.length < 20) {
    throw new Error(`Need at least 20 teams, got ${allTeams.length}.`);
  }

  const teamsForComp = allTeams.slice(0, 20);
  const teamIds = teamsForComp.map((t: any) => t._id);
  const teamOrders = Object.fromEntries(
    teamsForComp.map((t: any) => [t._id, t.order]),
  );

  const competitionId = await ctx.db.insert("competitions", {
    name,
    gameId,
    status: "active",
    season: "2026",
  });

  const groups = snakeDraft(
    teamIds.map((id: string) => id),
    4,
  );

  for (let gi = 0; gi < groups.length; gi++) {
    const groupFixtures = generateGroupFixtures(
      groups[gi],
      GROUP_NAMES[gi],
      competitionId,
      1,
    );
    for (const f of groupFixtures) {
      await ctx.db.insert("competitionMatches", f);
    }
  }

  for (let gi = 0; gi < groups.length; gi++) {
    for (const rawId of groups[gi]) {
      const teamId = rawId as Id<"teams">;
      await ctx.db.insert("competitionStandings", {
        competitionId,
        group: GROUP_NAMES[gi],
        teamId,
        position: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }
  }

  const existingTbd = allTeams.find((t: any) => t.name === "TBD");
  const tbdTeamId =
    existingTbd?._id ??
    (await ctx.db.insert("teams", {
      name: "TBD",
      logo: "/logos/tbd.png",
      order: 999,
    }));

  const bracketRounds = [
    { round: 6, matches: 4 },
    { round: 7, matches: 2 },
    { round: 8, matches: 1 },
  ];

  for (const { round, matches } of bracketRounds) {
    for (let mi = 0; mi < matches; mi++) {
      await ctx.db.insert("competitionMatches", {
        competitionId,
        phase: "knockout",
        round,
        matchIndex: mi,
        homeTeamId: tbdTeamId,
        awayTeamId: tbdTeamId,
        status: "scheduled",
      });
    }
  }

  return { competitionId, teamOrders };
}

export const seedCompetition = mutation({
  args: { gameId: v.id("games"), name: v.string() },
  handler: async (ctx, args) => {
    const { competitionId } = await seedCompetitionInternal(
      ctx,
      args.gameId,
      args.name,
    );
    return { competitionId, fixtureCount: 40, standingsCount: 20 };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
  },
});

export const get = query({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.competitionId);
  },
});

export const listStandings = query({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const entries = await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();

    const grouped: Record<string, typeof entries> = {};
    for (const e of entries) {
      if (!grouped[e.group]) grouped[e.group] = [];
      grouped[e.group].push(e);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, groupEntries]) => ({
        group,
        entries: groupEntries
          .sort(
            (a, b) =>
              b.points - a.points ||
              b.goalDifference - a.goalDifference ||
              b.goalsFor - a.goalsFor,
          )
          .map((e, i) => {
            const team = teamsById[e.teamId] ?? null;
            return { ...e, position: i + 1, team };
          }),
      }));
  },
});

export const listMatches = query({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const matches = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();

    return matches.map((m) => ({
      ...m,
      homeTeam: teamsById[m.homeTeamId] ?? null,
      awayTeam: teamsById[m.awayTeamId] ?? null,
    }));
  },
});

export const listBracket = query({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const teams = await ctx.db.query("teams").collect();
    const teamsById = Object.fromEntries(teams.map((t) => [t._id, t]));

    const matches = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition_phase", (q) =>
        q.eq("competitionId", args.competitionId).eq("phase", "knockout"),
      )
      .collect();

    const grouped: Record<number, typeof matches> = {};
    for (const m of matches) {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([round, roundMatches]) => ({
        round: Number(round),
        matches: roundMatches
          .sort((a, b) => a.matchIndex - b.matchIndex)
          .map((m) => ({
            ...m,
            homeTeam: teamsById[m.homeTeamId] ?? null,
            awayTeam: teamsById[m.awayTeamId] ?? null,
          })),
      }));
  },
});

async function recalculateGroupStandings(
  ctx: any,
  competitionId: Id<"competitions">,
  group: string,
) {
  const matches = await ctx.db
    .query("competitionMatches")
    .withIndex("by_competition_phase", (q: any) =>
      q.eq("competitionId", competitionId).eq("phase", "group"),
    )
    .collect();

  const completed = matches.filter(
    (m: any) => m.group === group && m.status === "completed",
  );

  const standings = await ctx.db
    .query("competitionStandings")
    .withIndex("by_competition_group", (q: any) =>
      q.eq("competitionId", competitionId).eq("group", group),
    )
    .collect();

  const computed = standings.map((s: any) => {
    const teamMatches = completed.filter(
      (m: any) => m.homeTeamId === s.teamId || m.awayTeamId === s.teamId,
    );

    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const m of teamMatches) {
      played++;
      const isHome = m.homeTeamId === s.teamId;
      const gf = isHome ? m.homeScore : m.awayScore;
      const ga = isHome ? m.awayScore : m.homeScore;
      goalsFor += gf;
      goalsAgainst += ga;
      if (gf > ga) won++;
      else if (gf < ga) lost++;
      else drawn++;
    }

    return {
      ...s,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: won * 3 + drawn,
    };
  });

  computed.sort(
    (a: any, b: any) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor,
  );

  for (let i = 0; i < computed.length; i++) {
    await ctx.db.patch(computed[i]._id, {
      position: i + 1,
      played: computed[i].played,
      won: computed[i].won,
      drawn: computed[i].drawn,
      lost: computed[i].lost,
      goalsFor: computed[i].goalsFor,
      goalsAgainst: computed[i].goalsAgainst,
      goalDifference: computed[i].goalDifference,
      points: computed[i].points,
    });
  }
}

export const updateMatchResult = mutation({
  args: {
    matchId: v.id("competitionMatches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    await applyMatchResult(ctx, args.matchId, args.homeScore, args.awayScore);
  },
});

// Seeded PRNG (Mulberry32) — deterministic
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulateMatch(homeOrder: number, awayOrder: number, seed: number) {
  const rng = mulberry32(seed);
  const homeStrength = Math.max(1, 100 - homeOrder * 5);
  const awayStrength = Math.max(1, 100 - awayOrder * 5);
  const homeBase = homeStrength / 22;
  const awayBase = awayStrength / 22;
  const homeScore = Math.max(0, Math.floor(homeBase * (0.8 + rng() * 0.4)));
  const awayScore = Math.max(0, Math.floor(awayBase * (0.8 + rng() * 0.4)));
  return { homeScore, awayScore };
}

export const simulateMatchAction = action({
  args: {
    homeOrder: v.number(),
    awayOrder: v.number(),
    seed: v.number(),
  },
  handler: async (_, args) => {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    return simulateMatch(args.homeOrder, args.awayOrder, args.seed);
  },
});

async function applyMatchResult(
  ctx: any,
  matchId: any,
  homeScore: number,
  awayScore: number,
) {
  const match = await ctx.db.get(matchId);
  if (!match) throw new Error("Match not found");
  await ctx.db.patch(matchId, { homeScore, awayScore, status: "completed" });

  const competition = await ctx.db.get(match.competitionId);
  if (competition) {
    const players = await ctx.db.query("players").collect();
    const homePlayer = players.find(
      (p: any) =>
        p.teamId === match.homeTeamId && p.gameId === competition.gameId,
    );
    const awayPlayer = players.find(
      (p: any) =>
        p.teamId === match.awayTeamId && p.gameId === competition.gameId,
    );
    if (homePlayer && awayPlayer) {
      await ctx.db.insert("fixtures", {
        gameId: competition.gameId,
        startTime: Date.now(),
        endTime: Date.now(),
        competitionId: match.competitionId,
        entries: [
          { playerId: homePlayer._id, score: homeScore },
          { playerId: awayPlayer._id, score: awayScore },
        ],
      });
    }
  }

  if (match.phase === "group" && match.group) {
    await recalculateGroupStandings(ctx, match.competitionId, match.group);
  }
}

function getWinner(match: any): Id<"teams"> | null {
  if (match.status !== "completed") return null;
  if (match.homeScore == null || match.awayScore == null) return null;
  if (match.homeScore > match.awayScore) return match.homeTeamId;
  if (match.awayScore > match.homeScore) return match.awayTeamId;
  return null;
}

function getWinnerWithTiebreak(
  match: any,
  teamOrders: Record<string, number>,
): Id<"teams"> | null {
  const winner = getWinner(match);
  if (winner) return winner;
  if (!match.homeTeamId || !match.awayTeamId) return null;
  const homeOrder = teamOrders[match.homeTeamId] ?? 999;
  const awayOrder = teamOrders[match.awayTeamId] ?? 999;
  return homeOrder <= awayOrder ? match.homeTeamId : match.awayTeamId;
}

async function advanceBracket(
  ctx: any,
  competitionId: Id<"competitions">,
  winnerFn?: (match: any) => Id<"teams"> | null,
) {
  const standings = await ctx.db
    .query("competitionStandings")
    .withIndex("by_competition", (q: any) =>
      q.eq("competitionId", competitionId),
    )
    .collect();

  const groups = ["A", "B", "C", "D"] as const;
  const qualifiers: Array<{
    teamId: Id<"teams">;
    group: string;
    position: number;
  }> = [];

  for (const group of groups) {
    const groupStandings = standings
      .filter((s: any) => s.group === group)
      .sort(
        (a: any, b: any) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor,
      );

    if (groupStandings.length < 2) {
      throw new Error(`Group ${group} does not have enough teams`);
    }

    const allPlayed = groupStandings.every((s: any) => s.played === 4);
    if (!allPlayed) {
      throw new Error(
        `Group ${group} stage not complete (all teams must play 4 matches)`,
      );
    }

    qualifiers.push(
      { teamId: groupStandings[0].teamId, group, position: 1 },
      { teamId: groupStandings[1].teamId, group, position: 2 },
    );
  }

  const bracketMatches = await ctx.db
    .query("competitionMatches")
    .withIndex("by_competition_phase", (q: any) =>
      q.eq("competitionId", competitionId).eq("phase", "knockout"),
    )
    .collect();

  if (bracketMatches.length < 7) {
    throw new Error(
      "Bracket matches not initialized. Run seedCompetition first.",
    );
  }

  const sorted = [...bracketMatches].sort(
    (a: any, b: any) => a.round - b.round || a.matchIndex - b.matchIndex,
  );

  const qf = sorted.filter((m: any) => m.round === 6);
  const sf = sorted.filter((m: any) => m.round === 7);
  const final = sorted.filter((m: any) => m.round === 8);

  const groupWinners = qualifiers
    .filter((q) => q.position === 1)
    .sort((a, b) => a.group.localeCompare(b.group));
  const groupRunnersUp = qualifiers
    .filter((q) => q.position === 2)
    .sort((a, b) => a.group.localeCompare(b.group));

  const qfPairs: Array<[Id<"teams">, Id<"teams">]> = [
    [groupWinners[0].teamId, groupRunnersUp[1].teamId],
    [groupWinners[2].teamId, groupRunnersUp[3].teamId],
    [groupWinners[1].teamId, groupRunnersUp[0].teamId],
    [groupWinners[3].teamId, groupRunnersUp[2].teamId],
  ];

  for (let i = 0; i < qf.length; i++) {
    await ctx.db.patch(qf[i]._id, {
      homeTeamId: qfPairs[i][0],
      awayTeamId: qfPairs[i][1],
    });
  }

  const win = winnerFn ?? getWinner;
  const qfAllComplete = qf.every((m: any) => m.status === "completed");
  if (qfAllComplete) {
    const sfWinners = [win(qf[0])!, win(qf[2])!, win(qf[1])!, win(qf[3])!];

    for (let i = 0; i < sf.length; i++) {
      await ctx.db.patch(sf[i]._id, {
        homeTeamId: sfWinners[i * 2],
        awayTeamId: sfWinners[i * 2 + 1],
      });
    }

    const sfAllComplete = sf.every((m: any) => m.status === "completed");
    if (sfAllComplete) {
      const finalWinners = [win(sf[0])!, win(sf[1])!];
      await ctx.db.patch(final[0]._id, {
        homeTeamId: finalWinners[0],
        awayTeamId: finalWinners[1],
      });
    }
  }
}

export const advanceKnockout = mutation({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    await advanceBracket(ctx, args.competitionId);
  },
});

export const simulateCompetition = mutation({
  args: { gameId: v.id("games"), name: v.string() },
  handler: async (ctx, args) => {
    const { competitionId, teamOrders } = await seedCompetitionInternal(
      ctx,
      args.gameId,
      args.name,
    );

    const teams = await ctx.db.query("teams").collect();

    const matches = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();

    const groupMatches = matches
      .filter((m: any) => m.phase === "group")
      .sort(
        (a: any, b: any) => a.round - b.round || a.matchIndex - b.matchIndex,
      );

    const groupResults: Array<{
      round: number;
      matchIndex: number;
      homeTeamId: Id<"teams">;
      awayTeamId: Id<"teams">;
      homeScore: number;
      awayScore: number;
    }> = [];

    for (const match of groupMatches) {
      const seed = match.round * 1000 + match.matchIndex;
      const { homeScore, awayScore } = simulateMatch(
        teamOrders[match.homeTeamId],
        teamOrders[match.awayTeamId],
        seed,
      );
      await applyMatchResult(ctx, match._id, homeScore, awayScore);
      groupResults.push({
        round: match.round,
        matchIndex: match.matchIndex,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore,
        awayScore,
      });
    }

    await advanceBracket(ctx, competitionId, (m: any) =>
      getWinnerWithTiebreak(m, teamOrders),
    );

    const bracketMatches = matches
      .filter((m: any) => m.phase === "knockout")
      .sort(
        (a: any, b: any) => a.round - b.round || a.matchIndex - b.matchIndex,
      );

    const qfMatches = bracketMatches.filter((m: any) => m.round === 6);
    for (const m of qfMatches) {
      const fresh = await ctx.db.get(m._id);
      if (!fresh) continue;
      const seed = fresh.round * 1000 + fresh.matchIndex;
      const { homeScore, awayScore } = simulateMatch(
        teamOrders[fresh.homeTeamId],
        teamOrders[fresh.awayTeamId],
        seed,
      );
      await applyMatchResult(ctx, fresh._id, homeScore, awayScore);
    }

    const wfn = (m: any) => getWinnerWithTiebreak(m, teamOrders);
    await advanceBracket(ctx, competitionId, wfn);

    const afterQf = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition_phase", (q) =>
        q.eq("competitionId", competitionId).eq("phase", "knockout"),
      )
      .collect();
    const sf = afterQf.filter((m: any) => m.round === 7);

    for (const m of sf) {
      const seed = m.round * 1000 + m.matchIndex;
      const { homeScore, awayScore } = simulateMatch(
        teamOrders[m.homeTeamId],
        teamOrders[m.awayTeamId],
        seed,
      );
      await applyMatchResult(ctx, m._id, homeScore, awayScore);
    }

    await advanceBracket(ctx, competitionId, wfn);

    const afterSf = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition_phase", (q) =>
        q.eq("competitionId", competitionId).eq("phase", "knockout"),
      )
      .collect();
    const finalMatch = afterSf.find((m: any) => m.round === 8);

    if (finalMatch) {
      const seed = finalMatch.round * 1000 + finalMatch.matchIndex;
      const { homeScore, awayScore } = simulateMatch(
        teamOrders[finalMatch.homeTeamId],
        teamOrders[finalMatch.awayTeamId],
        seed,
      );
      await applyMatchResult(ctx, finalMatch._id, homeScore, awayScore);
    }

    const finalStandings = await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
      .collect();

    const groupSummaries: Array<{
      group: string;
      winnerName: string;
      runnerUpName: string;
    }> = [];

    const simGroups = ["A", "B", "C", "D"] as const;
    for (const group of simGroups) {
      const top2 = finalStandings
        .filter((s: any) => s.group === group)
        .sort(
          (a: any, b: any) =>
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor,
        )
        .slice(0, 2);
      const winner = teams.find((t: any) => t._id === top2[0]?.teamId);
      const runnerUp = teams.find((t: any) => t._id === top2[1]?.teamId);
      groupSummaries.push({
        group,
        winnerName: winner?.name ?? "—",
        runnerUpName: runnerUp?.name ?? "—",
      });
    }

    const finalChampion = finalMatch
      ? getWinnerWithTiebreak(finalMatch, teamOrders)
      : null;
    const championTeam = finalChampion
      ? teams.find((t: any) => t._id === finalChampion)
      : null;

    return {
      competitionId,
      groupResults,
      groupSummaries,
      champion: championTeam?.name ?? null,
      totalMatches: matches.length,
    };
  },
});

async function kvSet(ctx: any, key: string, value: any) {
  const existing = await ctx.db
    .query("kv")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
  if (existing) {
    await ctx.db.patch(existing._id, { value });
  } else {
    await ctx.db.insert("kv", { key, value });
  }
}

async function kvGet(ctx: any, key: string) {
  const doc = await ctx.db
    .query("kv")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
  return doc?.value ?? null;
}

async function kvRemove(ctx: any, key: string) {
  const existing = await ctx.db
    .query("kv")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
  if (existing) {
    await ctx.db.delete(existing._id);
  }
}

export const startSimulation = mutation({
  args: { gameId: v.id("games"), name: v.string() },
  handler: async (ctx, args) => {
    const { competitionId } = await seedCompetitionInternal(
      ctx,
      args.gameId,
      args.name,
    );
    await kvSet(ctx, "sim_state:" + competitionId, {
      phase: "round_1",
      startedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(10_000, api.competition.advancePhase, {
      competitionId,
    });
    return { competitionId };
  },
});

export const advancePhase = mutation({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const state = await kvGet(ctx, "sim_state:" + args.competitionId);
    const phase = state?.phase ?? "round_1";

    if (
      phase === "completed" ||
      phase === "error" ||
      phase === "cancelled" ||
      phase === undefined
    ) {
      return;
    }

    const teams = await ctx.db.query("teams").collect();
    const teamOrders = Object.fromEntries(
      teams.map((t: any) => [t._id, t.order]),
    );
    const matches = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q: any) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();

    const getWinnerTb = (m: any) => getWinnerWithTiebreak(m, teamOrders);

    if (phase.startsWith("round_")) {
      const roundNum = Number(phase.split("_")[1]);
      const roundMatches = matches.filter(
        (m: any) => m.phase === "group" && m.round === roundNum,
      );
      for (const m of roundMatches) {
        const seed = m.round * 1000 + m.matchIndex;
        const { homeScore, awayScore } = simulateMatch(
          teamOrders[m.homeTeamId],
          teamOrders[m.awayTeamId],
          seed,
        );
        await applyMatchResult(ctx, m._id, homeScore, awayScore);
      }
      const nextPhase:
        | "round_2"
        | "round_3"
        | "round_4"
        | "round_5"
        | "knockout_qf" =
        roundNum < 5
          ? (`round_${roundNum + 1}` as
              | "round_2"
              | "round_3"
              | "round_4"
              | "round_5")
          : "knockout_qf";
      await kvSet(ctx, "sim_state:" + args.competitionId, {
        phase: nextPhase,
        startedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(10_000, api.competition.advancePhase, {
        competitionId: args.competitionId,
      });
      return;
    }

    if (phase === "knockout_qf") {
      await advanceBracket(ctx, args.competitionId, getWinnerTb);
      const qfMatches = matches.filter(
        (m: any) => m.phase === "knockout" && m.round === 6,
      );
      for (const m of qfMatches) {
        const fresh = await ctx.db.get(m._id);
        if (!fresh || fresh.status === "completed") continue;
        const seed = fresh.round * 1000 + fresh.matchIndex;
        const { homeScore, awayScore } = simulateMatch(
          teamOrders[fresh.homeTeamId],
          teamOrders[fresh.awayTeamId],
          seed,
        );
        await applyMatchResult(ctx, fresh._id, homeScore, awayScore);
      }
      await kvSet(ctx, "sim_state:" + args.competitionId, {
        phase: "knockout_sf",
        startedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(10_000, api.competition.advancePhase, {
        competitionId: args.competitionId,
      });
      return;
    }

    if (phase === "knockout_sf") {
      await advanceBracket(ctx, args.competitionId, getWinnerTb);
      const sfMatches = matches.filter(
        (m: any) => m.phase === "knockout" && m.round === 7,
      );
      for (const m of sfMatches) {
        const fresh = await ctx.db.get(m._id);
        if (!fresh || fresh.status === "completed") continue;
        const seed = fresh.round * 1000 + fresh.matchIndex;
        const { homeScore, awayScore } = simulateMatch(
          teamOrders[fresh.homeTeamId],
          teamOrders[fresh.awayTeamId],
          seed,
        );
        await applyMatchResult(ctx, fresh._id, homeScore, awayScore);
      }
      await kvSet(ctx, "sim_state:" + args.competitionId, {
        phase: "knockout_final",
        startedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(10_000, api.competition.advancePhase, {
        competitionId: args.competitionId,
      });
      return;
    }

    if (phase === "knockout_final") {
      await advanceBracket(ctx, args.competitionId, getWinnerTb);
      const finalMatch = matches.find(
        (m: any) => m.phase === "knockout" && m.round === 8,
      );
      if (finalMatch) {
        const fresh = await ctx.db.get(finalMatch._id);
        if (fresh && fresh.status !== "completed") {
          const seed = fresh.round * 1000 + fresh.matchIndex;
          const { homeScore, awayScore } = simulateMatch(
            teamOrders[fresh.homeTeamId],
            teamOrders[fresh.awayTeamId],
            seed,
          );
          await applyMatchResult(ctx, fresh._id, homeScore, awayScore);
        }
      }
      await kvSet(ctx, "sim_state:" + args.competitionId, {
        phase: "completed",
        startedAt: Date.now(),
      });
      await ctx.db.patch(args.competitionId, { status: "completed" });
      return;
    }
  },
});

export const clearCompetition = mutation({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("competitionMatches")
      .withIndex("by_competition", (q: any) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();
    for (const m of matches) {
      await ctx.db.delete(m._id);
    }

    const standings = await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q: any) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();
    for (const s of standings) {
      await ctx.db.delete(s._id);
    }

    const fixtures = await ctx.db
      .query("fixtures")
      .withIndex("by_competition", (q: any) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();
    for (const f of fixtures) {
      await ctx.db.delete(f._id);
    }

    await kvSet(ctx, "sim_state:" + args.competitionId, {
      phase: "cancelled",
      startedAt: Date.now(),
    });
    await ctx.db.delete(args.competitionId);
  },
});

export const rescheduleMatches = mutation({
  args: {
    matchIds: v.array(v.id("competitionMatches")),
    startTime: v.number(),
  },
  handler: async (ctx, args) => {
    for (const id of args.matchIds) {
      await ctx.db.patch(id, { startTime: args.startTime });
    }
  },
});
