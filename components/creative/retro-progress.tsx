import { range } from "effect/Array";
import React from "react";

const TOTAL = 24;

export function RetroProgressBar({
  progress = 0,
  interval = 500,
  onAnimationEnd,
}: {
  interval?: number;
  progress?: number;
  onAnimationEnd: VoidFunction;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<HTMLDivElement[]>([]);
  const displayedRef = React.useRef(0);

  // Create bars once on mount, clean up on unmount
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const bars: HTMLDivElement[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const bar = document.createElement("div");
      bar.className = "w-2 h-2 bg-accent-foreground opacity-20";
      container.appendChild(bar);
      bars.push(bar);
    }
    barsRef.current = bars;

    return () => {
      container.replaceChildren();
      barsRef.current = [];
    };
  }, []);

  // Animate toward target on progress change
  React.useEffect(() => {
    const bars = barsRef.current;
    if (!bars.length) return;

    const target = Math.round((progress / 100) * TOTAL);

    const id = setInterval(() => {
      if (displayedRef.current === target) {
        clearInterval(id);
        if (progress === 100) onAnimationEnd();
        return;
      }

      displayedRef.current += displayedRef.current < target ? 1 : -1;

      for (let i = 0; i < bars.length; i++) {
        bars[i].classList.toggle("opacity-20", i >= displayedRef.current);
      }
    }, interval);

    return () => clearInterval(id);
  }, [progress, interval]);

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={containerRef}
        className="gap-px flex p-0.5 border-2 border-accent-foreground"
      >
        {range(0, TOTAL - 1).map((index) => {
          return (
            <div
              key={index}
              className="w-2 h-2 bg-accent-foreground opacity-20"
            />
          );
        })}
      </div>
      <span className="animate-caret-blink font-bold text-center font-mono tracking-wider text-sm">
        LOADING
      </span>
    </div>
  );
}
