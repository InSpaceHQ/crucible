"use client";
import { useUser } from "@clerk/nextjs";
import { isPast } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

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

  if (isPast(targetDate)) return null;

  return (
    <span className="font-mono text-xs md:text-sm tabular-nums text-accent-foreground">
      {remaining}
    </span>
  );
}

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <>
      <div className="marquee bg-foreground text-background font-mono absolute top-0 z-60 text-xs md:text-sm py-2 w-full">
        <div className="marquee-inner gap-12 px-6 font-bold">
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the{" "}
            <span className="text-accent-foreground">1st of August</span>.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the{" "}
            <span className="text-accent-foreground">1st of August</span>.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the{" "}
            <span className="text-accent-foreground">1st of August</span>.
          </span>
          <span>
            Welcome to the most interactive gaming event in Port-Harcourt.
            starting on the{" "}
            <span className="text-accent-foreground">1st of August</span>.
          </span>
        </div>
      </div>

      <header className="flex absolute w-full top-8 pt-2 bg-background border-t-2 px-4 z-50 flex-row justify-between gap-4">
        <div className="basis-1/3 hidden md:block"></div>

        <div className="flex grow basis-1/3 justify-center items-center gap-3 md:gap-6">
          <Link href="/game-rules" className="hidden md:inline-block">
            <Button variant="ghost" size="lg" className="min-w-[12ch]">
              Rules
            </Button>
          </Link>

          <div className="my-2">
            <Link href="/" className="transform -translate-y-10">
              <Image
                id="brand-image"
                src="/images/crucible-logo.png"
                alt="Crucible Logo"
                width={100}
                height={37}
                className="max-48"
              />
            </Link>
          </div>

          <Link
            href="https://bit.ly/crucible-inspace"
            target="_blank"
            className="hidden md:inline-block "
          >
            <Button variant={"ghost"} size={"lg"} className="min-w-[12ch]">
              Register <ArrowUpRight />
            </Button>
          </Link>

          {isSignedIn && (
            <Link href="/controls">
              <Button variant="ghost" size="lg">
                Controls
              </Button>
            </Link>
          )}
        </div>

        <div className="grow hidden basis-1/3 md:flex justify-end items-center">
          <Countdown targetDate={new Date("2026-10-31T00:00:00")} />
        </div>
      </header>
    </>
  );
}
