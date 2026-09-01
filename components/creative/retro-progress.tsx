import { range } from "effect/Array";
import gsap from "gsap";
import React from "react";

const TOTAL = 24;

function updateBars(bars: HTMLDivElement[], position: number) {
  const floor = Math.floor(position);
  for (let i = 0; i < bars.length; i++) {
    if (i < floor) {
      bars[i].style.opacity = "1";
    } else if (i === floor) {
      const frac = position - floor;
      bars[i].style.opacity = String(0.2 + 0.8 * frac);
    } else {
      bars[i].style.opacity = "0.2";
    }
  }
}

export function RetroProgressBar({
  progress = 0,
  onAnimationEnd,
}: {
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

  // Lerp toward target on progress change
  React.useEffect(() => {
    const bars = barsRef.current;
    if (!bars.length) return;

    const target = Math.round((progress / 100) * TOTAL);
    const proxy = { progress: displayedRef.current };

    const tween = gsap.to(proxy, {
      progress: target,
      ease: "power2.out",
      duration: 0.5,
      onUpdate: () => {
        displayedRef.current = proxy.progress;
        updateBars(bars, proxy.progress);
      },
      onComplete: () => {
        displayedRef.current = target;
        updateBars(bars, target);
        if (progress === 100) onAnimationEnd();
      },
    });

    return () => {
      tween.kill();
    };
  }, [progress, onAnimationEnd]);

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
