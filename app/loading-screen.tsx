"use client";
import { AnimatePresence, motion, stagger } from "framer-motion";
import Image from "next/image";
import React from "react";
import { PixelBackground } from "~/components/creative/pixel-background";
import { RetroProgressBar } from "~/components/creative/retro-progress";
import { CTAButton } from "~/components/cta-button";
import { RandomText } from "~/components/random-text";
import { isDevelopment } from "~/config/constants";
import { isSSR } from "~/lib/utils";
import { useLoadingFlow } from "./use-loading-flow";
import { useLoadingProgress } from "./use-loading-progress";

export const STORAGE_KEY = "crucible::loadingScreen::hide";
export const FIRST_VISIT_KEY = "crucible:firstvisit";

export function LoadingScreen() {
  const [isFirstLoad] = React.useState(() => {
    if (isDevelopment) return "true";
    if (isSSR()) return "true";
    return localStorage.getItem(FIRST_VISIT_KEY) ?? "true";
  });

  const { state, complete, close } = useLoadingFlow(isFirstLoad);

  return (
    <>
      <PixelBackground
        isVisible={state !== "unmounted"}
        pixelSize={20}
        saturations={[10, 10, 15]}
        variant="scatter"
        className="z-120 inset-0 bg-background"
      />

      <AnimatePresence>
        {state !== "unmounted" && (
          <>
            {state === "loading" && <LoadingBar onComplete={complete} />}

            {state === "ready" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
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

                <Content onEnterClick={close} />
              </motion.div>
            )}

            {state === "closing" && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: "20%" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-130 flex flex-col items-center justify-center gap-6"
              >
                <Image
                  width={200}
                  height={80}
                  className="w-32 md:w-64"
                  src="/images/crucible-logo.png"
                  alt="InSpace Crucible"
                />
              </motion.div>
            )}
          </>
        )}
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
  const progress = useLoadingProgress();

  return (
    <motion.div
      exit={{ scale: 0, transition: { duration: 0.2 } }}
      className="pointer-events-none fixed inset-0 z-130 flex items-center justify-center p-24"
    >
      <RetroProgressBar progress={progress} onAnimationEnd={onComplete} />
    </motion.div>
  );
}
