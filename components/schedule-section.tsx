"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Fit } from "~/components/ui/fit";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";

type ScheduleItem = Doc<"schedule">;

export function ScheduleSection() {
  const items = useQuery(api.schedule.list);

  if (items === undefined) return null;

  const grouped = items.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    const key = format(item.timestamp, "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  return (
    <>
      <div className="block md:hidden">
        <ScheduleSectionMobile entries={entries} />
      </div>
      <div className="hidden md:block">
        <ScheduleSectionDesktop entries={entries} />
      </div>
    </>
  );
}

function ScheduleSectionMobile({
  entries,
}: {
  entries: [string, ScheduleItem[]][];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 0.85, 1],
    ["-0.5ex", "1.1ex", "1.1ex", "-0.5ex"],
  );

  return (
    <section
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-24 md:mt-64 relative"
    >
      <div className="md:col-span-3 md:sticky md:top-0 md:self-start hidden md:flex flex-col justify-center min-h-[50vh] overflow-hidden">
        <Fit
          options={{
            maxSize: 200,
            observeMutations: { subtree: true, childList: true },
          }}
        >
          <motion.h2
            style={{ translate: x }}
            className="text-[color-mix(in_oklch,var(--background)_100%,rgba(255,255,255,0.9)_11%)] font-heading tracking-tighter font-bold text-[10vh] origin-top-left whitespace-nowrap rotate-90 leading-[1ex]"
          >
            Schedule
          </motion.h2>
        </Fit>
      </div>
      <div className="md:hidden mb-6">
        <h2 className="font-heading tracking-tighter font-bold text-3xl">
          Schedule
        </h2>
        <p className="font-mono text-xs text-foreground/50 mt-1">
          8 Days of Mayhem
        </p>
      </div>
      <div className="md:col-span-9">
        {entries.map(([date, items], gi) => (
          <ScheduleDateGroupMobile
            key={date}
            date={date}
            items={items}
            isLast={gi === entries.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ScheduleDateGroupMobile({
  date,
  items,
  isLast,
}: {
  date: string;
  items: ScheduleItem[];
  isLast: boolean;
}) {
  return (
    <div className="relative flex pb-8 last:pb-0">
      <div className="relative w-[6ch] md:w-24 shrink-0 flex flex-col items-end overflow-x-clip">
        {!isLast && (
          <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
        )}
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="font-mono text-xs md:text-sm font-bold text-background bg-foreground px-1.5 md:px-2 py-0.5 md:py-1 block w-fit">
            {format(new Date(date), "MMM dd")}
          </span>
        </motion.div>
      </div>
      <div className="flex-1 min-w-0 space-y-5 pl-4 md:pl-8">
        {items.map((item) => (
          <div key={item._id}>
            <p className="font-mono text-xs md:text-sm text-foreground/80 max-w-[60ch] text-pretty">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleSectionDesktop({
  entries,
}: {
  entries: [string, ScheduleItem[]][];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 0.85, 1],
    ["-0.5ex", "1.1ex", "1.1ex", "-0.5ex"],
  );

  return (
    <section ref={sectionRef} className="flex gap-4 items-start mt-64 relative">
      <div className="top-0 basis-4/12 sticky self-start flex flex-col justify-center shrink-0 pointer-events-none">
        <div className="w-screen h-screen fixed top-0 left-0">
          <Fit
            options={{
              maxSize: 200,
              observeMutations: { subtree: true, childList: true },
            }}
          >
            <motion.h2
              style={{ translate: x }}
              className="absolute top-0 left-0 text-[color-mix(in_oklch,var(--background)_100%,rgba(255,255,255,0.9)_11%)] font-heading tracking-tighter font-bold text-[10vh] origin-top-left text-end whitespace-nowrap rotate-90 leading-[1ex]"
            >
              Schedule
            </motion.h2>
          </Fit>
        </div>
      </div>

      <div className="flex-1 min-w-0 pl-16">
        {entries.map(([date, items]) => (
          <ScheduleDateGroupDesktop key={date} date={date} items={items} />
        ))}
      </div>
    </section>
  );
}

function ScheduleDateGroupDesktop({
  date,
  items,
}: {
  date: string;
  items: ScheduleItem[];
}) {
  return (
    <div className="relative flex pb-8">
      <div className="relative w-24 shrink-0 flex flex-col items-end overflow-x-clip">
        <div className="absolute right-0 top-0 -bottom-8 w-px bg-border" />
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="font-mono text-sm font-bold text-background bg-foreground px-2 py-1 block w-fit">
            {format(new Date(date), "MMM dd")}
          </span>
        </motion.div>
      </div>
      <div className="flex-1 min-w-0 space-y-5 pl-8">
        {items.map((item) => (
          <div key={item._id}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-foreground/80 shrink-0">
                {format(item.timestamp, "HH:mm")}
              </span>
              <div>
                <span className="font-mono text-sm font-bold">
                  {item.activity}
                </span>
                <p className="font-mono text-sm text-foreground/80 max-w-[60ch] text-pretty">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
