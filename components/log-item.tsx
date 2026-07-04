export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "< 1hr";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LogItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 font-mono text-xs skeleton-blink">
      <div className="h-3 w-14 bg-muted shrink-0" />
      <div className="flex-1 h-3 w-24 bg-muted" />
      <div className="h-4 w-8 bg-muted shrink-0" />
    </div>
  );
}

export function LogItem({
  timestamp,
  amount,
  variant,
  playerName,
  reason,
}: {
  timestamp: number;
  amount: number;
  variant: "points" | "activity";
  playerName?: string;
  reason: string;
}) {
  if (variant === "points") {
    return (
      <div className="grid grid-cols-[7ch_1fr_1.5fr_5ch] gap-2 py-2 font-mono text-xs items-center">
        <span className="text-muted-foreground truncate">
          {formatRelative(timestamp)}
        </span>
        <span className="truncate font-medium text-foreground">
          {playerName}
        </span>
        <span className="truncate text-foreground">{reason}</span>
        <span
          className={`font-bold tabular-nums text-right justify-self-end ${
            amount >= 0 ? "text-accent-foreground" : "text-red-500"
          }`}
        >
          {amount >= 0 ? "+" : ""}
          {amount}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground w-14 shrink-0">
        {formatRelative(timestamp)}
      </span>
      <span className="flex-1 truncate text-foreground">{reason}</span>
      <span
        className={`font-bold tabular-nums shrink-0 ${
          amount >= 0 ? "text-accent-foreground" : "text-red-500"
        }`}
      >
        {amount >= 0 ? "+" : ""}
        {amount}
      </span>
    </div>
  );
}
