"use client";

import { useMutation, useQuery } from "convex/react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Match = NonNullable<
  ReturnType<typeof useQuery<typeof api.competition.listMatches>>
>[number];

const statusStyles: Record<string, string> = {
  upcoming: "text-yellow-500 border-yellow-500/30",
  active: "text-green-500 border-green-500/30",
  completed: "text-foreground/40 border-border",
};

const ROUND_LABELS: Record<number, string> = {
  6: "Quarter-Finals",
  7: "Semi-Finals",
  8: "Final",
};

function MatchRow({
  match,
  onScoreChange,
}: {
  match: Match;
  onScoreChange: (
    matchId: Id<"competitionMatches">,
    homeScore: number,
    awayScore: number,
  ) => void;
}) {
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const completed = match.status === "completed";

  return (
    <div className="flex items-center gap-3 py-3 px-3 font-mono text-sm">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
          {match.homeTeam && (
            <Image
              src={match.homeTeam.logo}
              alt={`${match.homeTeam.name} logo`}
              fill
              className="object-cover"
              sizes="1.75rem"
            />
          )}
        </div>
        <span
          className={`truncate ${completed && homeScore > awayScore ? "font-bold" : ""}`}
        >
          {match.homeTeam?.name ?? "TBD"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            onScoreChange(match._id, Math.max(0, homeScore - 1), awayScore)
          }
          disabled={homeScore <= 0}
        >
          <Minus />
        </Button>
        <span className="tabular-nums w-6 text-center">{homeScore}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onScoreChange(match._id, homeScore + 1, awayScore)}
        >
          <Plus />
        </Button>
      </div>

      <span className="text-foreground/30 text-xs">vs</span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            onScoreChange(match._id, homeScore, Math.max(0, awayScore - 1))
          }
          disabled={awayScore <= 0}
        >
          <Minus />
        </Button>
        <span className="tabular-nums w-6 text-center">{awayScore}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onScoreChange(match._id, homeScore, awayScore + 1)}
        >
          <Plus />
        </Button>
      </div>

      <div className="flex flex-1 items-center gap-2 justify-end min-w-0">
        <span
          className={`truncate ${completed && awayScore > homeScore ? "font-bold" : ""}`}
        >
          {match.awayTeam?.name ?? "TBD"}
        </span>
        <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
          {match.awayTeam && (
            <Image
              src={match.awayTeam.logo}
              alt={`${match.awayTeam.name} logo`}
              fill
              className="object-cover"
              sizes="1.75rem"
            />
          )}
        </div>
      </div>

      <span className="text-[10px] text-foreground/40 shrink-0 w-16 text-right">
        {match.phase === "knockout"
          ? (ROUND_LABELS[match.round] ?? `Round ${match.round}`)
          : `Group ${match.group ?? "?"} R${match.round}`}
      </span>
    </div>
  );
}

function CompetitionMatchesSection({
  competitionId,
  name,
  gameName,
  status,
  createdAt,
}: {
  competitionId: Id<"competitions">;
  name: string;
  gameName: string;
  status: string;
  createdAt: number;
}) {
  const matches = useQuery(api.competition.listMatches, { competitionId });
  const updateMatchResult = useMutation(api.competition.updateMatchResult);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function handleScoreChange(
    matchId: Id<"competitionMatches">,
    homeScore: number,
    awayScore: number,
  ) {
    setPending((prev) => ({ ...prev, [matchId]: true }));
    try {
      await updateMatchResult({ matchId, homeScore, awayScore });
    } finally {
      setPending((prev) => ({ ...prev, [matchId]: false }));
    }
  }

  const loading = matches === undefined;

  return (
    <section className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3 mb-3 font-mono text-sm">
        <span className="font-bold">{name}</span>
        <span className="text-xs text-foreground/50">{gameName}</span>
        <span
          className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusStyles[status] ?? ""}`}
        >
          {status}
        </span>
        <span className="text-xs text-foreground/30 ml-auto">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "Africa/Lagos",
          })}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3">
              <div className="h-5 w-5 bg-muted skeleton-blink rounded-full" />
              <div className="h-3 w-20 bg-muted skeleton-blink" />
              <div className="h-3 w-12 bg-muted skeleton-blink ml-auto" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="py-3 text-center text-xs text-foreground/40">
          No matches for this competition.
        </div>
      ) : (
        (() => {
          const groupMatches = matches.filter((m) => m.phase === "group");
          const knockoutMatches = matches.filter((m) => m.phase === "knockout");

          const groups: Record<string, typeof groupMatches> = {};
          for (const m of groupMatches) {
            const key = `${m.group ?? "?"}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
          }

          const rounds: Record<number, typeof knockoutMatches> = {};
          for (const m of knockoutMatches) {
            if (!rounds[m.round]) rounds[m.round] = [];
            rounds[m.round].push(m);
          }

          return (
            <div className="divide-y divide-border border border-border">
              {Object.entries(groups).map(([groupName, groupMatches]) => {
                const byRound: Record<number, typeof groupMatches> = {};
                for (const m of groupMatches) {
                  if (!byRound[m.round]) byRound[m.round] = [];
                  byRound[m.round].push(m);
                }
                return Object.entries(byRound).map(([round, roundMatches]) => (
                  <div key={`group-${groupName}-${round}`}>
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono text-foreground/40 uppercase tracking-wider">
                      Group {groupName} &mdash; Round {round}
                    </div>
                    {roundMatches.map((m) => (
                      <MatchRow
                        key={m._id}
                        match={m}
                        onScoreChange={handleScoreChange}
                      />
                    ))}
                  </div>
                ));
              })}
              {Object.entries(rounds)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundMatches]) => (
                  <div key={`knockout-${round}`}>
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono text-foreground/40 uppercase tracking-wider">
                      {ROUND_LABELS[Number(round)] ?? `Round ${round}`}
                    </div>
                    {roundMatches.map((m) => (
                      <MatchRow
                        key={m._id}
                        match={m}
                        onScoreChange={handleScoreChange}
                      />
                    ))}
                  </div>
                ))}
            </div>
          );
        })()
      )}
    </section>
  );
}

function FixturesByCompetition() {
  const competitions = useQuery(api.competition.list);
  const games = useQuery(api.games.list);

  const loading = competitions === undefined || games === undefined;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fixtures by Competition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 w-24 bg-muted skeleton-blink" />
              <div className="h-4 w-12 bg-muted skeleton-blink" />
              <div className="h-4 w-16 bg-muted skeleton-blink ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (competitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fixtures by Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-sm text-foreground/60">
            No competitions yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const gamesById = Object.fromEntries(games.map((g) => [g._id, g.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixtures by Competition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {competitions.map((c) => (
            <CompetitionMatchesSection
              key={c._id}
              competitionId={c._id}
              name={c.name}
              gameName={gamesById[c.gameId] ?? "—"}
              status={c.status}
              createdAt={c._creationTime}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { FixturesByCompetition };
