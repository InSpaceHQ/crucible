import Link from "next/link";

import { Button } from "~/components/ui/button";

export default function CompetitionNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">Competition Not Found</h1>
        <Link href="/competitions">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>
      <div className="border border-border py-8 text-center">
        <p className="font-mono text-sm text-foreground/60">
          This competition doesn&rsquo;t exist or has been removed.
        </p>
      </div>
    </div>
  );
}
