"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { type FadeStrategy, PixelGridAnimator } from "./pixel-grid-animator";

interface PixelBackgroundProps {
  pixelSize?: number;
  isVisible: boolean;
  cleanupOnExit?: number;
  fadeDuration?: number;
  fadeStrategy?: FadeStrategy;
  baseColor?: string;
  variant?: "checkerboard" | "threeWay" | "scatter";
  saturations?: [number, number] | [number, number, number];
  className?: string;
}

export function PixelBackground({
  pixelSize = 50,
  isVisible,
  cleanupOnExit = 0,
  fadeDuration = 1.5,
  fadeStrategy = "sweep-time-random",
  baseColor = "var(--background)",
  variant = "checkerboard",
  saturations,
  className,
}: PixelBackgroundProps) {
  const sat = React.useMemo(
    () =>
      (saturations ?? (variant === "threeWay" ? [-10, -15, 0] : [-10, -15])) as
        | [number, number]
        | [number, number, number],
    [saturations, variant],
  );

  const [mounted, setMounted] = React.useState(true);
  const [isPixelRendered, setPixelRendered] = React.useState(false);

  // if (isVisible && !mounted) setMounted(true);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef<PixelGridAnimator | null>(null);
  const prevColorRef = React.useRef<{
    sat: [number, number] | [number, number, number];
    variant: string;
    baseColor: string;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (mounted && !engineRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      engineRef.current = new PixelGridAnimator(canvas, {
        pixelSize,
        baseColor,
        saturations: sat,
        variant,
        fadeDuration,
        fadeStrategy,
        cleanupOnExit,
        onHidden: () => setMounted(false),
      });
    }

    if (!mounted && engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
  }, [
    mounted,
    pixelSize,
    baseColor,
    sat,
    variant,
    fadeDuration,
    fadeStrategy,
    cleanupOnExit,
  ]);

  React.useLayoutEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isVisible) {
      engine.show();
      setPixelRendered(true);
    } else engine.hide();
  }, [mounted, isVisible]);

  React.useLayoutEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setOptions({
      pixelSize,
      baseColor,
      saturations: sat,
      variant,
      fadeDuration,
      fadeStrategy,
      cleanupOnExit,
    });
    const prev = prevColorRef.current;
    const colorChanged =
      prev &&
      (prev.sat !== sat ||
        prev.variant !== variant ||
        prev.baseColor !== baseColor);
    if (colorChanged) engine.refreshColors();
    prevColorRef.current = { sat, variant, baseColor };
  }, [
    mounted,
    pixelSize,
    baseColor,
    sat,
    variant,
    fadeDuration,
    fadeStrategy,
    cleanupOnExit,
  ]);

  React.useLayoutEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    }
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <div
      className={cn("fixed inset-0", className)}
      style={{
        background: isPixelRendered ? "transparent" : undefined,
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "fixed inset-0 z-50 pointer-events-auto",
          className,
          "bg-transparent",
        )}
      />
    </div>
  );
}
