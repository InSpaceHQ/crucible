import { isSameMonth, isToday } from "date-fns";

type TeamLike = { name: string } | null | undefined;

type MatchLike = { phase: string; round: number; status: string };

export const MAX_VISIBLE = 4;

export type DayCellMark = {
  isToday: boolean;
  isCurrentMonth: boolean;
  hasMatches: boolean;
  visibleCount: number;
  overflowCount: number;
};

export const GameMatch = {
  isTBD(...teams: TeamLike[]): boolean {
    return teams.some((t) => !t || t.name === "TBD");
  },

  isCompetitionComplete(matches: MatchLike[] | undefined): boolean {
    if (!matches) return false;
    const finalMatch = matches.find(
      (m) => m.phase === "knockout" && m.round === 8,
    );
    return finalMatch?.status === "completed";
  },

  getDayCellMark(
    day: Date,
    matches: unknown[],
    currentMonth: Date,
  ): DayCellMark {
    const hasMatches = matches.length > 0;
    const visibleCount = Math.min(matches.length, MAX_VISIBLE);
    const overflowCount = Math.max(0, matches.length - MAX_VISIBLE);

    return {
      isToday: isToday(day),
      isCurrentMonth: isSameMonth(day, currentMonth),
      hasMatches,
      visibleCount,
      overflowCount,
    };
  },
};
