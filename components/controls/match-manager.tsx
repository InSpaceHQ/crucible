"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { GameMatch } from "~/lib/game-match";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Match = NonNullable<
  ReturnType<typeof useQuery<typeof api.competition.listMatches>>
>[number];

const ROUND_LABELS: Record<number, string> = {
  6: "QF",
  7: "SF",
  8: "Final",
};

function roundLabel(m: Match): string {
  if (m.phase === "knockout") return ROUND_LABELS[m.round] ?? `R${m.round}`;
  return `R${m.round}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function formatDateForInput(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeForInput(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toLagosTimestamp(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const local = new Date(y, m - 1, d, h, min);
  const lagosOffset = 60 * 60 * 1000;
  return local.getTime() - local.getTimezoneOffset() * 60 * 1000 + lagosOffset;
}

const GRID = "grid-cols-[4ch_3ch_5ch_1fr_8ch]";

function MatchManager() {
  const competitions = useQuery(api.competition.list);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const matches = useQuery(
    api.competition.listMatches,
    selectedCompId
      ? { competitionId: selectedCompId as Id<"competitions"> }
      : "skip",
  );
  const rescheduleMatches = useMutation(api.competition.rescheduleMatches);

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const now = Date.now();
  const [dateVal, setDateVal] = useState(() => formatDateForInput(now));
  const [timeVal, setTimeVal] = useState(() => formatTimeForInput(now));

  const loadingComps = competitions === undefined;
  const loadingMatches = matches === undefined;
  const compsLoaded = competitions && competitions.length > 0;

  const visibleMatches = (matches ?? []).filter(
    (m) =>
      !GameMatch.isTBD(m.homeTeam, m.awayTeam) &&
      (!m.startTime || m.startTime >= now),
  );

  function toggleAll(selectAll: boolean) {
    setChecked(new Set(selectAll ? visibleMatches.map((m) => m._id) : []));
  }

  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetSelection() {
    setChecked(new Set());
  }

  async function handleApply() {
    if (checked.size === 0) return;
    const startTime = toLagosTimestamp(dateVal, timeVal);
    try {
      await rescheduleMatches({
        matchIds: Array.from(checked).map(
          (id) => id as Id<"competitionMatches">,
        ),
        startTime,
      });
      toast.success(
        `${checked.size} match${checked.size > 1 ? "es" : ""} rescheduled`,
      );
      resetSelection();
    } catch (error) {
      toast.error("Failed to reschedule", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (loadingComps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-48 bg-muted skeleton-blink" />
        </CardContent>
      </Card>
    );
  }

  if (!compsLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-2 text-sm text-foreground/60">
            No competitions yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      style={{ "--match-grid": "4ch 3ch 5ch 1fr 8ch" } as React.CSSProperties}
    >
      <CardHeader>
        <CardTitle>Match Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          className="w-full border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-foreground"
          value={selectedCompId ?? ""}
          onChange={(e) => {
            setSelectedCompId(e.target.value || null);
            resetSelection();
          }}
        >
          <option value="">Select a competition...</option>
          {competitions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {!selectedCompId ? (
          <div className="py-4 text-center text-sm text-foreground/60">
            Select a competition above to manage its matches.
          </div>
        ) : loadingMatches ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={GRID + " items-center gap-3 py-2"}>
                <div className="size-3.5 bg-muted skeleton-blink" />
                <div className="h-3 w-6 bg-muted skeleton-blink" />
                <div className="h-3 w-8 bg-muted skeleton-blink" />
                <div className="h-3 w-32 bg-muted skeleton-blink" />
                <div className="h-3 w-10 bg-muted skeleton-blink" />
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/60">
            No matches for this competition.
          </div>
        ) : (
          <>
            <div className="divide-y divide-border border border-border font-mono text-sm">
              <div
                className={
                  GRID +
                  " items-center gap-3 px-3 py-2 text-[11px] text-foreground/50 uppercase tracking-wider"
                }
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-foreground"
                    checked={
                      checked.size === visibleMatches.length &&
                      visibleMatches.length > 0
                    }
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                  <span className="sr-only">All</span>
                </label>
                <span>Group</span>
                <span>Round</span>
                <span>Match</span>
                <span className="text-right">Start</span>
              </div>
              {visibleMatches.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-foreground/40">
                  No upcoming matches.
                </div>
              ) : (
                visibleMatches.map((m) => (
                  <label
                    key={m._id}
                    className={
                      GRID +
                      " items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                    }
                  >
                    <input
                      type="checkbox"
                      className="size-3.5 accent-foreground shrink-0"
                      checked={checked.has(m._id)}
                      onChange={() => toggleOne(m._id)}
                    />
                    <span className="text-xs text-foreground/50">
                      {m.phase === "knockout" ? "—" : (m.group ?? "?")}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {roundLabel(m)}
                    </span>
                    <span className="truncate">
                      {m.homeTeam?.name ?? "TBD"}
                      <span className="text-foreground/30 mx-1">vs</span>
                      {m.awayTeam?.name ?? "TBD"}
                    </span>
                    <span className="text-right text-xs text-foreground/40">
                      {m.startTime ? formatTime(m.startTime) : "—"}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 font-mono text-sm">
              <span className="text-xs text-foreground/50 shrink-0">
                {checked.size} selected
              </span>
              <input
                type="date"
                className="flex-1 border border-border bg-background px-2 py-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-foreground min-w-0"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />
              <input
                type="time"
                className="w-28 border border-border bg-background px-2 py-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-foreground shrink-0"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
              />
              <Button
                variant="default"
                size="sm"
                disabled={checked.size === 0}
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { MatchManager };
