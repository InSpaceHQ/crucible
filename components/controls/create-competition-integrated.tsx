"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CreateCompetitionForm,
  defaultFormState,
  type FormValues,
} from "~/components/forms/create-competition-form";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

function CreateCompetitionIntegrated() {
  const games = useQuery(api.games.list);
  const seedCompetition = useMutation(api.competition.seedCompetition);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (games === undefined) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-48 bg-muted skeleton-blink" />
        <div className="h-8 w-40 bg-muted skeleton-blink" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="py-2 text-sm text-foreground/60">
        No games available. Create a game first.
      </div>
    );
  }

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await seedCompetition({
        gameId: values.gameId as Id<"games">,
        name: values.name,
      });
      toast.success("Competition created", {
        description: `${result.fixtureCount} fixtures, ${result.standingsCount} teams.`,
      });
    } catch (error) {
      toast.error("Failed to create competition", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateCompetitionForm
      games={games.map((g) => ({
        _id: g._id,
        name: g.name,
        displayName: g.displayName,
      }))}
      initialFormData={defaultFormState}
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}

export { CreateCompetitionIntegrated };
