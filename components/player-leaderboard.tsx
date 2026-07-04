"use client";

import { useCachedQuery } from "~/hooks/use-cached-query";
import { api } from "~/convex/_generated/api";
import { emitViewProfile } from "~/lib/events";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { PlayerAvatar } from "~/components/ui/player-avatar";

export function PlayerLeaderboard({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const entries = useCachedQuery(api.playerStats.list);

  if (entries === undefined) {
    return (
      <Card className="col-span-1 md:col-span-4">
        {showHeader && (
          <CardHeader>
            <CardTitle>Player Leaderboard</CardTitle>
          </CardHeader>
        )}
        <CardContent
          className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
              key={i}
              className="flex font-mono gap-2 items-center py-2 text-sm w-full px-1 skeleton-blink"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-foreground/30 w-4 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-24 bg-muted" />
                <div className="h-2 w-14 bg-muted mt-1" />
              </div>
              <div className="h-4 w-6 bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <Card className="col-span-1 md:col-span-4">
      {showHeader && (
        <CardHeader>
          <CardTitle>Player Leaderboard</CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
      >
        {entries.map((entry, i) => (
          <HoverCard key={entry._id} openDelay={200} closeDelay={100}>
            <HoverCardTrigger className="flex font-mono gap-2 items-center py-2 text-sm w-full cursor-pointer hover:bg-muted/40 px-1 transition-colors">
              <span className="text-foreground w-4 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex-1 min-w-0 text-left">
                <span className="font-medium">{entry.player?.name}</span>
                <span className="text-foreground/50 ml-1.5 text-xs">
                  {entry.player?.team?.name}
                </span>
              </div>
              <span className="text-accent-foreground font-bold tabular-nums">
                {entry.kills}
              </span>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" align="start" className="w-48 p-3">
              <div className="flex items-center gap-2 mb-2">
                <PlayerAvatar name={entry.player?.name ?? ""} />
                <div>
                  <div className="font-mono text-sm font-medium">
                    {entry.player?.name}
                  </div>
                  <div className="font-mono text-xs text-foreground/60">
                    {entry.player?.team?.name}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/50">Kills</span>
                  <span className="font-bold text-accent-foreground">
                    {entry.kills}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Wins</span>
                  <span className="font-bold">{entry.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Matches</span>
                  <span className="font-bold">{entry.matches}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 font-mono text-xs"
                onClick={() =>
                  emitViewProfile({
                    id: entry.playerId,
                    name: entry.player?.name ?? "",
                    teamName: entry.player?.team?.name ?? "",
                    teamLogo: entry.player?.team?.logo ?? "",
                    gameName:
                      entry.player?.game?.displayName ??
                      entry.player?.game?.name ??
                      "",
                  })
                }
              >
                View Profile
              </Button>
            </HoverCardContent>
          </HoverCard>
        ))}
      </CardContent>
    </Card>
  );
}
