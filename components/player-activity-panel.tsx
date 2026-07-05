"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { onViewProfile } from "~/lib/events";
import { useCachedQuery } from "~/hooks/use-cached-query";
import { useViewport } from "~/hooks/use-viewport";
import { ActivityLog } from "~/components/activity-log";
import { PlayerAvatar } from "~/components/ui/player-avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/vaul-drawer";

function ProfileHeader({
  profile,
}: {
  profile: {
    name: string;
    teamName: string;
    teamLogo: string;
    gameName: string;
    kills: number;
    wins: number;
    matches: number;
  };
}) {
  return (
    <div className="mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <PlayerAvatar name={profile.name} size="lg" />
        <div>
          <div className="font-mono text-sm font-medium">{profile.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-foreground/60 mt-0.5">
            {profile.teamLogo && (
              <Image
                src={profile.teamLogo}
                alt=""
                width={14}
                height={14}
                className="object-cover"
              />
            )}
            {profile.teamName}
            <span className="text-foreground/30">·</span>
            {profile.gameName}
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-4 font-mono text-center">
        <div>
          <div className="text-2xl font-bold text-accent-foreground">
            {profile.kills}
          </div>
          <div className="text-xs text-foreground/50">Kills</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-accent-foreground">
            {profile.wins}
          </div>
          <div className="text-xs text-foreground/50">Wins</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-accent-foreground">
            {profile.matches}
          </div>
          <div className="text-xs text-foreground/50">Matches</div>
        </div>
      </div>
    </div>
  );
}

function ProfileIdentity({
  info,
}: {
  info: { name: string; teamName: string; teamLogo: string; gameName: string };
}) {
  return (
    <div className="mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <PlayerAvatar name={info.name} size="lg" />
        <div>
          <div className="font-mono text-sm font-medium">{info.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-foreground/60 mt-0.5">
            {info.teamLogo && (
              <Image
                src={info.teamLogo}
                alt=""
                width={14}
                height={14}
                className="object-cover"
              />
            )}
            {info.teamName}
            <span className="text-foreground/30">·</span>
            {info.gameName}
          </div>
        </div>
      </div>
      <p className="font-mono text-xs text-foreground/50 mt-3">
        Couldn&apos;t completely load profile.
      </p>
    </div>
  );
}

function PanelContent({
  playerId,
  info,
  open,
  onOpenChange,
}: {
  playerId: Id<"players">;
  info: { name: string; teamName: string; teamLogo: string; gameName: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isMobile } = useViewport();
  const stats = useCachedQuery(api.playerStats.getByPlayerId, {
    playerId,
  });

  const profile = stats
    ? {
        name: info.name,
        teamName: info.teamName,
        teamLogo: info.teamLogo,
        gameName: info.gameName,
        kills: stats.kills,
        wins: stats.wins,
        matches: stats.matches,
      }
    : null;

  const title = `${info.name}'s Activity`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {profile ? (
              <ProfileHeader profile={profile} />
            ) : stats === null ? (
              <ProfileIdentity info={info} />
            ) : null}
            <ActivityLog userId={playerId} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {profile ? (
          <ProfileHeader profile={profile} />
        ) : stats === null ? (
          <ProfileIdentity info={info} />
        ) : null}
        <ActivityLog userId={playerId} />
      </SheetContent>
    </Sheet>
  );
}

export function PlayerActivityPanel() {
  const [state, setState] = useState<{
    open: boolean;
    info: {
      name: string;
      teamName: string;
      teamLogo: string;
      gameName: string;
    };
    playerId: Id<"players">;
  } | null>(null);

  useEffect(
    () =>
      onViewProfile((detail) => {
        setState({
          open: true,
          info: {
            name: detail.name,
            teamName: detail.teamName,
            teamLogo: detail.teamLogo,
            gameName: detail.gameName,
          },
          playerId: detail.id,
        });
      }),
    [],
  );

  if (!state) return null;

  return (
    <PanelContent
      playerId={state.playerId}
      info={state.info}
      open={state.open}
      onOpenChange={(open) => {
        if (!open) setState(null);
      }}
    />
  );
}
