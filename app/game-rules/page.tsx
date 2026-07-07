"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { GameRulesView } from "~/components/game-rules/game-rules-view";
import { Button } from "~/components/ui/button";
import type { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";

export default function GameRulesPage() {
  const games = useQuery(api.games.list);

  if (games === undefined) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="font-mono text-lg font-bold mb-6">Game Rules</h1>
        <p className="font-mono text-sm text-foreground/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">Game Rules</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>
      {games.map((game) => (
        <GameRulesSection
          key={game._id}
          gameId={game._id}
          gameName={game.displayName}
        />
      ))}
    </div>
  );
}

function GameRulesSection({
  gameId,
  gameName,
}: {
  gameId: string;
  gameName: string;
}) {
  const ruleset = useQuery(api.rulesets.getByGame, {
    gameId: gameId as Id<"games">,
  });

  if (ruleset === undefined) {
    return (
      <div className="space-y-6">
        <h2 className="font-mono text-lg font-bold">{gameName} Rules</h2>
        <p className="font-mono text-sm text-foreground/60">Loading...</p>
      </div>
    );
  }

  if (!ruleset) {
    return (
      <div className="space-y-6">
        <h2 className="font-mono text-lg font-bold">{gameName} Rules</h2>
        <p className="font-mono text-sm text-foreground/60">
          No rules published yet.
        </p>
      </div>
    );
  }

  return <GameRulesView gameName={gameName} sections={ruleset.sections} />;
}
