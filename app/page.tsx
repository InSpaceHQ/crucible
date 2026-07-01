"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
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

const teams = [
  {
    name: "Nova",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Nova&backgroundColor=ff6b6b",
    players: [
      { name: "Aisha Khan", game: "FC26" },
      { name: "Marcus Chen", game: "FC26" },
      { name: "Priya Singh", game: "MK1" },
      { name: "James Kim", game: "MK1" },
    ],
  },
  {
    name: "Vertex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vertex&backgroundColor=4ecdc4",
    players: [
      { name: "Zara Patel", game: "MK1" },
      { name: "Leo Torres", game: "MK1" },
      { name: "Maya Okafor", game: "FC26" },
      { name: "Kai Nakamura", game: "FC26" },
    ],
  },
  {
    name: "Pulse",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Pulse&backgroundColor=ffa502",
    players: [
      { name: "Yuki Tanaka", game: "FC26" },
      { name: "Elena Voss", game: "FC26" },
      { name: "Idris Adebayo", game: "MK1" },
      { name: "Lena Dupont", game: "MK1" },
    ],
  },
  {
    name: "Apex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Apex&backgroundColor=7c5cfc",
    players: [
      { name: "Sofia Reyes", game: "MK1" },
      { name: "Ravi Mehta", game: "MK1" },
      { name: "Nadia Petrova", game: "FC26" },
      { name: "Tomás Silva", game: "FC26" },
    ],
  },
];

const allPlayers = teams.flatMap((team) =>
  team.players.map((player) => ({
    ...player,
    team: team.name,
    teamLogo: team.logo,
  })),
);

const skills = [
  {
    name: "Best Goal",
    game: "FC26",
    description: "Soccer",
    players: ["Aisha Khan", "Marcus Chen", "Yuki Tanaka", "Nadia Petrova"],
  },
  {
    name: "Most Skilled Player",
    game: "Both",
    description: "",
    players: ["Zara Patel", "Kai Nakamura", "Idris Adebayo", "Ravi Mehta"],
  },
  {
    name: "Longest Combo",
    game: "MK",
    description: "",
    players: ["Priya Singh", "Leo Torres", "Lena Dupont", "Sofia Reyes"],
  },
  {
    name: "Quickest Win",
    game: "Both",
    description: "",
    players: ["Elena Voss", "Maya Okafor", "James Kim", "Tomás Silva"],
  },
  {
    name: "Flawless Warlock",
    game: "MK",
    description: "",
    players: ["James Kim", "Idris Adebayo", "Priya Singh", "Zara Patel"],
  },
];

const fixtures = [
  { player1: "Aisha Khan", player2: "Zara Patel", game: "FC26", time: "14:00", score: "3 - 1" },
  {
    player1: "Marcus Chen",
    player2: "Leo Torres",
    game: "FC26",
    time: "14:20",
  },
  {
    player1: "Priya Singh",
    player2: "Sofia Reyes",
    game: "MK1",
    time: "14:40",
  },
  { player1: "James Kim", player2: "Ravi Mehta", game: "MK1", time: "15:00" },
  {
    player1: "Yuki Tanaka",
    player2: "Maya Okafor",
    game: "FC26",
    time: "15:20",
  },
  {
    player1: "Elena Voss",
    player2: "Kai Nakamura",
    game: "FC26",
    time: "15:40",
  },
  {
    player1: "Idris Adebayo",
    player2: "Nadia Petrova",
    game: "MK1",
    time: "16:00",
  },
  {
    player1: "Lena Dupont",
    player2: "Tomás Silva",
    game: "MK1",
    time: "16:20",
  },
];

const standings = [
  { rank: 1, name: "Nova", w: 6, d: 1, l: 1, gd: 14 },
  { rank: 2, name: "Vertex", w: 5, d: 2, l: 1, gd: 9 },
  { rank: 3, name: "Pulse", w: 4, d: 1, l: 3, gd: 5 },
  { rank: 4, name: "Apex", w: 3, d: 0, l: 5, gd: -3 },
];

const schedule = [
  { date: "Jul 05", time: "09:00", activity: "Venue Setup", description: "Stage Assembly" },
  { date: "Jul 05", time: "14:00", activity: "Tech Rehearsal", description: "Stream Test" },
  { date: "Jul 05", time: "18:00", activity: "Media Day", description: "Player Photos" },
  { date: "Jul 06", time: "10:00", activity: "Early Bird Cup", description: "Warm-up Matches" },
  { date: "Jul 06", time: "12:00", activity: "Players Check-in", description: "Registration Opens" },
  { date: "Jul 06", time: "14:00", activity: "Warmup Arena", description: "Free Play Session" },
  { date: "Jul 06", time: "19:00", activity: "Opening Ceremony", description: "Season Kick-off" },
  { date: "Jul 07", time: "10:00", activity: "Draft Lottery", description: "Team Draw Live" },
  { date: "Jul 07", time: "13:00", activity: "Roster Lock", description: "Final Submissions" },
  { date: "Jul 07", time: "16:00", activity: "Press Briefing", description: "Coach Interviews" },
  { date: "Jul 08", time: "14:00", activity: "FC26 Face-off", description: "Nova vs Vertex" },
  { date: "Jul 08", time: "15:30", activity: "MK1 Brawl", description: "Pulse vs Apex" },
  { date: "Jul 09", time: "14:00", activity: "FC26 Rematch", description: "Nova vs Pulse" },
  { date: "Jul 09", time: "15:30", activity: "MK1 Rematch", description: "Vertex vs Apex" },
  { date: "Jul 10", time: "14:00", activity: "FC26 Semis", description: "Nova vs Vertex" },
  { date: "Jul 10", time: "15:30", activity: "MK1 Semis", description: "Pulse vs Apex" },
  { date: "Jul 11", time: "10:00", activity: "Fan Meet & Greet", description: "Autograph Session" },
  { date: "Jul 11", time: "12:00", activity: "All-Star Event", description: "Fan Vote Lineup" },
  { date: "Jul 11", time: "18:00", activity: "Finals Party", description: "Live Crowd Event" },
  { date: "Jul 12", time: "14:00", activity: "Bronze Match", description: "Third Place Play-off" },
  { date: "Jul 12", time: "16:00", activity: "Title Fight", description: "Championship Decider" },
  { date: "Jul 12", time: "18:30", activity: "Awards Night", description: "MVP Ceremony" },
];

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

  return (
    <section className="flex gap-4 scanline-container mt-64">
      <div className="w-1/3 sticky self-start shrink-0">
        <h2 className="font-heading font-bold text-6xl">Showdown</h2>
      </div>
      <div className="flex-1 min-w-0">
        {Object.entries(grouped).map(([date, items], gi) => (
          <div key={date} className="relative flex pb-8 last:pb-0">
            <div className="relative w-24 shrink-0 flex flex-col items-end">
              {gi < Object.entries(grouped).length - 1 && (
                <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
              )}
              <span className="font-mono text-xs font-bold text-background bg-foreground px-2 py-1">
                {date}
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-5 pl-8">
              {items.map((item, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-foreground shrink-0">
                      {item.time}
                    </span>
                    <span className="font-mono text-base font-medium">
                      {item.activity}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}