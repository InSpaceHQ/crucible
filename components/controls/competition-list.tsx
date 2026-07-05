"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const statusStyles: Record<string, string> = {
  upcoming: "text-yellow-500 border-yellow-500/30",
  active: "text-green-500 border-green-500/30",
  completed: "text-foreground/40 border-border",
};

function CompetitionList() {
  const competitions = useQuery(api.competition.list);
  const games = useQuery(api.games.list);
  const clearCompetition = useMutation(api.competition.clearCompetition);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  if (competitions === undefined || games === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-32 bg-muted skeleton-blink" />
              <div className="h-4 w-16 bg-muted skeleton-blink" />
              <div className="h-4 w-20 bg-muted skeleton-blink ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const gamesById = Object.fromEntries(games.map((g) => [g._id, g.name]));

  async function handleClear(id: Id<"competitions">) {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await clearCompetition({ competitionId: id });
      toast.success("Competition deleted");
    } catch (error) {
      toast.error("Failed to delete competition", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitions</CardTitle>
      </CardHeader>
      <CardContent>
        {competitions.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/60">
            No competitions yet.
          </div>
        ) : (
          <div className="divide-y divide-border font-mono text-sm">
            {competitions.map((c) => (
              <div key={c._id} className="flex items-center gap-3 py-2">
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-xs text-foreground/50">
                  {gamesById[c.gameId] ?? "—"}
                </span>
                <span
                  className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusStyles[c.status] ?? ""}`}
                >
                  {c.status}
                </span>
                <span className="text-xs text-foreground/30">
                  {new Date(c._creationTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="text-foreground/30 hover:text-destructive transition-colors"
                      disabled={deleting[c._id]}
                    >
                      {deleting[c._id] ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{c.name}&rdquo;?
                        This will remove all matches, standings, and linked
                        fixtures.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleting[c._id]}
                        onClick={() => handleClear(c._id)}
                      >
                        {deleting[c._id] ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CompetitionList };
