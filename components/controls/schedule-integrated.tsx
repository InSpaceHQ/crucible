"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { ScheduleForm } from "../forms/schedule-form";
import {
  EmptyState,
  EmptyStateConceal,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function ScheduleIntegrated() {
  const items = useQuery(api.schedule.listByCreation);
  const createItem = useMutation(api.schedule.create);
  const updateItem = useMutation(api.schedule.update);
  const removeItem = useMutation(api.schedule.remove);
  const [editingId, setEditingId] = useState<Id<"schedule"> | null>(null);

  if (items === undefined)
    return <div className="h-40 w-full animate-pulse bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="border border-border p-4">
        <h3 className="font-mono text-sm font-bold mb-3">New Schedule Item</h3>
        <ScheduleForm
          onSubmit={async (vals) => {
            await createItem(vals);
          }}
        />
      </div>

      <div className="divide-y divide-border border border-border">
        <EmptyState isEmpty={items.length === 0}>
          <EmptyStateContent>
            <EmptyStateTitle>No schedule items</EmptyStateTitle>
            <EmptyStateDescription>
              Create your first schedule item above.
            </EmptyStateDescription>
          </EmptyStateContent>
          <EmptyStateConceal>
            {items.map((item) => (
              <div key={item._id} className="py-3 px-4 space-y-2">
                {editingId === item._id ? (
                  <div className="space-y-3">
                    <ScheduleForm
                      initialValues={{
                        timestamp: item.timestamp,
                        activity: item.activity,
                        description: item.description,
                        link: item.link,
                        linkLabel: item.linkLabel,
                      }}
                      submitLabel="Update"
                      onSubmit={async (vals) => {
                        await updateItem({ id: item._id, ...vals });
                        setEditingId(null);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs text-foreground/40">
                          {formatTime(item.timestamp)}
                        </span>
                        <span className="font-mono text-sm font-bold">
                          {item.activity}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-foreground/60">
                        {item.description}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-accent-foreground inline-block"
                        >
                          {item.linkLabel ?? "Link"} ↗
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setEditingId(item._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={async () => {
                          try {
                            await removeItem({ id: item._id });
                            toast.success("Schedule item deleted");
                          } catch (e) {
                            toast.error("Failed to delete schedule item", {
                              description:
                                e instanceof Error
                                  ? e.message
                                  : "Unknown error",
                            });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </EmptyStateConceal>
        </EmptyState>
      </div>
    </div>
  );
}

export { ScheduleIntegrated };
