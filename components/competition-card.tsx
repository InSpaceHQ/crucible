"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { useEffect } from "react";
import { GroupStandings } from "~/components/group-standings";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useCachedQuery } from "~/hooks/use-cached-query";
import { useSimStore } from "~/stores/use-sim-store";

export function CompetitionDetails({
  competitionId,
}: {
  competitionId: Id<"competitions">;
}) {
  const standings = useCachedQuery(api.competition.listStandings, {
    competitionId,
  });
  const bracket = useCachedQuery(api.competition.listBracket, {
    competitionId,
  });

  const loading = standings === undefined || bracket === undefined;
  const empty = !loading && standings?.length === 0 && !bracket?.length;

  if (loading) {
    return (
      <CardContent className="space-y-6">
        {Array.from({ length: 4 }).map((_, gi) => (
          <div key={gi}>
            <div className="h-4 w-8 bg-muted mb-2 skeleton-blink" />
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1.5 font-mono text-sm skeleton-blink"
                  style={{ animationDelay: `${(gi * 5 + i) * 0.08}s` }}
                >
                  <div className="h-3 w-4 bg-muted" />
                  <div className="size-5 bg-muted rounded-full" />
                  <div className="h-3 w-12 bg-muted" />
                  <div className="h-3 w-4 bg-muted ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    );
  }

  if (empty) {
    return (
      <CardContent>
        <div className="py-4 text-center text-sm text-foreground">
          No competition data available.
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      {standings && standings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standings.map((group) => (
            <GroupStandings
              key={group.group}
              groupName={group.group}
              entries={group.entries}
            />
          ))}
        </div>
      )}

      {bracket && bracket.length > 0 && (
        <div className="mt-6 border-t border-border pt-6">
          <h4 className="font-mono text-xs text-foreground/60 font-bold uppercase tracking-wider mb-4">
            Knockout Bracket
          </h4>
          <div className="space-y-4">
            {bracket.map((round) => (
              <div key={round.round}>
                <h5 className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider mb-2">
                  {round.round === 6
                    ? "Quarter-Finals"
                    : round.round === 7
                      ? "Semi-Finals"
                      : "Final"}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {round.matches.map((m) => {
                    const completed = m.status === "completed";
                    const homeWin = completed && m.homeScore! > m.awayScore!;
                    const awayWin = completed && m.awayScore! > m.homeScore!;

                    return (
                      <div
                        key={m._id}
                        className="border border-border p-2.5 flex items-center gap-2 font-mono text-sm"
                      >
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="relative size-4 shrink-0 overflow-hidden rounded-full bg-muted">
                              {m.homeTeam && (
                                <Image
                                  src={m.homeTeam.logo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="1rem"
                                />
                              )}
                            </div>
                            <span
                              className={
                                homeWin ? "font-bold" : "text-foreground/60"
                              }
                            >
                              {m.homeTeam?.name ?? "TBD"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="relative size-4 shrink-0 overflow-hidden rounded-full bg-muted">
                              {m.awayTeam && (
                                <Image
                                  src={m.awayTeam.logo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="1rem"
                                />
                              )}
                            </div>
                            <span
                              className={
                                awayWin ? "font-bold" : "text-foreground/60"
                              }
                            >
                              {m.awayTeam?.name ?? "TBD"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right min-w-[32px]">
                          {completed ? (
                            <span className="font-bold text-xs">
                              {m.homeScore}–{m.awayScore}
                            </span>
                          ) : (
                            <span className="text-[10px] text-foreground/30">
                              vs
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  );
}

export function CompetitionCard({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const competitions = useCachedQuery(api.competition.list);
  const games = useQuery(api.games.list);
  const lastCompetitionId = useSimStore((s) => s.lastCompetitionId);
  const setLastCompetitionId = useSimStore((s) => s.setLastCompetitionId);
  const liveCompetitionId = competitions?.[0]?._id ?? null;
  const competitionId = liveCompetitionId ?? lastCompetitionId;

  useEffect(() => {
    if (liveCompetitionId) {
      setLastCompetitionId(liveCompetitionId);
    }
  }, [liveCompetitionId, setLastCompetitionId]);

  const simState = useQuery(
    api.kv.get,
    competitionId ? { key: "sim_state:" + competitionId } : "skip",
  );

  const phase = simState?.phase;

  const phaseLabels: Record<string, string> = {
    round_1: "Round 1/5",
    round_2: "Round 2/5",
    round_3: "Round 3/5",
    round_4: "Round 4/5",
    round_5: "Round 5/5",
    knockout_qf: "Quarter-Finals",
    knockout_sf: "Semi-Finals",
    knockout_final: "Final",
    completed: "Completed",
  };

  const loading = competitions === undefined || games === undefined;

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Competition</CardTitle>
          </CardHeader>
        )}
        <CardContent className={`space-y-6 ${!showHeader ? "py-4" : ""}`}>
          {Array.from({ length: 4 }).map((_, gi) => (
            <div key={gi}>
              <div className="h-4 w-8 bg-muted mb-2 skeleton-blink" />
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 font-mono text-sm skeleton-blink"
                    style={{ animationDelay: `${(gi * 5 + i) * 0.08}s` }}
                  >
                    <div className="h-3 w-4 bg-muted" />
                    <div className="size-5 bg-muted rounded-full" />
                    <div className="h-3 w-12 bg-muted" />
                    <div className="h-3 w-4 bg-muted ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const isEmpty = competitions.length === 0;

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>{competitions[0]?.name ?? "No Competition"}</CardTitle>
        </CardHeader>
      )}

      {isEmpty ? (
        <CardContent className={!showHeader ? "py-4" : ""}>
          <div className="py-4 text-center text-sm text-foreground">
            No competition running.
          </div>
        </CardContent>
      ) : (
        <CompetitionDetails competitionId={competitions[0]._id} />
      )}
    </Card>
  );
}
