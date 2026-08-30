import { motion } from "framer-motion";
import React from "react";

export function RandomText({ text: children }: { text: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    const el = ref.current;

    if (!el) return;
    const validEl = el;

    let frame = 0;
    let queue = [];

    function setText(newText: string) {
      const oldText = validEl.innerText;
      const length = Math.max(oldText.length, newText.length);
      queue = [];

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);

        queue.push({
          from,
          to,
          start,
          end,
          char: "",
        });
      }

      frame = 0;
      requestAnimationFrame(update);
    }

    function randomChar() {
      return chars[Math.floor(Math.random() * chars.length)];
    }

    let last = Date.now();

    function update() {
      let output = "";
      let complete = 0;
      const now = Date.now();

      const isAfter200 = now - last > 200;
      console.log({ frame, now });

      if (!isAfter200) {
        return requestAnimationFrame(update);
      }

      last = now;

      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end, char } = queue[i];

        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = randomChar();
            queue[i].char = char;
          }
          output += char;
        } else {
          output += from;
        }
      }

      el.innerText = output;

      if (complete < queue.length) {
        frame++;
        requestAnimationFrame(update);
      }
    }

    // On load: hide, then reveal with scramble
    el.innerText = "";
    setTimeout(() => setText(children), 500);
  }, [children]);

  return (
    <motion.div className="w-full border flex relative">
      <div className="opacity-25 w-full">{children}</div>
      <span ref={ref} className="absolute inset-0" />
    </motion.div>
  );
}
