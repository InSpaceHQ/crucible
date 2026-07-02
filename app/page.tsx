"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  teams,
  allPlayers,
  skills,
  fixtures,
  standings,
  schedule,
  playerLeaderboard,
} from "~/app/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PlayerAvatar } from "~/components/ui/player-avatar";
import { useRef } from "react";
import { Fit } from "~/components/ui/fit";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

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

      <div className="py-12 text-foreground scanline-root relative w-[calc(100svw-30px)] mx-auto min-h-svh">
        <div className="mx-auto container w-full">
          <section className="flex justify-between pb-32">
            <h1 className="text-5xl select-none font-[neue_machina] relative font-bold flex-col flex items-start">
              <span className="font-mono bg-foreground text-background text-[10px] absolute left-[18%] px-1 ">
                InSpace
              </span>
              Crucible
            </h1>
            <div className="flex items-center gap-6">
              <Countdown targetDate={new Date("2026-08-01T00:00:00")} />
              <Link href="bit.ly/crucible-inspace" target="_blank">
                <Button variant={"ghost"} size={"lg"}>
                  Join the competition <ArrowRight />
                </Button>
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-4 scanline-container z-10">
            <div className="col-span-6">
              <StandingsCard />
            </div>
            <div className="col-span-6">
              <FixturesCard />
            </div>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>
                  Teams — <span>20</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {teams.map((team, i) => (
                  <TeamRow key={team.name} index={i + 1} team={team} />
                ))}
              </CardContent>
              <CardFooter className="justify-end font-mono text-xs text-foreground">
                {teams.reduce((sum, t) => sum + t.players.length, 0)} total
                players
              </CardFooter>
            </Card>
            <div className="col-span-4">
              <SkillsCard />
            </div>
            <PlayerLeaderboard />
          </div>

          <ScheduleSection />
        </div>
      </div>
    </>
  );
}

function TeamRow({ index, team }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger className="flex font-mono gap-2 items-center py-3 w-full cursor-pointer hover:bg-muted/40 px-1 transition-colors">
        <span className="text-foreground w-5 text-right">
          {String(index).padStart(2, "0")}.
        </span>
        <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            fill
            className="object-cover"
            sizes="1.5rem"
          />
        </div>
        <span className="font-medium">{team.name}</span>
        <span className="text-end flex-1 text-xs text-foreground">
          {team.players.length} players
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-56 p-2">
        <div className="text-xs font-medium text-foreground px-1 pb-1.5">
          {team.name}
        </div>
        {team.players.map((player) => (
          <div
            key={player.name}
            className="flex items-center gap-2 px-1 py-1.5"
          >
            <PlayerAvatar name={player.name} size="sm" />
            <span className="text-sm">{player.name}</span>
            <span className="text-end flex-1 text-xs">{player.game}</span>
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}

function PlayerLeaderboard() {
  return (
    <Card className="col-span-4">
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
                      align="start"
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

function ScheduleSection() {
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
              className="absolute top-0 left-0 text-[color-mix(in_oklch,var(--background)_100%,rgba(255,255,255,0.9)_11%)]  font-heading tracking-tighter font-bold text-[10vh] origin-top-left text-end whitespace-nowrap rotate-90 leading-[1ex]"
            >
              Schedule
            </motion.h2>
          </Fit>
        </div>
      </div>

      <div className="flex-1 min-w-0 pl-16">
        {entries.map(([date, items], gi) => (
          <ScheduleDateGroup
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

function ScheduleDateGroup({
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
      <div className="relative w-24 shrink-0 flex flex-col items-end overflow-x-clip">
        {!isLast && (
          <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
        )}
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
