"use client";

import { useMutation, useQuery } from "convex/react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";

import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Fixture = NonNullable<
  ReturnType<typeof useQuery<typeof api.fixtures.list>>
>[number];

const statusStyles: Record<string, string> = {
  upcoming: "text-yellow-500 border-yellow-500/30",
  active: "text-green-500 border-green-500/30",
  completed: "text-foreground/40 border-border",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function FixtureRow({
  fixture,
  updateScore,
}: {
  fixture: Fixture;
  updateScore: ReturnType<typeof useMutation<typeof api.fixtures.updateScore>>;
}) {
  const p1 = fixture.entries[0];
  const p2 = fixture.entries[1];

  return (
    <div className="flex items-center gap-3 py-3 px-3 font-mono text-sm">
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
        <span className="truncate">{p1.player?.name.split(" ")[0]}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            updateScore({ fixtureId: fixture._id, entryIndex: 0, delta: -1 })
          }
          disabled={p1.score <= 0}
        >
          <Minus />
        </Button>
        <span className="tabular-nums w-6 text-center">{p1.score}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            updateScore({ fixtureId: fixture._id, entryIndex: 0, delta: 1 })
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
            updateScore({ fixtureId: fixture._id, entryIndex: 1, delta: -1 })
          }
          disabled={p2.score <= 0}
        >
          <Minus />
        </Button>
        <span className="tabular-nums w-6 text-center">{p2.score}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            updateScore({ fixtureId: fixture._id, entryIndex: 1, delta: 1 })
          }
        >
          <Plus />
        </Button>
      </div>

      <div className="flex flex-1 items-center gap-2 justify-end min-w-0">
        <span className="truncate">{p2.player?.name.split(" ")[0]}</span>
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
}

function FixturesByCompetition() {
  const competitions = useQuery(api.competition.list);
  const games = useQuery(api.games.list);
  const fixtures = useQuery(api.fixtures.list);
  const updateScore = useMutation(api.fixtures.updateScore);

  const loading =
    competitions === undefined || games === undefined || fixtures === undefined;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fixtures by Competition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 w-24 bg-muted skeleton-blink" />
              <div className="h-4 w-12 bg-muted skeleton-blink" />
              <div className="h-4 w-16 bg-muted skeleton-blink ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const gamesById = Object.fromEntries(games.map((g) => [g._id, g.name]));
  const compById = Object.fromEntries(competitions.map((c) => [c._id, c]));

  const byCompetition: Record<string, Fixture[]> = {};
  for (const f of fixtures) {
    const key = f.competitionId ?? "__unassigned__";
    if (!byCompetition[key]) byCompetition[key] = [];
    byCompetition[key].push(f);
  }

  const hasAny = fixtures.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixtures by Competition</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <div className="py-4 text-center text-sm text-foreground/60">
            No fixtures in the system.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {competitions.map((c) => {
              const compFixtures = byCompetition[c._id];
              return (
                <section key={c._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3 font-mono text-sm">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-xs text-foreground/50">
                      {gamesById[c.gameId] ?? "—"}
                    </span>
                    <span
                      className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusStyles[c.status] ?? ""}`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs text-foreground/30 ml-auto">
                      {new Date(c._creationTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "Africa/Lagos",
                      })}
                    </span>
                  </div>

                  {!compFixtures || compFixtures.length === 0 ? (
                    <div className="py-3 text-center text-xs text-foreground/40">
                      No fixtures for this competition.
                    </div>
                  ) : (
                    (() => {
                      const dateGroups: Record<string, Fixture[]> = {};
                      for (const f of compFixtures) {
                        const d = formatDate(f.startTime);
                        if (!dateGroups[d]) dateGroups[d] = [];
                        dateGroups[d].push(f);
                      }
                      return Object.entries(dateGroups).map(
                        ([date, dayFixtures]) => (
                          <div key={date} className="mb-4 last:mb-0">
                            <div className="font-mono text-xs text-foreground/50 mb-2">
                              {date}
                            </div>
                            <div className="divide-y divide-border border border-border">
                              {dayFixtures.map((f) => (
                                <FixtureRow
                                  key={f._id}
                                  fixture={f}
                                  updateScore={updateScore}
                                />
                              ))}
                            </div>
                          </div>
                        ),
                      );
                    })()
                  )}
                </section>
              );
            })}

            {byCompetition["__unassigned__"] && (
              <section className="py-4 last:pb-0">
                <div className="flex items-center gap-3 mb-3 font-mono text-sm">
                  <span className="font-bold text-foreground/50">
                    Unassigned
                  </span>
                </div>

                {(() => {
                  const unassigned = byCompetition["__unassigned__"];
                  const dateGroups: Record<string, Fixture[]> = {};
                  for (const f of unassigned) {
                    const d = formatDate(f.startTime);
                    if (!dateGroups[d]) dateGroups[d] = [];
                    dateGroups[d].push(f);
                  }
                  return Object.entries(dateGroups).map(
                    ([date, dayFixtures]) => (
                      <div key={date} className="mb-4 last:mb-0">
                        <div className="font-mono text-xs text-foreground/50 mb-2">
                          {date}
                        </div>
                        <div className="divide-y divide-border border border-border">
                          {dayFixtures.map((f) => (
                            <FixtureRow
                              key={f._id}
                              fixture={f}
                              updateScore={updateScore}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  );
                })()}
              </section>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { FixturesByCompetition };
