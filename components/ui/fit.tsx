"use client";

import { Slot } from "@radix-ui/react-slot";
import { useEffect, useRef } from "react";
import fitty from "fitty";

interface FitProps {
  children: React.ReactNode;
  options?: {
    minSize?: number;
    maxSize?: number;
    multiLine?: boolean;
    observeMutations?: MutationObserverInit;
  };
}

export function Fit({ children, options }: FitProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      const instance = fitty(ref.current, options);
      // instance.fit();

      return () => instance.unsubscribe();
    }
  }, [options]);

  return <Slot ref={ref}>{children}</Slot>;
}
