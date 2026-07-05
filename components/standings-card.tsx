"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useCachedQuery } from "~/hooks/use-cached-query";

const gridCols = "grid-cols-12";

export function StandingsCard({ showHeader = true }: { showHeader?: boolean }) {
  const standings = useCachedQuery(api.standings.list);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!showHeader ? "py-4" : ""}>
        <div className="font-mono text-sm">
          <div
            className={`grid ${gridCols} items-center gap-x-1 pb-1.5 text-foreground border-b border-border`}
          >
            <span className="col-span-1 text-start">#</span>
            <span className="col-span-5 flex items-center gap-1.5">
              <span>Team</span>
            </span>
            <span className="col-span-1 text-center">W</span>
            <span className="col-span-1 text-center">D</span>
            <span className="col-span-1 text-center">L</span>
            <span className="col-span-1 text-right">GD</span>
            <span className="col-span-2 text-right font-bold">Pts</span>
          </div>
          <motion.div layout className="divide-y divide-border">
            {standings === undefined ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  key={i}
                  className={`grid ${gridCols} items-center gap-x-1 py-2 skeleton-blink`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <span className="col-span-1 text-start text-foreground/30">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <div className="col-span-5 flex items-center gap-1.5">
                    <div className="size-7 bg-muted" />
                    <div className="h-4 w-16 bg-muted" />
                  </div>
                  <span className="col-span-1 text-center">
                    <div className="h-3 w-4 bg-muted mx-auto" />
                  </span>
                  <span className="col-span-1 text-center">
                    <div className="h-3 w-4 bg-muted mx-auto" />
                  </span>
                  <span className="col-span-1 text-center">
                    <div className="h-3 w-4 bg-muted mx-auto" />
                  </span>
                  <span className="col-span-1 text-right">
                    <div className="h-3 w-6 bg-muted ml-auto" />
                  </span>
                  <span className="col-span-2 text-right font-medium">
                    <div className="h-3 w-6 bg-muted ml-auto" />
                  </span>
                </div>
              ))
            ) : standings.length === 0 ? (
              <div className="py-4 text-center text-sm text-foreground">
                No standings data yet.
              </div>
            ) : (
              standings.map((entry) => (
                <motion.div
                  key={entry.team._id}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`grid ${gridCols} items-center gap-x-1 py-2`}
                >
                  <span className="col-span-1 text-start text-foreground">
                    {String(entry.rank).padStart(2, "0")}.
                  </span>
                  <div className="col-span-5 flex items-center gap-1.5">
                    {entry.team && (
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image
                          src={entry.team.logo}
                          alt={`${entry.team.name} logo`}
                          fill
                          className="object-cover"
                          sizes="1.75rem"
                        />
                      </div>
                    )}
                    <span>{entry.team?.name}</span>
                  </div>
                  <span className="col-span-1 text-center">{entry.wins}</span>
                  <span className="col-span-1 text-center">{entry.draws}</span>
                  <span className="col-span-1 text-center">{entry.losses}</span>
                  <span className="col-span-1 text-right">
                    {entry.goalDifference > 0
                      ? `+${entry.goalDifference}`
                      : entry.goalDifference}
                  </span>
                  <span className="col-span-2 text-right font-medium">
                    {entry.points}
                  </span>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
