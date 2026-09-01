import { useEffect, useState } from "react";
import { slideImages } from "~/components/creative/gallery-images";
import { convex } from "~/components/providers/convex-client-provider";
import { api } from "~/convex/_generated/api";

export function useLoadingProgress() {
  const [imgLoaded, setImgLoaded] = useState(0);
  const [competitorsProgress, setCompetitorsProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let rafId: number;

    // Signal 1: images (3s timeout)
    const onImgProgress = (p: { loaded: number }) => {
      if (!cancelled) setImgLoaded(p.loaded);
    };

    const imgDone = slideImages.loadImages(onImgProgress);
    const imgTimeout = new Promise<void>((r) => setTimeout(r, 3000));
    Promise.race([imgDone, imgTimeout]).then(() => {
      if (!cancelled) setImgLoaded(10);
    });

    // Signal 2: competitors (5s timeout, linear interpolation)
    const start = Date.now();
    const duration = 5000;
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      setCompetitorsProgress(Math.min(50, (elapsed / duration) * 50));
      if (elapsed < duration) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    convex
      .query(api.players.list)
      .then(() => {
        if (!cancelled) {
          setCompetitorsProgress(50);
          cancelAnimationFrame(rafId);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return Math.round((imgLoaded / 10) * 50 + competitorsProgress);
}
