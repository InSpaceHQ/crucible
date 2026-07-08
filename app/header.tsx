"use client";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight } from "lucide-react";
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
        <h1 className="text-3xl md:text-5xl select-none font-[neue_machina] relative font-bold inline-block self-start">
          <span className="font-mono bg-foreground text-background text-[8px] md:text-xxs absolute left-[18%] px-1 ">
            InSpace
          </span>
          Crucible
        </h1>

        <div className="flex items-center gap-3 md:gap-6">
          <Countdown targetDate={new Date("2026-08-01T00:00:00")} />

          <Link href="/game-rules" className="hidden md:inline-block">
            <Button variant="ghost" size="lg">
              Rules
            </Button>
          </Link>

          <Link
            href="https://bit.ly/crucible-inspace"
            target="_blank"
            className="hidden md:inline-block"
          >
            <Button variant={"ghost"} size={"lg"}>
              Join the Crucible <ArrowUpRight />
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
      </header>
    </>
  );
}
