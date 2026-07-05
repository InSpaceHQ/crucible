"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompetitionDetails } from "~/components/competition-card";
import { SimulateCompetition } from "~/components/simulate-competition";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { CompetitionMatches } from "~/components/competition-matches";
import { Fit } from "~/components/ui/fit";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const competition = useQuery(api.competition.get, {
    competitionId: id as Id<"competitions">,
  });

  if (competition === null) {
    notFound();
  }

  return (
    <div className="scanline-root">
      <div className="py-12 px-4 space-y-8 scanline-container">
        <Link href="/competitions">
          <Button variant="fill" size="sm">
            Back
          </Button>
        </Link>

        <div className="mt-8 flex items-center justify-between">
          <Fit options={{ maxSize: 72 }}>
            <h1 className="font-bold">{competition?.name ?? "Competition"}</h1>
          </Fit>
        </div>

        <CompetitionDetails competitionId={id as Id<"competitions">} />
      </div>

      <CompetitionMatches competitionId={id as Id<"competitions">} />

      <SimulateCompetition />
    </div>
  );
}
