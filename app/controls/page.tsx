"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CompetitionList } from "~/components/controls/competition-list";
import { CreateCompetitionIntegrated } from "~/components/controls/create-competition-integrated";
import { FixturesByCompetition } from "~/components/controls/fixtures-by-competition";
import { MatchManager } from "~/components/controls/match-manager";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });
}

export default function ControlsPage() {
  const fixtures = useQuery(api.fixtures.list);
  const updateScore = useMutation(api.fixtures.updateScore);

  if (fixtures === undefined) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="font-mono text-lg font-bold mb-6">Controls</h1>
        <p className="font-mono text-sm text-foreground/60">Loading...</p>
      </div>
    );
  }

  const grouped: Record<string, typeof fixtures> = {};
  for (const f of fixtures) {
    const date = formatDate(f.startTime);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(f);
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">Controls</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCompetitionIntegrated />
        </CardContent>
      </Card>

      <CompetitionList />

      <MatchManager />

      <FixturesByCompetition />

      <section>
        <h2 className="font-mono text-sm text-foreground/60 font-bold uppercase tracking-wider mb-4">
          Fixture Controls
        </h2>
        {Object.entries(grouped).map(([date, dayFixtures]) => (
          <section key={date} className="mb-8">
            <h2 className="font-mono text-sm text-foreground/50 mb-3">
              {date}
            </h2>
            <div className="divide-y divide-border border border-border">
              {dayFixtures.map((fixture) => {
                const p1 = fixture.entries[0];
                const p2 = fixture.entries[1];

                return (
                  <div
                    key={fixture._id}
                    className="flex items-center gap-3 py-3 px-3 font-mono text-sm"
                  >
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                        {p1.player?.team && (
                          <Image
                            src={p1.player.team.logo}
                            alt={`${p1.player.team.name} logo`}
                            fill
                            className="object-cover"
                            sizes="1.75rem"
                          />
                        )}
                      </div>
                      <span className="truncate">
                        {p1.player?.name.split(" ")[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          updateScore({
                            fixtureId: fixture._id,
                            entryIndex: 0,
                            delta: -1,
                          })
                        }
                        disabled={p1.score <= 0}
                      >
                        <Minus />
                      </Button>
                      <span className="tabular-nums w-6 text-center">
                        {p1.score}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          updateScore({
                            fixtureId: fixture._id,
                            entryIndex: 0,
                            delta: 1,
                          })
                        }
                      >
                        <Plus />
                      </Button>
                    </div>

                    <span className="text-foreground/30 text-xs">vs</span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          updateScore({
                            fixtureId: fixture._id,
                            entryIndex: 1,
                            delta: -1,
                          })
                        }
                        disabled={p2.score <= 0}
                      >
                        <Minus />
                      </Button>
                      <span className="tabular-nums w-6 text-center">
                        {p2.score}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          updateScore({
                            fixtureId: fixture._id,
                            entryIndex: 1,
                            delta: 1,
                          })
                        }
                      >
                        <Plus />
                      </Button>
                    </div>

                    <div className="flex flex-1 items-center gap-2 justify-end min-w-0">
                      <span className="truncate">
                        {p2.player?.name.split(" ")[0]}
                      </span>
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                        {p2.player?.team && (
                          <Image
                            src={p2.player.team.logo}
                            alt={`${p2.player.team.name} logo`}
                            fill
                            className="object-cover"
                            sizes="1.75rem"
                          />
                        )}
                      </div>
                    </div>

                    <span className="text-foreground/40 text-xs shrink-0 w-10 text-right">
                      {formatTime(fixture.startTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
