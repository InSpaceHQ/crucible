"use client";

import { GameRulesetIntegrated } from "~/components/controls/game-ruleset-integrated";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function GameRulesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <GameRulesetIntegrated />
      </CardContent>
    </Card>
  );
}
