import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function CompetitionNotFound() {
  return (
    <div className="min-h-svh flex flex-col justify-center items-center">
      <div className="py-8 text-center flex flex-col gap-4 z-20 relative max-w-[40ch] px-2">
        <h1 className="text-sm font-light tracking-tighter inline-block px-2 bg-foreground text-background font-mono">
          404
        </h1>

        <p className="font-mono text-sm text-balance whitespace-nowrap">
          This page does not exist.
        </p>

        <Button variant="link" size="sm" asChild className="text-background">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
