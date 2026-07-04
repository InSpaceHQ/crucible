"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  allPlayers,
  fixtures,
  playerLeaderboard,
  schedule,
  skills,
  standings,
  teams,
} from "~/app/data";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Fit } from "~/components/ui/fit";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { PlayerAvatar } from "~/components/ui/player-avatar";
import { TeamsCard } from "~/components/teams-card";

function Countdown({ targetDate }: { targetDate: Date }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("00d : 00h : 00m : 00s");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${String(d).padStart(2, "0")}d : ${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`,
      );
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <span className="font-mono text-sm tabular-nums text-accent-foreground">
      {remaining}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <div className="marquee bg-foreground text-background font-mono text-xs md:text-sm py-2 w-svw">
        <div className="marquee-inner gap-12 px-6 font-bold">
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the 1st of August.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the 1st of August.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the 1st of August.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the 1st of August.
          </span>
        </div>
      </div>

      <div className="py-8 md:py-12 text-foreground scanline-root relative w-[calc(100svw-30px)] mx-auto min-h-svh">
        <div className="mx-auto container w-full">
          <section className="flex flex-col md:flex-row justify-between pb-16 md:pb-32 gap-4">
            <h1 className="text-3xl md:text-5xl select-none font-[neue_machina] relative font-bold inline-block self-start">
              <span className="font-mono bg-foreground text-background text-[8px] md:text-[10px] absolute left-[18%] px-1 ">
                InSpace
              </span>
              Crucible
            </h1>
            <div className="flex items-center gap-3 md:gap-6">
              <Countdown targetDate={new Date("2026-08-01T00:00:00")} />
              <Link href="https://bit.ly/crucible-inspace" target="_blank">
                <Button variant={"ghost"} size={"lg"}>
                  Join the competition <ArrowUpRight />
                </Button>
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 scanline-container z-10">
            <div className="col-span-1 md:col-span-6">
              <StandingsCard />
            </div>
            <div className="col-span-1 md:col-span-6">
              <FixturesCard />
            </div>
            <TeamsCard />
            <div className="col-span-1 md:col-span-4">
              <SkillsCard />
            </div>
            <PlayerLeaderboard />
          </div>

          <div className="block md:hidden">
            <ScheduleSectionMobile />
          </div>
          <div className="hidden md:block">
            <ScheduleSectionDesktop />
          </div>
        </div>

        <footer className="flex flex-col items-center gap-2 py-12 md:py-16 border-t border-border mt-16">
          <span className="font-mono text-xs text-foreground">
            Designed by{" "}
            <Link
              href="https://wigxel.io/"
              target="_blank"
              className="underline decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              Wigxel
            </Link> and Maintained by InSpace community
          </span>
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
        </footer>
      </div>
    </>
  );
}

function PlayerLeaderboard() {
  return (
    <Card className="col-span-1 md:col-span-4">
      <CardHeader>
        <CardTitle>Player Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {playerLeaderboard.map((player) => (
          <HoverCard key={player.name} openDelay={200} closeDelay={100}>
            <HoverCardTrigger className="flex font-mono gap-2 items-center py-2 text-sm w-full cursor-pointer hover:bg-muted/40 px-1 transition-colors">
              <span className="text-foreground w-4 text-right text-xs">
                {String(player.rank).padStart(2, "0")}.
              </span>
              <div className="flex-1 min-w-0 text-left">
                <span className="font-medium">{player.name}</span>
                <span className="text-foreground/50 ml-1.5 text-xs">
                  {player.team}
                </span>
              </div>
              <span className="text-accent-foreground font-bold tabular-nums">
                {player.kills}
              </span>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" align="start" className="w-48 p-3">
              <div className="flex items-center gap-2 mb-2">
                <PlayerAvatar name={player.name} />
                <div>
                  <div className="font-mono text-sm font-medium">
                    {player.name}
                  </div>
                  <div className="font-mono text-xs text-foreground/60">
                    {player.team}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/50">Kills</span>
                  <span className="font-bold text-accent-foreground">
                    {player.kills}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Wins</span>
                  <span className="font-bold">{player.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Matches</span>
                  <span className="font-bold">{player.matches}</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </CardContent>
    </Card>
  );
}

function SkillsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {skills.map((skill) => {
          const holders = skill.players
            .map((name) => allPlayers.find((p) => p.name === name))
            .filter((p): p is NonNullable<typeof p> => p != null);

          return (
            <div
              key={skill.name}
              className="flex items-center gap-2 py-2 font-mono text-sm"
            >
              <span className="font-medium">{skill.name}</span>
              {skill.description && (
                <span className="text-xs text-foreground">
                  ({skill.description})
                </span>
              )}
              <div className="flex flex-1 justify-end -space-x-1">
                {holders.map((player) => (
                  <HoverCard key={player.name} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger className="cursor-pointer">
                      <PlayerAvatar
                        name={player.name}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="bottom"
                      align="end"
                      className="w-56 p-2"
                    >
                      <div className="flex items-center gap-2 pb-1.5">
                        <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={player.teamLogo}
                            alt={`${player.team} logo`}
                            fill
                            className="object-cover"
                            sizes="1.5rem"
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {player.team}
                        </span>
                        <span className="text-end flex-1 text-xs">
                          {player.game}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-1 py-1.5">
                        <PlayerAvatar name={player.name} />
                        <div>
                          <div className="text-sm font-medium">
                            {player.name}
                          </div>
                          <div className="text-xs text-foreground">
                            {player.game}
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FixturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixtures</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {fixtures.map((fixture, i) => {
          const p1 = allPlayers.find((p) => p.name === fixture.player1);
          const p2 = allPlayers.find((p) => p.name === fixture.player2);
          if (!p1 || !p2) return null;

          return (
            <div
              key={`${fixture.player1}-${fixture.player2}`}
              className="flex items-center gap-2 py-2 font-mono text-sm"
            >
              <span className="text-foreground w-4 text-right text-xs">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex flex-1 items-center gap-1.5">
                <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={p1.teamLogo}
                    alt={`${p1.team} logo`}
                    fill
                    className="object-cover"
                    sizes="1.75rem"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs">{p1.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-foreground">{p1.team}</span>
                </div>
              </div>
              <span className="text-xs text-foreground min-w-[32px] text-center">
                {fixture.score ?? "vs"}
              </span>
              <div className="flex flex-1 items-center gap-1.5 justify-end">
                <div className="flex flex-col leading-tight items-end">
                  <span className="text-xs">{p2.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-foreground">{p2.team}</span>
                </div>
                <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={p2.teamLogo}
                    alt={`${p2.team} logo`}
                    fill
                    className="object-cover"
                    sizes="1.75rem"
                  />
                </div>
              </div>
              <span className="text-end text-xs text-foreground min-w-[40px]">
                {fixture.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StandingsCard() {
  const pts = (e: (typeof standings)[number]) => e.w * 3 + e.d;

  const gridCols = "grid-cols-12";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Standings</CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="divide-y divide-border">
            {standings.map((entry) => {
              const team = teams.find((t) => t.name === entry.name);
              return (
                <div
                  key={entry.name}
                  className={`grid ${gridCols} items-center gap-x-1 py-2`}
                >
                  <span className="col-span-1 text-start text-foreground">
                    {String(entry.rank).padStart(2, "0")}.
                  </span>
                  <div className="col-span-5 flex items-center gap-1.5">
                    {team && (
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image
                          src={team.logo}
                          alt={`${team.name} logo`}
                          fill
                          className="object-cover"
                          sizes="1.75rem"
                        />
                      </div>
                    )}
                    <span>{entry.name}</span>
                  </div>
                  <span className="col-span-1 text-center">{entry.w}</span>
                  <span className="col-span-1 text-center">{entry.d}</span>
                  <span className="col-span-1 text-center">{entry.l}</span>
                  <span className="col-span-1 text-right">
                    {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                  </span>
                  <span className="col-span-2 text-right font-medium">
                    {pts(entry)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleSectionMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 0.85, 1],
    ["-0.5ex", "1.1ex", "1.1ex", "-0.5ex"],
  );

  const grouped = schedule.reduce<Record<string, typeof schedule>>(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    },
    {},
  );

  const entries = Object.entries(grouped);

  return (
    <section
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-24 md:mt-64 relative"
    >
      <div className="md:col-span-3 md:sticky md:top-0 md:self-start hidden md:flex flex-col justify-center min-h-[50vh] overflow-hidden">
        <Fit
          options={{
            maxSize: 200,
            observeMutations: { subtree: true, childList: true },
          }}
        >
          <motion.h2
            style={{ translate: x }}
            className="text-[color-mix(in_oklch,var(--background)_100%,rgba(255,255,255,0.9)_11%)] font-heading tracking-tighter font-bold text-[10vh] origin-top-left whitespace-nowrap rotate-90 leading-[1ex]"
          >
            Schedule
          </motion.h2>
        </Fit>
      </div>
      <div className="md:hidden mb-6">
        <h2 className="font-heading tracking-tighter font-bold text-3xl">
          Schedule
        </h2>
        <p className="font-mono text-xs text-foreground/50 mt-1">
          8 Days of Mayhem
        </p>
      </div>
      <div className="md:col-span-9">
        {entries.map(([date, items], gi) => (
          <ScheduleDateGroupMobile
            key={date}
            date={date}
            items={items}
            isLast={gi === entries.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ScheduleDateGroupMobile({
  date,
  items,
  isLast,
}: {
  date: string;
  items: typeof schedule;
  isLast: boolean;
}) {
  return (
    <div className="relative flex pb-8 last:pb-0">
      <div className="relative w-[6ch] md:w-24 shrink-0 flex flex-col items-end overflow-x-clip">
        {!isLast && (
          <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
        )}
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="font-mono text-xs md:text-sm font-bold text-background bg-foreground px-1.5 md:px-2 py-0.5 md:py-1 block w-fit">
            {date}
          </span>
        </motion.div>
      </div>
      <div className="flex-1 min-w-0 space-y-5 pl-4 md:pl-8">
        {items.map((item) => (
          <div key={`${date}-${item.activity}`}>
            <p className="font-mono text-xs md:text-sm text-foreground/80 max-w-[60ch] text-pretty">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleSectionDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 0.85, 1],
    ["-0.5ex", "1.1ex", "1.1ex", "-0.5ex"],
  );

  const grouped = schedule.reduce<Record<string, typeof schedule>>(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    },
    {},
  );

  const entries = Object.entries(grouped);

  return (
    <section ref={sectionRef} className="flex gap-4 items-start mt-64 relative">
      <div className="top-0 basis-4/12 sticky self-start flex flex-col justify-center shrink-0 pointer-events-none">
        <div className="w-screen h-screen fixed top-0 left-0">
          <Fit
            options={{
              maxSize: 200,
              observeMutations: { subtree: true, childList: true },
            }}
          >
            <motion.h2
              style={{ translate: x }}
              className="absolute top-0 left-0 text-[color-mix(in_oklch,var(--background)_100%,rgba(255,255,255,0.9)_11%)] font-heading tracking-tighter font-bold text-[10vh] origin-top-left text-end whitespace-nowrap rotate-90 leading-[1ex]"
            >
              Schedule
            </motion.h2>
          </Fit>
        </div>
      </div>

      <div className="flex-1 min-w-0 pl-16">
        {entries.map(([date, items], gi) => (
          <ScheduleDateGroupDesktop
            key={date}
            date={date}
            items={items}
          // isLast={gi === entries.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ScheduleDateGroupDesktop({
  date,
  items,
  // isLast,
}: {
  date: string;
  items: typeof schedule;
  // isLast: boolean;
}) {
  return (
    <div className="relative flex pb-8">
      <div className="relative w-24 shrink-0 flex flex-col items-end overflow-x-clip">
        {/*{!isLast && (*/}
        <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
        {/*)}*/}
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="font-mono text-sm font-bold text-background bg-foreground px-2 py-1 block w-fit">
            {date}
          </span>
        </motion.div>
      </div>
      <div className="flex-1 min-w-0 space-y-5 pl-8">
        {items.map((item) => (
          <div key={`${date}-${item.activity}`}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-foreground/80 shrink-0">
                {item.time}
              </span>
              <div>
                <span className="font-mono text-sm font-bold">
                  {item.activity}
                </span>
                <p className="font-mono text-sm text-foreground/80 max-w-[60ch] text-pretty">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
