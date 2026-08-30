"use client";

import { Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { isDevelopment } from "~/config/constants";
import { STORAGE_KEY } from "./loading-screen";

const MUSIC_SRC = "/sound/music.mp3";
const DEFAULT_TEMPO = 0.8;
const MIN_TEMPO = 0.5;
const MAX_TEMPO = 2;
const FADE = 0.4;
const GAIN = 1;
const BOOST = 1.4;
const DECAY = 0.85;

function reverseBuffer(buffer: AudioBuffer): AudioBuffer {
  const out = new AudioContext();
  const reversed = out.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
  );
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    reversed.getChannelData(c).set(src.slice().reverse());
  }
  return reversed;
}

type Status = "loading" | "on" | "off";

// single source of truth that is both reactive and readable inside audio callbacks
function useRefState<T>(initial: T) {
  const ref = useRef(initial);
  const [state, setState] = useState(initial);
  const set = (value: T) => {
    ref.current = value;
    setState(value);
  };
  return [state, set, ref] as const;
}

export function MusicPlayer({
  src = MUSIC_SRC,
  bars = 5,
}: {
  src?: string;
  bars?: number;
}) {
  const [status, setStatus, statusRef] = useRefState<Status>("loading");
  const [tempo, setTempo, tempoRef] = useRefState(DEFAULT_TEMPO);

  const canShowControl = false;

  const n = (() => {
    const f = Math.floor(bars);
    const c = Math.max(3, Math.min(f, 10));
    if (c !== f)
      console.warn(`MusicPlayer: bars ${bars} clamped to [3,10] -> ${c}`);
    return c;
  })();

  const audio = useRef({
    ctx: null as AudioContext | null,
    gain: null as GainNode | null,
    analyser: null as AnalyserNode | null,
    forward: null as AudioBuffer | null,
    reversed: null as AudioBuffer | null,
    source: null as AudioBufferSourceNode | null,
    direction: "forward" as "forward" | "reverse",
  });
  const fadeTimer = useRef<number | null>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const bandHeights = useRef<number[]>([]);
  const barsRef = useRef(n);
  useEffect(() => {
    barsRef.current = n;
  }, [n]);

  function fadeTo(value: number) {
    const { ctx, gain } = audio.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(value, now + FADE);
  }

  function stopSource() {
    const s = audio.current.source;
    if (!s) return;
    s.onended = null;
    try {
      s.stop();
    } catch {
      // already stopped
    }
    s.disconnect();
    audio.current.source = null;
  }

  function start() {
    const { ctx, gain, forward, reversed, direction } = audio.current;
    if (!ctx || !gain || !forward || !reversed) return;

    stopSource();

    const buffer = direction === "forward" ? forward : reversed;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = tempoRef.current;
    source.connect(audio.current.analyser ?? gain);
    gain.gain.setValueAtTime(GAIN, ctx.currentTime);
    source.onended = () => {
      if (statusRef.current !== "on") return;
      audio.current.direction =
        audio.current.direction === "forward" ? "reverse" : "forward";
      start();
    };
    source.start();
    audio.current.source = source;
  }

  function visualize() {
    const { analyser } = audio.current;
    if (!analyser) return;
    const count = barsRef.current;
    if (bandHeights.current.length !== count)
      bandHeights.current = Array(count).fill(0);
    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);
    analyser.getByteFrequencyData(data);
    for (let b = 0; b < count; b++) {
      const lo = Math.floor((bins - 1) ** (b / count));
      let hi = Math.floor((bins - 1) ** ((b + 1) / count));
      if (hi <= lo) hi = lo + 1;
      if (hi > bins - 1) hi = bins - 1;
      let sum = 0;
      for (let i = lo; i <= hi; i++) sum += data[i];
      const avg = sum / (hi - lo + 1) / 255;
      const target = Math.min(1, avg * BOOST);
      bandHeights.current[b] = Math.max(target, bandHeights.current[b] * DECAY);
      const el = barRefs.current[b];
      if (el) el.style.height = `${bandHeights.current[b] * 100}%`;
    }
    rafRef.current = requestAnimationFrame(visualize);
  }

  function play() {
    const ctx = audio.current.ctx;
    if (!ctx) return;
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    ctx.resume().then(() => {
      setStatus("on");
      fadeTo(GAIN);
      if (!audio.current.source) start();
    });
  }

  function toggle() {
    if (status === "off") {
      play();
      return;
    }
    // status === "on"
    if (audio.current.source) {
      setStatus("off");
      fadeTo(0);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => {
        if (statusRef.current !== "on") stopSource();
      }, FADE * 1000);
      return;
    }
    // intent-on but never actually started (pre-gesture) -> start now
    play();
  }

  function onTempo(v: number) {
    setTempo(v);
    if (audio.current.source) audio.current.source.playbackRate.value = v;
  }

  React.useEffect(function loadMedia() {
    const audioRef = audio.current;

    const ac = new AbortController();
    const { signal } = ac;

    async function load() {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      gain.connect(ctx.destination);
      analyser.connect(gain);
      audioRef.ctx = ctx;
      audioRef.gain = gain;
      audioRef.analyser = analyser;

      rafRef.current = requestAnimationFrame(visualize);

      const onVisibility = () => {
        if (document.hidden) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        } else if (analyser && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(visualize);
        }
      };
      document.addEventListener("visibilitychange", onVisibility, { signal });

      try {
        const res = await fetch(src, { signal });
        const arr = await res.arrayBuffer();
        if (signal.aborted) return;
        const forward = await ctx.decodeAudioData(arr);
        if (signal.aborted) return;
        audioRef.forward = forward;
        audioRef.reversed = reverseBuffer(forward);
        setStatus("on");
      } catch {
        if (!signal.aborted) console.error("Failed to load music");
        return;
      }
    }

    load();
    return () => {
      ac.abort();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopSource();
      audioRef.ctx?.close();
    };
  }, []);

  React.useEffect(
    function listenForLoadingScreen() {
      const ac = new AbortController();

      window.addEventListener(
        STORAGE_KEY,
        () => play(),
        { signal: ac.signal },
      );

      return () => ac.abort()
    },
    [play],
  );

  return (
    <div data-music-player>
      <button
        type="button"
        className="flex fixed cursor-pointer bottom-3 end-2 z-60 aspect-5/1 w-24 items-center justify-center gap-1"
        onClick={toggle}
        aria-pressed={status === "on"}
        disabled={status === "loading"}
      >
        {Array.from({ length: n }, (_, i) => {
          return (
            <div
              key={i}
              ref={(el) => {
                barRefs.current[i] = el;
              }}
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
            onClick={toggle}
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
              onChange={(e) => onTempo(parseFloat(e.target.value))}
              className="w-28 accent-foreground"
              disabled={status === "loading"}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
