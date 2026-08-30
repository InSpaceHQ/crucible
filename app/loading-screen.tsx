"use client"
import { motion, stagger } from "framer-motion";
import Image from "next/image";
import React from "react";
import { PixelBackground } from "~/components/creative/pixel-background";
import { CTAButton } from "~/components/cta-button";
import { RandomText } from "~/components/random-text";
import { isDevelopment } from "~/config/constants";

export const STORAGE_KEY = "crucible::loadingScreen::hide";
const FIRST_VISIT_KEY = "crucible:firstvisit";

export function LoadingScreen() {
  const [isFirstLoad] = React.useState(
    () => {
      if (isDevelopment) return "true";

      return localStorage.getItem(FIRST_VISIT_KEY) ?? "true";
    },
  );

  const [isOpen, setIsOpen] = React.useState(() => isFirstLoad === "true");

  const closeLoadingScreen = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent(STORAGE_KEY));
    localStorage.setItem(FIRST_VISIT_KEY, "false");
    setIsOpen(false);
  }, [])

  React.useEffect(() => {
    if (!isFirstLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      closeLoadingScreen()
    }
  }, [isFirstLoad, closeLoadingScreen]);

  return (
    <>
      <PixelBackground
        isVisible={isOpen}
        pixelSize={20}
        saturations={[10, 59, 0]}
        variant="scatter"
        className="z-120"
      />

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
            className="w-64"
            src="/images/crucible-logo.png"
            alt="InSpace Crucible"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="max-w-[35ch] select-none text-foreground text-center"
        >
          <RandomText
            text={`Compete for NGN 400,000 as a team of 2 and the second place of NGN 200,000. Competition starts on the 1st of August, ${new Date().getFullYear()}`}
          />
        </motion.div>

        <div className="h-6" />

        <motion.div className="animate-bounce hover:paused">
          <CTAButton onClick={closeLoadingScreen}>
            Enter The Crucible
          </CTAButton>
        </motion.div>
      </motion.div>
    </>
  );
}
