"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";

type Status =
  | { state: "idle" }
  | { state: "running"; competitionId?: string }
  | { state: "error"; message: string };

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

function CircularProgress({ phase }: { phase: string | undefined }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / 10_000, 1);
      setProgress(p);
      if (p >= 1) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [phase]);

  const r = 7;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  return (
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
  );
}

export function SimulateCompetition({
  gameId,
}: {
  gameId: string;
}) {
  return <div className="bottom-2 fixed left-1/2 -translate-x-1/2 bg-foreground py-2 px-4">
    <SimulateCompetitionBehaviour gameId={gameId} />
  </div>
}

export function SimulateCompetitionBehaviour({
  gameId,
}: {
  gameId: string;
}) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const start = useMutation(api.competition.startSimulation);

  const competitionId =
    status.state === "running" ? status.competitionId : undefined;
  const competition = useQuery(
    api.competition.get,
    competitionId ? { competitionId: competitionId as any } : "skip",
  );
  const latestPhase = competition?.phase;

  const showPhase =
    status.state === "running" && latestPhase && latestPhase !== "completed";

  async function handleStart() {
    setStatus({ state: "running" });
    try {
      const { competitionId: id } = await start({ gameId: gameId as any });
      setStatus({ state: "running", competitionId: id });
    } catch (e: unknown) {
      setStatus({
        state: "error",
        message: e instanceof Error ? e.message : "Failed to start simulation",
      });
    }
  }

  if (status.state === "running") {
    if (latestPhase === "completed") {
      return (
        <Button variant="outline" size="sm" disabled>
          <span className="inline-block size-2 rounded-full bg-green-500 shrink-0" />
          Simulation complete
        </Button>
      );
    }

    return (
      <Button variant="outline" size="sm" disabled>
        <CircularProgress key={latestPhase ?? "starting"} phase={latestPhase} />
        <span>
          {showPhase
            ? PHASE_LABELS[latestPhase] ?? latestPhase
            : "Starting..."}
        </span>
      </Button>
    );
  }

  if (status.state === "error") {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-foreground/60">
          {status.message}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setStatus({ state: "idle" })}>
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleStart}>
      Simulate Competition
    </Button>
  );
}
