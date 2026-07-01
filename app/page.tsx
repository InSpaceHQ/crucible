"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import {
  teams,
  allPlayers,
  skills,
  fixtures,
  standings,
  schedule,
} from "~/app/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function Home() {
  return (
    <div className="py-12 text-foreground scanline-root relative w-[calc(100svw-30px)] mx-auto min-h-svh">
      <div className="mx-auto container w-full">
        <section className="flex justify-between pb-32">
          <h1 className="text-5xl font-[neue_machina] relative font-bold flex-col flex items-start">
            <span className="font-mono bg-foreground text-background text-[10px] absolute left-[18%] px-1 ">
              InSpace
            </span>
            Crucible
          </h1>
          <Link href="bit.ly/crucible-inspace" target="_blank">
            <Button variant={"ghost"} size={"lg"}>
              Join the competition <ArrowRight />
            </Button>
          </Link>
        </section>

        <div className="grid grid-cols-12 gap-4 scanline-container">
          <Card className="col-span-5">
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
            <CardFooter />
          </Card>
          <div className="col-span-4">
            <SkillsCard />
          </div>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex"></div>
            </CardContent>
          </Card>
          <div className="col-span-5">
            <StandingsCard />
          </div>
          <div className="col-span-7">
            <FixturesCard />
          </div>
        </div>

        <ScheduleSection />

      </div>
    </div>
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
          {team.players.length} members
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
            <Avatar className="size-6">
              <AvatarImage src={""} />
              <AvatarFallback className="text-[10px]">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{player.name}</span>
            <span className="text-end flex-1 text-xs">{player.game}</span>
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
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
                      <Avatar className="size-6 ring-2 ring-background">
                        <AvatarImage src={""} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
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
                        <Avatar className="size-8">
                          <AvatarImage src={""} />
                          <AvatarFallback className="text-xs">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
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
  const pts = (e: typeof standings[number]) => e.w * 3 + e.d;

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
                  <span className="col-span-1 text-right">{entry.gd > 0 ? `+${entry.gd}` : entry.gd}</span>
                  <span className="col-span-2 text-right font-medium">{pts(entry)}</span>
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
  const grouped = schedule.reduce<Record<string, typeof schedule>>(
    (acc, item) => {
      (acc[item.date] ??= []).push(item);
      return acc;
    },
    {},
  );

  const entries = Object.entries(grouped);

  return (
    <section className="flex gap-4 scanline-container mt-64">
      <div className="w-1/3 sticky self-start shrink-0">
        <h2 className="font-heading font-bold text-6xl">Showdown</h2>
      </div>
      <div className="flex-1 min-w-0">
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

function ScheduleDateGroup({ date, items, isLast }: { date: string; items: typeof schedule; isLast: boolean }) {
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
        {items.map((item, i) => (
          <div key={i}>
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