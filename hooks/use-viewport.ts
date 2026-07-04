"use client";

import { useEffect, useState } from "react";

export function useViewport(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const widthMq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const touchMq = window.matchMedia("(pointer: coarse)");

    const check = () =>
      setIsMobile(
        widthMq.matches || (touchMq.matches && window.innerWidth < 1024),
      );

    check();
    const ac = new AbortController();
    widthMq.addEventListener("change", check, { signal: ac.signal });
    touchMq.addEventListener("change", check, { signal: ac.signal });
    return () => ac.abort();
  }, [breakpoint]);

  return { isMobile };
}
