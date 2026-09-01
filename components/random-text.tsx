"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useInView } from "motion/react";
import React from "react";

gsap.registerPlugin(SplitText);

const RANDOM_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function getRandomChar() {
  return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
}

export function RandomText({
  children: text,
  animate = "in-view",
  viewport,
}: {
  children: React.ReactNode;
  animate?: "in-view";
  viewport?: { once: boolean };
}) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref);
  const animateCount = React.useRef(0);

  const startAnimation = (el: HTMLElement) => {
    if (viewport?.once === true && animateCount.current > 0) {
      return () => {};
    }

    animateCount.current += 1;

    const split = SplitText.create(el, { type: "chars" });
    const chars = split.chars.filter((c) => c.textContent?.trim());

    const jitterFrames = 32;
    const stepDelay = 0.03; // seconds between each char starting

    const ctx = gsap.context(() => {
      chars.forEach((char, i) => {
        const target = char.textContent ?? "";
        const tl = gsap.timeline({ delay: i * stepDelay });

        for (let f = 0; f < jitterFrames; f++) {
          tl.call(() => {
            char.textContent = getRandomChar();
          });
          tl.to({}, { duration: 1 / 60 });
        }

        tl.call(() => {
          char.textContent = target === " " ? " " : target;
        });
      });
    }, el);

    return () => {
      ctx.revert();
      split.revert();
    };
  };

  React.useEffect(() => {
    if (animate === "in-view" && !isInView) return;

    const el = ref.current;
    if (!el) return;

    const cleanup = startAnimation(el);

    return () => cleanup();
  }, [text, isInView, animate]);

  return (
    <p
      ref={ref}
      className="w-full"
      // style={{ fontFamily: "Monaspace Krypton" }}
    >
      {text}
    </p>
  );
}
