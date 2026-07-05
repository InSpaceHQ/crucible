"use client";

import Link from "next/link";
import { CompetitionsSection } from "~/components/competitions-section";
import { GameTabs } from "~/components/game-tabs";
import { PlayerActivityPanel } from "~/components/player-activity-panel";
import { PointsLog } from "~/components/points-log";
import { ScheduleSection } from "~/components/schedule-section";
import { SimulateCompetition } from "~/components/simulate-competition";
import { SkillsCard } from "~/components/skills-card";

export default function Home() {
  return (
    <>
      <PlayerActivityPanel />

      <div className="py-8 md:py-12 text-foreground scanline-root relative w-[calc(100svw-30px)] mx-auto min-h-svh">
        <div className="mx-auto px-4 w-full mt-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 scanline-container z-10">
            <div className="md:col-span-8">
              <div className="border border-border">
                <GameTabs />
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-4">
              <PointsLog />
              <SkillsCard />
            </div>
          </div>

          <CompetitionsSection />
        </div>

        <ScheduleSection />

        <footer className="flex flex-col items-center gap-2 py-12 md:py-16 border-t border-border mt-16">
          <span className="font-mono text-xs text-foreground">
            Designed by{" "}
            <Link
              href="https://wigxel.io/"
              target="_blank"
              className="underline decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              Wigxel
            </Link>{" "}
            and Maintained by InSpace community
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/InSpaceHQ/crucible"
              target="_blank"
              className="inline-flex items-center gap-2 font-mono text-xs text-foreground/60 hover:text-foreground transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Contribute on GitHub
            </Link>
          </div>
        </footer>
      </div>

      <SimulateCompetition />
    </>
  );
}
