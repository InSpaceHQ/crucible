"use client";

import { useQuery } from "convex/react";
import { format, formatDate } from "date-fns";
import Image from "next/image";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { GameMatch } from "~/lib/game-match";
import { CreativeWrapper } from "./schedule-section";

type Match = NonNullable<
  ReturnType<typeof useQuery<typeof api.competition.listMatches>>
>[number];

const ROUND_LABELS: Record<number, string> = {
  6: "Quarter-Finals",
  7: "Semi-Finals",
  8: "Final",
};

function MatchRow({ match }: { match: Match }) {
  const completed = match.status === "completed";
  const homeWin = completed && match.homeScore! > match.awayScore!;
  const awayWin = completed && match.awayScore! > match.homeScore!;

  return (
    <div className="flex items-center gap-3 py-2.5 font-mono text-sm">
      <span className="text-xxs text-foreground/40">
        {match.startTime ? formatDate(match.startTime, "HH:mm aa") : "--"}
      </span>

      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        <span
          className={`truncate ${homeWin ? "text-accent-foreground" : "text-foreground"}`}
        >
          {match.homeTeam?.name ?? "TBD"}
        </span>
        <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
          {match.homeTeam && (
            <Image
              src={match.homeTeam.logo}
              alt=""
              fill
              className="object-cover"
              sizes="1.25rem"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {completed ? (
          <span className="tabular-nums font-mono min-w-[4ch] text-center">
            {match.homeScore} : {match.awayScore}
          </span>
        ) : (
          <span className="text-foreground/30 text-xs">vs</span>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
          {match.awayTeam && (
            <Image
              src={match.awayTeam.logo}
              alt=""
              fill
              className="object-cover"
              sizes="1.25rem"
            />
          )}
        </div>
        <span
          className={`truncate ${awayWin ? "text-accent-foreground" : "text-foreground/80"}`}
        >
          {match.awayTeam?.name ?? "TBD"}
        </span>
      </div>

      <span className=" text-xxs text-foreground/40 shrink-0 w-20 text-right">
        {match.phase === "knockout"
          ? (ROUND_LABELS[match.round] ?? `Round ${match.round}`)
          : `Group Stage`}
      </span>
    </div>
  );
}

export function CompetitionMatches({
  competitionId,
}: {
  competitionId: Id<"competitions">;
}) {
  const matches = useQuery(api.competition.listMatches, { competitionId });

  const active = (matches || []).filter(
    (m) => !GameMatch.isTBD(m.homeTeam, m.awayTeam),
  );

  const unscheduled = active.filter((m) => m.startTime == null);
  const scheduled = active.filter((m) => m.startTime != null);

  const groupedByDay: Record<string, typeof scheduled> = {};
  for (const m of scheduled) {
    const day = format(new Date(m.startTime!), "yyyy-MM-dd");
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(m);
  }

  const sortedDays = Object.entries(groupedByDay).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <CreativeWrapper heading="Matchdays" subHeading="">
      {unscheduled.length > 0 && (
        <div className="mb-6">
          <h5 className="font-mono text-xxs text-foreground/40 uppercase tracking-wider mb-2">
            Unscheduled
          </h5>
          <div className="divide-y divide-border/20">
            {unscheduled.map((m) => (
              <MatchRow key={m._id} match={m} />
            ))}
          </div>
        </div>
      )}

      {active.length === 0 ? (
        <div className="py-4 text-center text-sm text-foreground/60">
          No matches yet.
        </div>
      ) : null}

      {matches === undefined
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 font-mono text-sm skeleton-blink"
            >
              <div className="flex-1 flex justify-end">
                <div className="h-3 w-16 bg-muted" />
              </div>
              <div className="h-3 w-8 bg-muted" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-muted" />
              </div>
            </div>
          ))
        : sortedDays.length > 0 && (
            <div>
              {sortedDays.map(([day, dayMatches]) => (
                <div key={day} className="mb-6 last:mb-0">
                  <div className="flex items-center mb-3 border-b">
                    <span className="font-mono text-xs font-bold text-background bg-foreground px-1.5 py-0.5">
                      {format(new Date(day), "MMM dd")}
                    </span>
                  </div>
                  <div className="divide-y divide-border/20">
                    {dayMatches.map((m) => (
                      <MatchRow key={m._id} match={m} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
    </CreativeWrapper>
  );
}
