"use client";

import { useQuery } from "convex/react";
import Link from "next/link";

import { api } from "~/convex/_generated/api";

const statusStyles: Record<string, string> = {
  upcoming: "text-yellow-500 border-yellow-500/30",
  active: "text-green-500 border-green-500/30",
  completed: "text-foreground/40 border-border",
};

function CompetitionsSection() {
  const competitions = useQuery(api.competition.list);
  const games = useQuery(api.games.list);

  const loading = competitions === undefined || games === undefined;

  const gamesById = Object.fromEntries(
    (games ?? []).map((g) => [g._id, g.name]),
  );

  return (
    <section className="mt-16">
      <h2 className="font-mono text-sm text-foreground/60 font-bold uppercase tracking-wider mb-4">
        Competitions
      </h2>

      {loading ? (
        <div className="divide-y divide-border font-mono text-sm border border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="h-4 w-32 bg-muted skeleton-blink" />
              <div className="h-4 w-16 bg-muted skeleton-blink" />
              <div className="h-4 w-20 bg-muted skeleton-blink ml-auto" />
            </div>
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <div className="py-4 text-center text-sm text-foreground/60 border border-border">
          No competitions yet.
        </div>
      ) : (
        <div className="divide-y divide-border font-mono text-sm border border-border">
          {competitions.map((c) => (
            <Link
              key={c._id}
              href={`/competitions/${c._id}`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors"
            >
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-foreground/50">
                {gamesById[c.gameId] ?? "—"}
              </span>
              <span
                className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusStyles[c.status] ?? ""}`}
              >
                {c.status}
              </span>
              <span className="text-xs text-foreground/30">
                {new Date(c._creationTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export { CompetitionsSection };
