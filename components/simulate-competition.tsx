"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { isDevelopment } from "~/config/constants";

const PHASE_LABELS: Record<string, string> = {
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

function CircularProgress({ competitionId }: { competitionId: string }) {
  const state = useQuery(api.kv.get, { key: `sim_state:${competitionId}` });
  const phase = state?.phase;
  const startedAt = state?.startedAt as number | undefined;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  const progress =
    startedAt &&
    phase &&
    phase !== "completed" &&
    phase !== "error" &&
    phase !== "cancelled"
      ? Math.min((now - startedAt) / 10_000, 1)
      : 0;

  const r = 7;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  const label = phase ? (PHASE_LABELS[phase] ?? phase) : null;

  return (
    <span className="flex items-center gap-2 text-sm text-background">
      {label && label !== "Completed" && <span>{label}</span>}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        className="-rotate-90 shrink-0"
      >
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.15"
        />
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
    </span>
  );
}

function ClearButton({ competitionId }: { competitionId: Id<"competitions"> }) {
  const clearCompetition = useMutation(api.competition.clearCompetition);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    try {
      await clearCompetition({ competitionId });
    } finally {
      setClearing(false);
    }
  }

  return (
    <Button
      variant={"outline"}
      onClick={handleClear}
      disabled={clearing}
      className="h-7 text-[11px] px-2"
    >
      {clearing ? "..." : "Clear"}
    </Button>
  );
}

function SimulateButton({ gameId }: { gameId: Id<"games"> }) {
  const start = useMutation(api.competition.startSimulation);

  async function handleStart() {
    const name = `Sim ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    await start({ gameId, name });
  }

  return (
    <Button
      variant="default"
      onClick={handleStart}
      className="h-7 text-[11px] px-2"
    >
      + Simulate
    </Button>
  );
}

export function SimulateCompetition() {
  const games = useQuery(api.games.list);
  const competitions = useQuery(api.competition.list);
  const gameId = games?.[0]?._id;

  if (!isDevelopment) return null;
  if (!gameId) return null;

  return (
    <div className="bottom-2 fixed left-1/2 z-60 -translate-x-1/2 bg-foreground py-2 px-4 flex items-center gap-3">
      {competitions?.map((c) => (
        <div key={c._id} className="flex items-center gap-2">
          <span className="text-sm font-mono text-background/80 whitespace-nowrap">
            {c.name}
          </span>
          <CircularProgress competitionId={c._id} />
          <ClearButton competitionId={c._id} />
        </div>
      ))}
      <SimulateButton gameId={gameId} />
    </div>
  );
}
