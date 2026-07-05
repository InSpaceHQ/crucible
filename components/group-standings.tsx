"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type GroupEntry = {
  _id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  team: { name: string; logo: string } | null;
};

export function GroupStandings({
  groupName,
  entries,
}: {
  groupName: string;
  entries: GroupEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <Card
      className="text-xs md:text-sm"
      style={
        {
          "--group-grid": "4ch 5ch 1fr 4ch 4ch 4ch 4ch 6ch 6ch",
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <CardTitle>Group {groupName}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-(--group-grid) items-center gap-2 py-1.5 font-mono text-foreground/40 uppercase tracking-wider border-b border-border">
          <span className="text-start">#</span>
          <span />
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-right">GD</span>
          <span className="text-right">Pts</span>
        </div>

        <motion.div layout className="divide-y divide-border font-mono">
          {entries.map((entry) => (
            <motion.div
              key={entry._id}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="grid grid-cols-(--group-grid) items-center gap-2 py-1.5"
            >
              <span className="text-start text-foreground/50">
                {entry.position.toString().padStart(2, "0")}
              </span>
              <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
                {entry.team && (
                  <Image
                    src={entry.team.logo}
                    alt={`${entry.team.name} logo`}
                    fill
                    className="object-cover"
                    sizes="1.25rem"
                  />
                )}
              </div>
              <span className="truncate">{entry.team?.name ?? "—"}</span>
              <span className="text-center text-foreground/50">
                {entry.played}
              </span>
              <span className="text-center text-foreground/50">
                {entry.won}
              </span>
              <span className="text-center text-foreground/50">
                {entry.drawn}
              </span>
              <span className="text-center text-foreground/50">
                {entry.lost}
              </span>
              <span className="text-right text-foreground/50">
                {entry.goalDifference > 0
                  ? `+${entry.goalDifference}`
                  : entry.goalDifference}
              </span>
              <span className="text-right font-bold">{entry.points}</span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
