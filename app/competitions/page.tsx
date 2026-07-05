import Link from "next/link";

import { CompetitionCard } from "~/components/competition-card";
import { SimulateCompetition } from "~/components/simulate-competition";
import { Button } from "~/components/ui/button";

export default function CompetitionsPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-lg font-bold">Competitions</h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
        </div>
        <CompetitionCard showHeader />
      </div>
      <SimulateCompetition />
    </>
  );
}
