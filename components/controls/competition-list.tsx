"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const statusStyles: Record<string, string> = {
  upcoming: "text-yellow-500 border-yellow-500/30",
  active: "text-green-500 border-green-500/30",
  completed: "text-foreground/40 border-border",
};

function CompetitionList() {
  const competitions = useQuery(api.competition.list);
  const games = useQuery(api.games.list);

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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CompetitionList };
