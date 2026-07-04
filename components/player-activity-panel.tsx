"use client";

import Image from "next/image";
import type { Id } from "~/convex/_generated/dataModel";
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

export function PlayerActivityPanel({
  userId,
  open,
  onOpenChange,
  profile,
}: {
  userId?: Id<"players">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    name: string;
    teamName: string;
    teamLogo: string;
    gameName: string;
    kills: number;
    wins: number;
    matches: number;
  };
}) {
  const { isMobile } = useViewport();

  if (!userId) return null;

  const title = profile ? `${profile.name}'s Activity` : "Activity Log";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {profile && <ProfileHeader profile={profile} />}
            <ActivityLog userId={userId} />
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
        {profile && <ProfileHeader profile={profile} />}
        <ActivityLog userId={userId} />
      </SheetContent>
    </Sheet>
  );
}
