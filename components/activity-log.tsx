"use client";

import { useQuery } from "convex/react";
import type { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { LogItem, LogItemSkeleton } from "~/components/log-item";

export function ActivityLog({ userId }: { userId: Id<"players"> }) {
  const entries = useQuery(api.pointsLog.list, { playerId: userId });

  if (entries === undefined) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <LogItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => (
        <LogItem
          key={entry._id}
          timestamp={entry.timestamp}
          amount={entry.amount}
          variant="activity"
          reason={entry.reason}
        />
      ))}
    </div>
  );
}
