"use client";
import { Effect, Exit, pipe } from "effect";
import { range } from "effect/Array";
import type { Cause } from "effect/Cause";
import { useInView } from "motion/react";
import React from "react";
import { useMediaQuery } from "usehooks-ts";
import { slideImages } from "./gallery-images";
import { delay, GridSliderAnimation, RandomInt } from "./grid-slider-animator";

export function GridSlides() {
  const ref = React.useRef<HTMLDivElement>(null);
  const is_in_view = useInView(ref);
  const isMobile = useMediaQuery("(max-width: 600px)", { defaultValue: true });

  const mountables = React.useMemo(() => [4, 10, 7, 6, 12, 11], []);

  React.useEffect(() => {
    if (isMobile) return;
    if (!ref.current) return;

    if (!is_in_view) {
      console.info("pausing since container is Not In View...");
      return;
    }

    const entries = ref.current?.querySelectorAll(
      "[data-box]",
    ) as unknown as HTMLElement[];
    const containers = Array.from(entries);

    console.assert(
      slideImages.size > 0,
      "[GridSlides] Atleast one slide image needed",
    );

    if (containers.length === 0)
      return console.warn("No available slots to render slide");

    let currentContainer: HTMLElement = containers[0],
      boxSwitchDelay = 1000,
      lastIndex = -1;

    const slots_count = containers.filter(
      (e) => e.getAttribute("data-mountable") === "true",
    );

    const next = () => {
      const index = RandomInt.random(slots_count.length);

      if (lastIndex === index) return next();
      lastIndex = index;

      return mountables[index];
    };

    const get_container = (): HTMLElement | null => {
      const next_index = next();
      currentContainer = containers[next_index];

      return currentContainer;
    };

    const getPair = () => {
      const box_1 = get_container();
      const box_2 = get_container();

      if (box_1 !== box_2) return [box_1, box_2];

      return getPair();
    };

    async function* loadPairsInfinitely() {
      while (true) {
        await delay(boxSwitchDelay);

        yield getPair();
      }
    }

    const startTransition = Effect.promise(async (signal) => {
      for await (const pairs of loadPairsInfinitely()) {
        if (signal.aborted) {
          break;
        }

        await Promise.all(
          pairs.map(async (box, index) => {
            if (!box) return;

            const slider = new GridSliderAnimation({
              root: () => box,
              transitionDelay: 0.2,
              enterDuration: 0.5,
              images: slideImages.randomTake(4),
            });

            await delay(index * 500);
            await slider.start();
            await slider.close();
          }),
        );

        boxSwitchDelay = RandomInt.randomBetween(1000, 2000);
      }
    });

    const abort_control = new AbortController();

    Effect.runPromiseExit(startTransition, {
      signal: abort_control.signal,
    }).then((exit) => {
      return pipe(
        exit,
        Exit.match({
          onFailure: (cause: Cause<unknown>) => {
            console.error("Stream failed", cause);
          },
          onSuccess: (_: unknown) => {},
        }),
      );
    });

    return () => abort_control.abort();
  }, [is_in_view, isMobile, mountables]);

  if (isMobile) return;

  return (
    <div className="pointer-events-none absolute top-0 z-80 inset-x-0">
      <div
        ref={ref}
        id="image-anchors"
        data-debug={false}
        className="group grid h-svh w-full grid-cols-3"
      >
        <div className="absolute right-0 grid h-full w-full grid-cols-6 grid-row-3 group-data-[debug=true]:border">
          {range(0, 17).map((count) => (
            <div
              key={count}
              data-box
              data-mountable={mountables.includes(count) ? "true" : "false"}
              className="relative border-red-400 group-data-[debug=true]:border overflow-hidden"
            >
              <span className="font-mono group-data-[debug=true]:block hidden">
                {String(count).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
