"use client";
import { pipe } from "effect/Function";
import React from "react";
import GameRules from "./game-rules.mdx";

const getHeadings = (items: HTMLElement[]) =>
  pipe(Array.from(items), (elements) =>
    elements.map((e) => ({
      link: `#${e.id}`,
      text: e.textContent?.replace(/\d{1,2}\.\s/i, ""),
    })),
  );

export default function GameRulesPage() {
  const [items, setItems] = React.useState<ReturnType<typeof getHeadings>>([]);

  React.useLayoutEffect(() => {
    const headings = document.querySelectorAll(
      "#rules-page h2",
    ) as unknown as HTMLElement[];

    for (const i of headings) {
      if (!i) continue;

      const id_value = i.textContent
        ?.replace(/\d{1,2}\.\s/i, "")
        ?.replace(/\s/g, "-")
        // ?.replace(/\W/g, '')
        ?.toLowerCase();

      if (!id_value) continue;

      i.setAttribute("id", id_value);
    }

    const transformed = getHeadings(headings);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(transformed);
  }, []);

  return (
    <div
      id="rules-page"
      className="mx-auto py-(--header-height) px-4 space-y-8"
    >
      <div className="mt-9 py-24 flex flex-col gap-32 md:flex-row md:gap-4 items-start">
        <aside className="w-full basis-1/3 md:sticky top-(--header-height)">
          <h6 className="text-sm mb-4 text-accent-foreground font-semibold">
            QUICK GLANCE
          </h6>

          <ul className="flex flex-col gap-2">
            {items.map((e, index) => {
              return (
                <a href={e.link} key={e.link}>
                  <li className="capitalize hover:underline gap-2 flex">
                    <span className="tabular-nums opacity-60">
                      {String(index).padStart(2, "0")}.
                    </span>
                    <span>{e.text?.toLowerCase()}</span>
                  </li>
                </a>
              );
            })}
          </ul>
        </aside>

        <div className="prose basis-2/3 flex-1">
          <GameRules />
        </div>
      </div>
    </div>
  );
}
