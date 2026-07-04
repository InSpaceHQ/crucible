"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { PlayerAvatar } from "~/components/ui/player-avatar";
import { api } from "~/convex/_generated/api";
import { useCachedQuery } from "~/hooks/use-cached-query";

export function SkillsCard() {
  const skills = useCachedQuery(api.skills.list);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {skills === undefined ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              key={i}
              className="flex items-center gap-2 py-2 font-mono text-sm skeleton-blink"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="h-4 w-24 bg-muted" />
              <div className="flex flex-1 justify-end gap-0.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    key={j}
                    className="size-6 bg-muted"
                  />
                ))}
              </div>
            </div>
          ))
        ) : skills.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground">
            No skills awarded yet.
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill._id}
              className="flex items-center gap-2 py-2 font-mono text-sm"
            >
              <span className="font-medium">{skill.name}</span>
              {skill.description && (
                <span className="text-xs text-foreground">
                  ({skill.description})
                </span>
              )}
              <span className="text-xs text-foreground/50 ml-auto mr-2 tabular-nums">
                {skill.points} pts
              </span>
              <div className="flex -space-x-1">
                {skill.holders.map((player) => (
                  <HoverCard key={player._id} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger className="cursor-pointer">
                      <PlayerAvatar
                        name={player.name}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="bottom"
                      align="end"
                      className="w-56 p-2"
                    >
                      <div className="flex items-center gap-2 pb-1.5">
                        <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={player.team?.logo ?? ""}
                            alt={`${player.team?.name ?? "Unknown"} logo`}
                            fill
                            className="object-cover"
                            sizes="1.5rem"
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {player.team?.name}
                        </span>
                        <span className="text-end flex-1 text-xs">
                          {player.game?.displayName ?? player.gameId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-1 py-1.5">
                        <PlayerAvatar name={player.name} />
                        <div>
                          <div className="text-sm font-medium">
                            {player.name}
                          </div>
                          <div className="text-xs text-foreground">
                            {player.game?.displayName ?? player.gameId}
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
