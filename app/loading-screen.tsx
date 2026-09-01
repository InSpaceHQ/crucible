"use client";
import { AnimatePresence, motion, stagger } from "framer-motion";
import Image from "next/image";
import React from "react";
import { slideImages } from "~/components/creative/gallery-images";
import { PixelBackground } from "~/components/creative/pixel-background";
import { RetroProgressBar } from "~/components/creative/retro-progress";
import { CTAButton } from "~/components/cta-button";
import { convex } from "~/components/providers/convex-client-provider";
import { RandomText } from "~/components/random-text";
import { isDevelopment } from "~/config/constants";
import { api } from "~/convex/_generated/api";
import { isSSR } from "~/lib/utils";

export const STORAGE_KEY = "crucible::loadingScreen::hide";
const FIRST_VISIT_KEY = "crucible:firstvisit";

export function LoadingScreen() {
  const [isFirstLoad] = React.useState(() => {
    if (isDevelopment) return "true";
    if (isSSR()) return "true";
    return localStorage.getItem(FIRST_VISIT_KEY) ?? "true";
  });

  const [isOpen, setIsOpen] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);
  const [unmountBackdrop, setUnmountBackdrop] = React.useState(false);

  const closeLoadingScreen = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent(STORAGE_KEY));
    localStorage.setItem(FIRST_VISIT_KEY, "false");
    setIsOpen(false);
    setTimeout(() => {
      setUnmountBackdrop(true);
    }, 2000);
  }, []);

  React.useEffect(() => {
    if (isFirstLoad !== "true") {
      const timerId = setTimeout(() => {
        closeLoadingScreen();
      }, 2000);

      return () => clearTimeout(timerId);
    }
  }, [isFirstLoad, closeLoadingScreen]);

  return (
    <>
      <PixelBackground
        isVisible={isOpen}
        pixelSize={20}
        saturations={[10, 10, 15]}
        variant="scatter"
        className="z-120 inset-0 bg-background"
      />

      <AnimatePresence>
        {!unmountBackdrop ? (
          !isReady ? (
            <LoadingBar
              onComplete={() => {
                setIsReady(true);
              }}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              variants={{
                visible: { opacity: 1, y: 0, transitionDuration: 2 },
                hidden: { opacity: 0, y: "20%" },
              }}
              transition={{
                delayChildren: stagger(0.5),
              }}
              className="fixed inset-0 z-130 flex flex-col items-center justify-center gap-6"
            >
              <motion.div
                variants={{
                  visible: { opacity: 1, y: 0, transitionDuration: 2 },
                  hidden: { opacity: 0, y: "-20%" },
                }}
                transition={{ ease: "easeIn" }}
              >
                <Image
                  width={200}
                  height={80}
                  className="w-32 md:w-64"
                  src="/images/crucible-logo.png"
                  alt="InSpace Crucible"
                />
              </motion.div>

              {isFirstLoad === "true" ? (
                <Content onEnterClick={closeLoadingScreen} />
              ) : null}
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Content(props: { onEnterClick: () => void }) {
  const [showButton, setShowButton] = React.useState(false);

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        className="max-w-[35ch] px-8 md:px-0 text-xs md:text-base select-none text-foreground text-center"
      >
        <RandomText
          viewport={{ once: true }}
          onComplete={() => setShowButton(true)}
        >
          Compete for NGN 400,000 as a team of 2 and the second place of NGN
          200,000. Competition starts on the 1st of August,{" "}
          {new Date().getFullYear()}
        </RandomText>
      </motion.div>

      <div className="h-6" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showButton ? 1 : 0 }}
        className="animate-bounce hover:paused"
      >
        <CTAButton onClick={props.onEnterClick}>Enter The Crucible</CTAButton>
      </motion.div>
    </>
  );
}

function LoadingBar({ onComplete }: { onComplete: () => void }) {
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [competitorsProgress, setCompetitorsProgress] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    let rafId: number;

    // Signal 1: images (3s timeout)
    const progress = (progress: { loaded: number; total: number }) => {
      if (!cancelled) setLoadedCount(progress.loaded);
    };

    const imgLoaded = slideImages.loadImages(progress);
    const imgTimeout = new Promise<void>((r) => setTimeout(r, 3000));
    Promise.race([imgLoaded, imgTimeout]).then(() => {
      if (!cancelled) setLoadedCount(10);
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

  const progress = Math.round((loadedCount / 10) * 50 + competitorsProgress);

  return (
    <motion.div
      exit={{ scale: 0, transition: { duration: 0.2 } }}
      className="pointer-events-none fixed inset-0 z-130 flex items-center justify-center p-24"
    >
      <RetroProgressBar
        progress={progress}
        onAnimationEnd={() => {
          onComplete();
        }}
      />
    </motion.div>
  );
}
