"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { useSimStore } from "~/stores/use-sim-store";

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
  const state = useQuery(api.kv.get, { key: "sim_state:" + competitionId });
  const phase = state?.phase;
  const startedAt = state?.startedAt as number | undefined;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  const progress =
    startedAt && phase && phase !== "completed" && phase !== "error"
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

export function SimulateCompetition() {
  const games = useQuery(api.games.list);
  const lastCompetitionId = useSimStore((s) => s.lastCompetitionId);
  const gameId = games?.[0]?._id;

  const clearCompetition = useMutation(api.competition.clearCompetition);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    try {
      await clearCompetition({ competitionId: lastCompetitionId! });
    } finally {
      setClearing(false);
    }
  }

  if (!gameId) return null;

  return (
    <div className="bottom-2 fixed left-1/2 -translate-x-1/2 bg-foreground py-2 px-4 flex items-center gap-3">
      {lastCompetitionId && (
        <CircularProgress competitionId={lastCompetitionId} />
      )}
      <SimulateCompetitionBehaviour gameId={gameId} />
      <Button variant={"outline"} onClick={handleClear} disabled={clearing}>
        {clearing ? "Clearing..." : "Clear"}
      </Button>
    </div>
  );
}

export function SimulateCompetitionBehaviour({ gameId }: { gameId: string }) {
  const start = useMutation(api.competition.startSimulation);

  async function handleStart() {
    await start({ gameId: gameId as any });
  }

  return (
    <Button variant="default" onClick={handleStart}>
      Simulate Competition
    </Button>
  );
}
