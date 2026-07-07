"use client";

import type { useQuery } from "convex/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { range } from "effect/Array";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import type { api } from "~/convex/_generated/api";
import { GameMatch } from "~/lib/game-match";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

type Match = NonNullable<
  ReturnType<typeof useQuery<typeof api.competition.listMatches>>
>[number];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function abbreviate(name: string): string {
  return name.slice(0, 3).toUpperCase();
}

function CalendarMatchRow({ match }: { match: Match }) {
  const completed = match.status === "completed";
  const homeWin = completed && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWin = completed && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="w-full cursor-default truncate text-left font-mono text-[10px] leading-tight hover:bg-muted border-0 px-0.5"
        >
          {match.startTime ? (
            <span className="text-foreground/60">
              {format(new Date(match.startTime), "HH:mm")}
            </span>
          ) : (
            <span className="text-foreground/30">--:--</span>
          )}
          <span> </span>
          <span>{abbreviate(match.homeTeam?.name ?? "???")}</span>
          <span> vs </span>
          <span>{abbreviate(match.awayTeam?.name ?? "???")}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="flex-1 truncate text-right">
            <span className={homeWin ? "font-bold" : ""}>
              {match.homeTeam?.name ?? "TBD"}
            </span>
          </div>
          <div className="relative size-6 shrink-0 overflow-hidden bg-muted">
            {match.homeTeam && (
              <Image
                src={match.homeTeam.logo}
                alt=""
                fill
                className="object-cover"
                sizes="1.5rem"
              />
            )}
          </div>
          <div className="tabular-nums shrink-0">
            {completed ? `${match.homeScore} : ${match.awayScore}` : "vs"}
          </div>
          <div className="relative size-6 shrink-0 overflow-hidden bg-muted">
            {match.awayTeam && (
              <Image
                src={match.awayTeam.logo}
                alt=""
                fill
                className="object-cover"
                sizes="1.5rem"
              />
            )}
          </div>
          <div className="flex-1 truncate">
            <span className={awayWin ? "font-bold" : ""}>
              {match.awayTeam?.name ?? "TBD"}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xxs text-foreground/40">
          <span>
            {match.phase === "knockout"
              ? `Round ${match.round}`
              : `Group ${match.group ?? "?"}`}
          </span>
          <span>
            {match.startTime
              ? format(new Date(match.startTime), "EEEE, MMM d")
              : "Unscheduled"}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function DayCell({
  day,
  matches,
  currentMonth,
}: {
  day: Date;
  matches: Match[];
  currentMonth: Date;
}) {
  const mark = GameMatch.getDayCellMark(day, matches, currentMonth);

  return (
    <div
      className={cn(
        " overflow-clip",
        mark.isCurrentMonth
          ? "bg-background "
          : "relative bg-background text-muted-foreground",
      )}
    >
      <div
        className={cn(`min-h-22 p-1 after:z-10!`, {
          "scanline-container": !mark.isCurrentMonth,
        })}
      >
        <span className="flex items-center gap-1">
          <span
            className={`font-mono text-[10px] ${
              mark.isToday ? "font-bold text-foreground" : "text-foreground/50"
            }`}
          >
            {format(day, "d")}
          </span>
          {mark.hasMatches && <span className="size-1 bg-accent-foreground" />}
        </span>
        <div className="mt-0.5 space-y-0.5">
          {matches.slice(0, mark.visibleCount).map((m) => (
            <CalendarMatchRow key={m._id} match={m} />
          ))}
          {mark.overflowCount > 0 && (
            <span className="block font-mono text-[10px] text-accent-foreground">
              +{mark.overflowCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompetitionCalendarGrid({
  matches,
}: {
  matches: Match[] | undefined;
}) {
  const active = useMemo(
    () =>
      (matches || []).filter(
        (m) => m.startTime != null && !GameMatch.isTBD(m.homeTeam, m.awayTeam),
      ),
    [matches],
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && active.length > 0) {
      const earliest = new Date(
        Math.min(...active.map((m) => m.startTime as number)),
      );
      setCurrentMonth(earliest);
      hasInitialized.current = true;
    }
  }, [active]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const matchesByDay = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of active) {
      const key = format(new Date(m.startTime as number), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [active]);

  const isComplete = useMemo(
    () => GameMatch.isCompetitionComplete(matches),
    [matches],
  );

  if (isComplete) return null;

  return (
    <div className="flex flex-col mb-8 px-4">
      <div className="flex bg-foreground items-center gap-2">
        <Button
          variant="fill"
          size="icon"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-mono text-sm text-background font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="fill"
          size="icon"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="border border-border">
        {matches === undefined ? (
          <div className="grid grid-cols-7 gap-px bg-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="bg-background p-2">
                <div className="h-3 w-8 bg-muted skeleton-blink" />
              </div>
            ))}
            {range(1, 35).map((i) => (
              <div key={i} className="min-h-22 bg-background p-2">
                <div className="mb-1 h-3 w-4 bg-muted skeleton-blink" />
                <div className="mb-0.5 h-2.5 w-full bg-muted skeleton-blink" />
                <div className="h-2.5 w-3/4 bg-muted skeleton-blink" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-px bg-border">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="bg-background px-1 py-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-foreground/40"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-border">
              {calendarDays.map((day) => (
                <DayCell
                  key={day.toISOString()}
                  day={day}
                  matches={matchesByDay.get(format(day, "yyyy-MM-dd")) || []}
                  currentMonth={currentMonth}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
