"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { PlayerAvatar } from "~/components/ui/player-avatar";
import { api } from "~/convex/_generated/api";

type TeamRowProps = {
  index: number;
  team: NonNullable<ReturnType<typeof useQuery<typeof api.teams.list>>>[number];
};

export function TeamsCard({ showHeader = true }: { showHeader?: boolean }) {
  const teams = useQuery(api.teams.list);

  if (teams === undefined) {
    return (
      <Card className="col-span-1 md:col-span-4">
        {showHeader && (
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
        )}
        <CardContent
          className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              key={i}
              className="flex font-mono gap-2 items-center py-3 w-full px-1 skeleton-blink"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-foreground/30 w-5 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="size-6 bg-muted" />
              <div className="h-4 w-16 bg-muted" />
              <div className="flex-1" />
              <div className="h-3 w-14 bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);

  return (
    <Card className="col-span-1 md:col-span-4">
      {showHeader && (
        <CardHeader>
          <CardTitle>
            Teams — <span>{teams.length}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={`divide-y divide-border${!showHeader ? " py-4" : ""}`}
      >
        {teams.map((team, i) => (
          <TeamRow key={team._id} index={i + 1} team={team} />
        ))}
      </CardContent>
      <CardFooter className="justify-end font-mono text-xs text-foreground">
        {totalPlayers} total players
      </CardFooter>
    </Card>
  );
}

function TeamRow({ index, team }: TeamRowProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger className="flex font-mono gap-2 items-center py-3 w-full cursor-pointer hover:bg-muted/40 px-1 transition-colors">
        <span className="text-foreground w-5 text-right">
          {String(index).padStart(2, "0")}.
        </span>
        <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            fill
            className="object-cover"
            sizes="1.5rem"
          />
        </div>
        <span className="font-medium">{team.name}</span>
        <span className="text-end flex-1 text-xs text-foreground">
          {team.players.length} players
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="end" className="w-56 p-2">
        <div className="text-xs font-medium text-foreground px-1 pb-1.5">
          {team.name}
        </div>
        {team.players.map((player) => (
          <div key={player._id} className="flex items-center gap-2 px-1 py-1.5">
            <PlayerAvatar name={player.name} size="sm" />
            <span className="text-sm">{player.name}</span>
            <span className="text-end flex-1 text-xs">
              {player.game?.displayName ?? player.gameId}
            </span>
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
