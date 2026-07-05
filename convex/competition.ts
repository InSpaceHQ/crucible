import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

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

export const seedCompetition = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const allTeams = await ctx.db
      .query("teams")
      .withIndex("by_order")
      .order("asc")
      .collect();

    if (allTeams.length < 20) {
      throw new Error(
        `Need at least 20 teams, got ${allTeams.length}. Run the competition seed first.`,
      );
    }

    const teamsForComp = allTeams.slice(0, 20);
    const teamIds = teamsForComp.map((t) => t._id);

    const competitionId = await ctx.db.insert("competitions", {
      name: "Crucible Season 1",
      gameId: args.gameId,
      status: "active",
      season: "2026",
    });

    const groups = snakeDraft(
      teamIds.map((id) => id),
      4,
    );

    let fixtureCount = 0;
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
      fixtureCount += groupFixtures.length;
    }

    let standingsCount = 0;
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
        standingsCount++;
      }
    }

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
          homeTeamId: teamIds[0],
          awayTeamId: teamIds[1],
          status: "scheduled",
        });
      }
    }

    return {
      competitionId,
      fixtureCount,
      standingsCount,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("competitions").collect();
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

async function applyMatchResult(
  ctx: any,
  matchId: any,
  homeScore: number,
  awayScore: number,
) {
  const match = await ctx.db.get(matchId);
  if (!match) throw new Error("Match not found");
  await ctx.db.patch(matchId, { homeScore, awayScore, status: "completed" });
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

export const advanceKnockout = mutation({
  args: { competitionId: v.id("competitions") },
  handler: async (ctx, args) => {
    const standings = await ctx.db
      .query("competitionStandings")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
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
        .filter((s) => s.group === group)
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor,
        );

      if (groupStandings.length < 2) {
        throw new Error(`Group ${group} does not have enough teams`);
      }

      const allPlayed = groupStandings.every((s) => s.played === 4);
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
      .withIndex("by_competition_phase", (q) =>
        q.eq("competitionId", args.competitionId).eq("phase", "knockout"),
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

    const qfAllComplete = qf.every((m: any) => m.status === "completed");
    if (qfAllComplete) {
      const sfWinners = [
        getWinner(qf[0])!,
        getWinner(qf[2])!,
        getWinner(qf[1])!,
        getWinner(qf[3])!,
      ];

      for (let i = 0; i < sf.length; i++) {
        await ctx.db.patch(sf[i]._id, {
          homeTeamId: sfWinners[i * 2],
          awayTeamId: sfWinners[i * 2 + 1],
        });
      }

      const sfAllComplete = sf.every((m: any) => m.status === "completed");
      if (sfAllComplete) {
        const finalWinners = [getWinner(sf[0])!, getWinner(sf[1])!];
        await ctx.db.patch(final[0]._id, {
          homeTeamId: finalWinners[0],
          awayTeamId: finalWinners[1],
        });
      }
    }
  },
});
