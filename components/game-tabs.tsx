"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StandingsCard } from "~/components/standings-card";
import { FixturesCard } from "~/components/fixtures-card";
import { TeamsCard } from "~/components/teams-card";
import { PlayerLeaderboard } from "~/components/player-leaderboard";
import { CompetitionCard } from "~/components/competition-card";

const TABS = [
  { value: "standings", label: "Standings", Component: StandingsCard },
  { value: "fixtures", label: "Fixtures", Component: FixturesCard },
  {
    value: "competition",
    label: "Competition",
    Component: () => <CompetitionCard />,
  },
  { value: "teams", label: "Teams", Component: TeamsCard },
  { value: "leaderboard", label: "Leaderboard", Component: PlayerLeaderboard },
] as const;

function GameTabsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("view") ?? "standings";

  function onTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList variant="default" className="justify-start">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(({ value, Component }) => (
        <TabsContent key={value} value={value} forceMount>
          <React.Activity mode={tab === value ? "visible" : "hidden"}>
            <Component showHeader={false} />
          </React.Activity>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function GameTabs() {
  return (
    <Suspense
      fallback={
        <Tabs defaultValue="standings">
          <TabsList variant="default" className="justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <GameTabsInner />
    </Suspense>
  );
}
