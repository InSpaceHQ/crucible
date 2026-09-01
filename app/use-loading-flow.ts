import { useCallback, useState } from "react";
import { FIRST_VISIT_KEY, STORAGE_KEY } from "./loading-screen";

export type LoadingState = "loading" | "ready" | "closing" | "unmounted";

export function useLoadingFlow(isFirstLoad: string) {
  const [state, setState] = useState<LoadingState>("loading");

  const complete = useCallback(() => {
    if (isFirstLoad !== "true") {
      // Returning visitor: skip content, close immediately
      window.dispatchEvent(new CustomEvent(STORAGE_KEY));
      localStorage.setItem(FIRST_VISIT_KEY, "false");
      setState("closing");
      setTimeout(() => setState("unmounted"), 2000);
    } else {
      setState("ready");
    }
  }, [isFirstLoad]);

  const close = useCallback(() => {
    window.dispatchEvent(new CustomEvent(STORAGE_KEY));
    localStorage.setItem(FIRST_VISIT_KEY, "false");
    setState("closing");
    setTimeout(() => setState("unmounted"), 2000);
  }, []);

  return { state, complete, close };
}
