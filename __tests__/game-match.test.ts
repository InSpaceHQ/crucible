/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";

import { GameMatch } from "~/lib/game-match";

describe("isCompetitionComplete", () => {
  test("returns false when no matches exist", () => {
    expect(GameMatch.isCompetitionComplete([])).toBe(false);
  });

  test("returns false for schedule-only matches", () => {
    const matches = [
      { phase: "group" as const, round: 1, status: "completed" as const },
      { phase: "knockout" as const, round: 6, status: "scheduled" as const },
    ];
    expect(GameMatch.isCompetitionComplete(matches)).toBe(false);
  });

  test("returns false when final match is not completed", () => {
    const matches = [
      { phase: "knockout" as const, round: 8, status: "scheduled" as const },
    ];
    expect(GameMatch.isCompetitionComplete(matches)).toBe(false);
  });

  test("returns true when final match is completed", () => {
    const matches = [
      { phase: "knockout" as const, round: 8, status: "completed" as const },
    ];
    expect(GameMatch.isCompetitionComplete(matches)).toBe(true);
  });
});

describe("getDayCellMark", () => {
  test("returns no matches for empty day", () => {
    const result = GameMatch.getDayCellMark(
      new Date("2026-07-15"),
      [],
      new Date("2026-07-01"),
    );
    expect(result).toMatchObject({
      isToday: false,
      isCurrentMonth: true,
      hasMatches: false,
      visibleCount: 0,
      overflowCount: 0,
    });
  });

  test("marks today", () => {
    const today = new Date();
    const result = GameMatch.getDayCellMark(today, [], today);
    expect(result.isToday).toBe(true);
  });

  test("overflow when more than MAX_VISIBLE matches", () => {
    const day = new Date("2026-07-15");
    const matches = Array.from({ length: 6 }, (_, i) => ({ id: i }));
    const result = GameMatch.getDayCellMark(day, matches, day);
    expect(result).toMatchObject({
      hasMatches: true,
      visibleCount: 4,
      overflowCount: 2,
    });
  });

  test("detects outside month", () => {
    const result = GameMatch.getDayCellMark(
      new Date("2026-06-30"),
      [],
      new Date("2026-07-01"),
    );
    expect(result.isCurrentMonth).toBe(false);
  });
});

describe("isTBD", () => {
  test("returns true for null team", () => {
    expect(GameMatch.isTBD(null)).toBe(true);
  });

  test("returns true for undefined team", () => {
    expect(GameMatch.isTBD(undefined)).toBe(true);
  });

  test("returns true for team named TBD", () => {
    expect(GameMatch.isTBD({ name: "TBD" })).toBe(true);
  });

  test("returns false for real team", () => {
    expect(GameMatch.isTBD({ name: "FC Barcelona" })).toBe(false);
  });

  test("returns true when any team is TBD", () => {
    expect(GameMatch.isTBD({ name: "Real Madrid" }, { name: "TBD" })).toBe(
      true,
    );
  });
});
