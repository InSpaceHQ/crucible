"use client";

import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { LogItem, LogItemSkeleton } from "~/components/log-item";

export function PointsLog() {
  const [open, setOpen] = useState(false);
  const entries = useQuery(api.pointsLog.list, { limit: 5 });
  const allEntries = usePaginatedQuery(
    api.pointsLog.listPaginated,
    {},
    { initialNumItems: 20 },
  );

  if (entries === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Log</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <LogItemSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Points Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[7ch_1fr_1.5fr_5ch] gap-2 pb-1.5 font-mono text-xs text-muted-foreground border-b border-border">
            <span>Time</span>
            <span>Player</span>
            <span>Reason</span>
            <span className="text-right">Pts</span>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <LogItem
                key={entry._id}
                timestamp={entry.timestamp}
                amount={entry.amount}
                variant="points"
                playerName={entry.player?.name}
                reason={entry.reason}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            See All
          </Button>
        </CardFooter>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="max-w-lg flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>Points Log</SheetTitle>
          </SheetHeader>
          <div className="-mx-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-[7ch_1fr_1.5fr_5ch] gap-2 py-1.5 px-6 font-mono text-xs bg-foreground text-background">
              <span>Time</span>
              <span>Player</span>
              <span>Reason</span>
              <span className="text-right">Pts</span>
            </div>
            <div className="divide-y divide-border">
              {allEntries.results.map((entry) => (
                <div key={entry._id} className="px-6">
                  <LogItem
                    timestamp={entry.timestamp}
                    amount={entry.amount}
                    variant="points"
                    playerName={entry.player?.name}
                    reason={entry.reason}
                  />
                </div>
              ))}
            </div>
          </div>
          {allEntries.status !== "Exhausted" && (
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => allEntries.loadMore(20)}
              >
                Load More
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
