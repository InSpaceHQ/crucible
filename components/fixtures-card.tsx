"use client";

import { range } from "effect/Array";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MatchRow } from "~/components/competition-matches";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { useCachedQuery } from "~/hooks/use-cached-query";

function TodayMatches({ competition }: { competition: Doc<"competitions"> }) {
  const matches = useCachedQuery(api.competition.listMatches, {
    competitionId: competition._id,
  });

  const [now] = useState(() => Date.now());
  const todayStart = new Date(
    new Date(now).getFullYear(),
    new Date(now).getMonth(),
    new Date(now).getDate(),
  ).getTime();
  const todayEnd = todayStart + 86_400_000;

  const todayMatches = (matches ?? []).filter(
    (m) =>
      m.startTime != null &&
      m.startTime >= todayStart &&
      m.startTime < todayEnd,
  );

  if (matches === undefined) {
    return (
      <div className="divide-y divide-border">
        {range(0, 3).map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 font-mono text-sm skeleton-blink"
          >
            <div className="flex-1 flex justify-end">
              <div className="h-3 w-16 bg-muted" />
            </div>
            <div className="h-3 w-8 bg-muted" />
            <div className="flex-1">
              <div className="h-3 w-16 bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-4">
      <h4 className="font-mono text-xs text-foreground/60 font-bold uppercase tracking-wider px-1 py-2">
        {competition.name}
      </h4>

      <div className="divide-y divide-border">
        {todayMatches.length > 0 ? (
          todayMatches.map((m) => <MatchRow key={m._id} match={m} />)
        ) : (
          <div className="py-4 px-1 space-y-3">
            <p className="text-sm italic text-foreground/60 font-mono">
              No matches today.
            </p>
            <Button variant="link" size="sm" asChild className="px-0">
              <Link href={`/competitions/${competition._id}#matches`}>
                See future matches <ArrowRight />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FixturesCard({ showHeader = true }: { showHeader?: boolean }) {
  const competitions = useCachedQuery(api.competition.list);

  if (competitions === undefined) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Fixtures</CardTitle>
          </CardHeader>
        )}
        <CardContent
          className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
        >
          {range(0, 8).map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-2 font-mono text-sm skeleton-blink"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-foreground/30 w-4 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex flex-1 items-center gap-1.5">
                <div className="size-7 bg-muted" />
                <div className="flex flex-col gap-1 leading-tight">
                  <div className="h-3 w-12 bg-muted" />
                  <div className="h-2 w-10 bg-muted" />
                </div>
              </div>
              <div className="h-4 w-8 bg-muted" />
              <div className="flex flex-1 items-center gap-1.5 justify-end">
                <div className="flex flex-col gap-1 leading-tight items-end">
                  <div className="h-3 w-12 bg-muted" />
                  <div className="h-2 w-10 bg-muted" />
                </div>
                <div className="size-7 bg-muted" />
              </div>
              <div className="h-3 w-10 bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (competitions.length === 0) return null;

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Fixtures</CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
      >
        {competitions.map((c) => (
          <TodayMatches key={c._id} competition={c} />
        ))}
      </CardContent>
    </Card>
  );
}
