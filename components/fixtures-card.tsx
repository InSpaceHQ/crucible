"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function FixturesCard({ showHeader = true }: { showHeader?: boolean }) {
  const fixtures = useQuery(api.fixtures.list);

  if (fixtures === undefined) {
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
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

  if (fixtures.length === 0) return null;

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
        {fixtures.map((fixture, i) => {
          const p1 = fixture.entries[0];
          const p2 = fixture.entries[1];
          const started = p1.score !== 0 || p2.score !== 0;
          const scoreDisplay = started ? `${p1.score} - ${p2.score}` : "vs";

          return (
            <div
              key={fixture._id}
              className="flex items-center gap-2 py-2 font-mono text-sm"
            >
              <span className="text-foreground w-4 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex flex-1 items-center gap-1.5">
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
                <div className="flex flex-col leading-tight">
                  <span className="text-xs">
                    {p1.player?.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-foreground">
                    {p1.player?.team?.name}
                  </span>
                </div>
              </div>
              <span className="text-xs text-foreground min-w-[32px] text-center">
                {scoreDisplay}
              </span>
              <div className="flex flex-1 items-center gap-1.5 justify-end">
                <div className="flex flex-col leading-tight items-end">
                  <span className="text-xs">
                    {p2.player?.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-foreground">
                    {p2.player?.team?.name}
                  </span>
                </div>
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
              <span className="text-end text-xs text-foreground min-w-[40px]">
                {new Date(fixture.startTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Africa/Lagos",
                })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
