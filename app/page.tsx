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
    logo: "https://api.dicebear.com/9.x/shapes/svg?seed=Nova&backgroundColor=ff6b6b",
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
    logo: "https://api.dicebear.com/9.x/shapes/svg?seed=Vertex&backgroundColor=4ecdc4",
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
    logo: "https://api.dicebear.com/9.x/shapes/svg?seed=Pulse&backgroundColor=ffa502",
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
    logo: "https://api.dicebear.com/9.x/shapes/svg?seed=Apex&backgroundColor=7c5cfc",
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
  { player1: "Aisha Khan", player2: "Zara Patel", game: "FC26", time: "14:00" },
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

        <div className="grid grid-cols-3 gap-4 scanline-container">
          <Card>
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
          <SkillsCard />
          <Card>
            <CardHeader>
              <CardTitle>Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex"></div>
            </CardContent>
          </Card>
        </div>
        <FixturesCard />
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
            sizes="24px"
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
                            sizes="24px"
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
                {i + 1}
              </span>
              <div className="flex flex-1 items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarImage src={""} />
                  <AvatarFallback className="text-[9px]">
                    {getInitials(p1.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[60px]">
                  {p1.name.split(" ")[0]}
                </span>
              </div>
              <span className="text-xs text-foreground">vs</span>
              <div className="flex flex-1 items-center gap-1.5 justify-end">
                <span className="truncate max-w-[60px]">
                  {p2.name.split(" ")[0]}
                </span>
                <Avatar className="size-5">
                  <AvatarImage src={""} />
                  <AvatarFallback className="text-[9px]">
                    {getInitials(p2.name)}
                  </AvatarFallback>
                </Avatar>
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
