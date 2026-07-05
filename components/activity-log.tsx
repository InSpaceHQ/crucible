"use client";

import { range } from "effect/Array";
import { LogItem, LogItemSkeleton } from "~/components/log-item";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useCachedQuery } from "~/hooks/use-cached-query";

export function ActivityLog({ userId }: { userId: Id<"players"> }) {
  const entries = useCachedQuery(api.pointsLog.list, { playerId: userId });

  if (entries === undefined) {
    return (
      <div className="divide-y divide-border">
        {range(0, 6).map((i) => (
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
