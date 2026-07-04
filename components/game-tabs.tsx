"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StandingsCard } from "~/components/standings-card";
import { FixturesCard } from "~/components/fixtures-card";
import { TeamsCard } from "~/components/teams-card";
import { PlayerLeaderboard } from "~/components/player-leaderboard";

const TABS = [
  { value: "standings", label: "Standings", Component: StandingsCard },
  { value: "fixtures", label: "Fixtures", Component: FixturesCard },
  { value: "teams", label: "Teams", Component: TeamsCard },
  { value: "leaderboard", label: "Leaderboard", Component: PlayerLeaderboard },
] as const;

export function GameTabs() {
  const [tab, setTab] = useState("standings");

  return (
    <Tabs value={tab} onValueChange={setTab}>
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
