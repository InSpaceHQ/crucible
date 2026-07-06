"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/convex/_generated/api";
import { useCachedQuery } from "~/hooks/use-cached-query";

export function CompetitorsList() {
  const players = useCachedQuery(api.players.list);
  if (players === undefined) return null;

  const isEmpty = players.length === 0;

  return (
    <Card
      className="col-span-1 md:col-span-4"
      style={{ "--competitor-grid": "5ch 1fr 12ch" } as React.CSSProperties}
    >
      <CardHeader>
        <CardTitle>Competitors — {players.length}</CardTitle>
      </CardHeader>

      <CardContent className={isEmpty ? "" : "divide-y divide-border"}>
        {isEmpty ? (
          <p className="py-6 text-center text-sm text-foreground/60">
            No competitors registered
          </p>
        ) : (
          players.map((p, idx) => (
            <div
              key={p._id}
              className="grid grid-cols-(--competitor-grid) items-center py-2 px-1 font-mono text-sm gap-1"
            >
              <span className="text-foreground text-right">
                {String(idx + 1).padStart(2, "0")}.
              </span>
              <span>{p.name}</span>
              <span className="text-foreground/50 text-end text-xs">
                {p.teamName}
              </span>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="justify-end font-mono text-xs text-foreground">
        {players.length} total players
      </CardFooter>
    </Card>
  );
}
