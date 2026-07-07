"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { label: "Create Competition", href: "/controls/create-competition" },
  { label: "Competitions", href: "/controls/competitions" },
  { label: "Match Manager", href: "/controls/match-manager" },
  { label: "Fixtures", href: "/controls/fixtures" },
  { label: "Game Rules", href: "/controls/game-rules" },
  { label: "Schedule", href: "/controls/schedule" },
  { label: "Fixture Controls", href: "/controls/fixture-controls" },
] as const;

function ControlsNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row md:flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "font-mono text-sm px-3 py-2 transition-colors",
              active
                ? "bg-muted text-foreground font-bold"
                : "text-foreground/60 hover:text-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { ControlsNavbar };
