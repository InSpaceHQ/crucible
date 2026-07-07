"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { GameRulesetForm } from "../forms/game-ruleset-form";

function GameRulesetIntegrated() {
  const games = useQuery(api.games.list);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const ruleset = useQuery(
    api.rulesets.getByGame,
    selectedGameId ? { gameId: selectedGameId as Id<"games"> } : "skip",
  );
  const upsert = useMutation(api.rulesets.upsert);
  const [saving, setSaving] = useState(false);

  if (games === undefined) return null;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="game-rules-game-select"
          className="text-sm font-medium mb-1 block"
        >
          Game
        </label>
        <Select
          value={selectedGameId ?? ""}
          onValueChange={(v) => setSelectedGameId(v)}
        >
          <SelectTrigger id="game-rules-game-select">
            <SelectValue placeholder="Select a game" />
          </SelectTrigger>
          <SelectContent>
            {games.map((g) => (
              <SelectItem key={g._id} value={g._id}>
                {g.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGameId && (
        <GameRulesetForm
          initialSections={ruleset?.sections ?? [{ title: "", content: "" }]}
          isLoading={saving}
          onSubmit={async (values) => {
            setSaving(true);
            try {
              await upsert({
                gameId: selectedGameId as Id<"games">,
                sections: values.sections,
              });
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
    </div>
  );
}

export { GameRulesetIntegrated };
