"use client";

import { Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { isDevelopment } from "~/config/constants";
import { STORAGE_KEY } from "./loading-screen";
import {
  DEFAULT_TEMPO,
  MAX_TEMPO,
  MIN_TEMPO,
  MusicControl,
  type Status,
} from "./music-control";

const MUSIC_SRC = "/sound/music.mp3";
const MUSIC_PREF_KEY = "crucible:music:pref";

function clampBars(bars: number) {
  const f = Math.floor(bars);
  const c = Math.max(3, Math.min(f, 10));
  if (c !== f)
    console.warn(`MusicPlayer: bars ${bars} clamped to [3,10] -> ${c}`);
  return c;
}

export function MusicPlayer({
  src = MUSIC_SRC,
  bars = 5,
}: {
  src?: string;
  bars?: number;
}) {
  const ctrl = useRef<MusicControl | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const n = React.useMemo(() => clampBars(bars), [bars]);

  useEffect(
    function loadMedia() {
      const c = new MusicControl();
      ctrl.current = c;
      c.on("status", setStatus);
      c.on("tempo", setTempo);
      c.setBars(n);
      c.load(src);
      return () => {
        c.destroy();
        ctrl.current = null;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(function listenForLoadingScreen() {
    const ac = new AbortController();
    window.addEventListener(
      STORAGE_KEY,
      () => {
        if (localStorage.getItem(MUSIC_PREF_KEY) === "off") return;
        ctrl.current?.play();
      },
      { signal: ac.signal },
    );
    return () => ac.abort();
  }, []);

  const canShowControl = false;
  const barsArray = React.useMemo(
    () => Array.from({ length: n }).map((_, i) => i),
    [n],
  );

  const handleToggle = React.useCallback(() => {
    ctrl.current?.toggle();
    localStorage.setItem(MUSIC_PREF_KEY, status === "on" ? "off" : "on");
  }, [status]);

  return (
    <div data-music-player>
      <button
        type="button"
        className="flex fixed cursor-pointer bottom-3 end-2 z-60 aspect-5/1 w-24 items-center justify-center gap-1"
        onClick={handleToggle}
        aria-pressed={status === "on"}
        disabled={status === "loading"}
      >
        {barsArray.map((i) => {
          return (
            <div
              key={i}
              ref={(ref) => ctrl.current?.barRef(i)?.(ref)}
              className="w-0.5 shrink-0 bg-foreground"
              style={{ minHeight: "4px" }}
            />
          );
        })}
      </button>

      {canShowControl && isDevelopment ? (
        <div className="fixed bottom-12 end-0 z-50 flex flex-col gap-2 border-2 border-foreground bg-background p-3 font-mono text-xs text-foreground">
          <button
            type="button"
            onClick={() => ctrl.current?.toggle()}
            aria-pressed={status === "on"}
            className="inline-flex h-8 items-center justify-center gap-2 border-2 border-foreground px-3 uppercase hover:bg-foreground hover:text-background"
            disabled={status === "loading"}
          >
            {status === "on" ? <Volume2 /> : <VolumeX />}
            {status === "loading"
              ? "Loading"
              : status === "on"
                ? "Music On"
                : "Music Off"}
          </button>

          <label className="flex items-center gap-2 uppercase">
            <span className="tabular-nums">{tempo.toFixed(2)}×</span>
            <input
              type="range"
              min={MIN_TEMPO}
              max={MAX_TEMPO}
              step={0.05}
              value={tempo}
              onChange={(e) =>
                ctrl.current?.setTempo(parseFloat(e.target.value))
              }
              className="w-28 accent-foreground"
              disabled={status === "loading"}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
