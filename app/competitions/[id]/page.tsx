"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { CompetitionDetails } from "~/components/competition-card";
import { CompetitionMatches } from "~/components/competition-matches";
import { SimulateCompetition } from "~/components/simulate-competition";
import { Button } from "~/components/ui/button";
import { Fit } from "~/components/ui/fit";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useCachedQuery } from "~/hooks/use-cached-query";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const competition = useCachedQuery(api.competition.get, {
    competitionId: id as Id<"competitions">,
  });

  if (competition === null) {
    notFound();
  }

  return (
    <div className="scanline-root page-content">
      <div className="scanline-container fixed z-1 pointer-events-none inset-0" />

      <div className="z-10 relative">
        <div className="py-12 px-4 space-y-8 z-10">
          <Link href="/competitions">
            <Button variant="fill" size="sm">
              Back
            </Button>
          </Link>

          <div className="mt-8 flex items-center justify-between">
            <Fit options={{ maxSize: 72 }}>
              <h1 className="font-bold">
                {competition?.name ?? "Competition"}
              </h1>
            </Fit>
          </div>

          <CompetitionDetails competitionId={id as Id<"competitions">} />
        </div>

        <CompetitionMatches competitionId={id as Id<"competitions">} />
      </div>

      <SimulateCompetition />
    </div>
  );
}
