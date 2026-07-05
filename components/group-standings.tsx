"use client";

import { motion } from "motion/react";
import Image from "next/image";

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
    <div>
      <h4 className="font-mono text-xs text-foreground/60 font-bold uppercase tracking-wider mb-2">
        Group {groupName}
      </h4>
      <motion.div layout className="divide-y divide-border font-mono text-sm">
        {entries.map((entry) => (
          <motion.div
            key={entry._id}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center gap-2 py-1.5"
          >
            <span className="w-4 text-right text-xs text-foreground/50">
              {entry.position}
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
            <span className="flex-1 truncate">{entry.team?.name ?? "—"}</span>
            <span className="text-foreground/50 w-4 text-center">
              {entry.played}
            </span>
            <span className="text-foreground/50 w-4 text-center">
              {entry.won}
            </span>
            <span className="text-foreground/50 w-4 text-center">
              {entry.drawn}
            </span>
            <span className="text-foreground/50 w-4 text-center">
              {entry.lost}
            </span>
            <span className="text-foreground/50 w-6 text-right">
              {entry.goalDifference > 0
                ? `+${entry.goalDifference}`
                : entry.goalDifference}
            </span>
            <span className="w-6 text-right font-bold">{entry.points}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
