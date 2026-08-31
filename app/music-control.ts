const DEFAULT_TEMPO = 0.8;
const MIN_TEMPO = 0.5;
const MAX_TEMPO = 2;
const FADE = 0.4;
const GAIN = 0.15; // volume
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
  out.close();
  return reversed;
}

type Callback = (value: unknown) => void;
type Status = "loading" | "on" | "off";

export type { Status };
export { DEFAULT_TEMPO, MAX_TEMPO, MIN_TEMPO };

export class MusicControl {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private forward: AudioBuffer | null = null;
  private reversed: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private direction: "forward" | "reverse" = "forward";

  private status: Status = "loading";
  private tempo = DEFAULT_TEMPO;
  private fadeTimer: number | null = null;
  private rafId: number | null = null;
  private bandHeights: number[] = [];
  private barsCount = 5;
  private barRefs = new Map<number, HTMLDivElement>();
  private abortCtrl: AbortController | null = null;
  private listeners = new Map<string, Set<Callback>>();

  on(event: "status" | "tempo", cb: Callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(cb);
  }

  off(event: "status" | "tempo", cb: Callback) {
    this.listeners.get(event)?.delete(cb);
  }

  private emit(event: string, value: unknown) {
    const cbs = this.listeners.get(event);
    if (cbs) for (const cb of cbs) cb(value);
  }

  barRef(i: number) {
    return (el: HTMLDivElement | null) => {
      if (el) this.barRefs.set(i, el);
      else this.barRefs.delete(i);
    };
  }

  setBars(n: number) {
    this.barsCount = n;
    if (this.bandHeights.length !== n) this.bandHeights = Array(n).fill(0);
  }

  async load(src: string) {
    this.abortCtrl?.abort();
    this.abortCtrl = new AbortController();
    const { signal } = this.abortCtrl;

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
    this.ctx = ctx;
    this.gain = gain;
    this.analyser = analyser;

    this.rafId = requestAnimationFrame(this.visualize);

    const onVisibility = () => {
      if (document.hidden) {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
      } else if (analyser && this.rafId === null) {
        this.rafId = requestAnimationFrame(this.visualize);
      }
    };
    document.addEventListener("visibilitychange", onVisibility, { signal });

    try {
      const res = await fetch(src, { signal });
      const arr = await res.arrayBuffer();
      if (signal.aborted) return;
      const forward = await ctx.decodeAudioData(arr);
      if (signal.aborted) return;
      this.forward = forward;
      this.reversed = reverseBuffer(forward);
      this.setStatus("on");
    } catch {
      if (!signal.aborted) console.error("Failed to load music");
    }
  }

  destroy() {
    this.abortCtrl?.abort();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.stopSource();
    this.ctx?.close();
    this.ctx = null;
    this.gain = null;
    this.analyser = null;
    this.forward = null;
    this.reversed = null;
    this.barRefs.clear();
  }

  play() {
    if (!this.ctx) return;
    if (this.fadeTimer) window.clearTimeout(this.fadeTimer);
    this.ctx.resume().then(() => {
      this.setStatus("on");
      this.fadeTo(GAIN);
      if (!this.source) this.start();
    });
  }

  toggle() {
    if (this.status === "off") {
      this.play();
      return;
    }
    if (this.source) {
      this.setStatus("off");
      this.fadeTo(0);
      if (this.fadeTimer) window.clearTimeout(this.fadeTimer);
      this.fadeTimer = window.setTimeout(() => {
        if (this.status !== "on") this.stopSource();
      }, FADE * 1000);
      return;
    }
    this.play();
  }

  setTempo(v: number) {
    this.tempo = v;
    this.emit("tempo", v);
    if (this.source) this.source.playbackRate.value = v;
  }

  private setStatus(s: Status) {
    this.status = s;
    this.emit("status", s);
  }

  private fadeTo(value: number) {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(value, now + FADE);
  }

  private stopSource() {
    if (!this.source) return;
    this.source.onended = null;
    try {
      this.source.stop();
    } catch {}
    this.source.disconnect();
    this.source = null;
  }

  private start() {
    if (!this.ctx || !this.gain || !this.forward || !this.reversed) return;
    this.stopSource();

    const buffer = this.direction === "forward" ? this.forward : this.reversed;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = this.tempo;
    source.connect(this.analyser ?? this.gain);
    this.gain.gain.setValueAtTime(GAIN, this.ctx.currentTime);
    source.onended = () => {
      if (this.status !== "on") return;
      this.direction = this.direction === "forward" ? "reverse" : "forward";
      this.start();
    };
    source.start();
    this.source = source;
  }

  private visualize = () => {
    if (!this.analyser) return;
    const count = this.barsCount;
    if (this.bandHeights.length !== count)
      this.bandHeights = Array(count).fill(0);
    const bins = this.analyser.frequencyBinCount;
    const data = new Uint8Array(bins);
    this.analyser.getByteFrequencyData(data);
    for (let b = 0; b < count; b++) {
      const lo = Math.floor((bins - 1) ** (b / count));
      let hi = Math.floor((bins - 1) ** ((b + 1) / count));
      if (hi <= lo) hi = lo + 1;
      if (hi > bins - 1) hi = bins - 1;
      let sum = 0;
      for (let i = lo; i <= hi; i++) sum += data[i];
      const avg = sum / (hi - lo + 1) / 255;
      const target = Math.min(1, avg * BOOST);
      this.bandHeights[b] = Math.max(target, this.bandHeights[b] * DECAY);
      const el = this.barRefs.get(b);
      if (el) el.style.height = `${this.bandHeights[b] * 100}%`;
    }
    this.rafId = requestAnimationFrame(this.visualize);
  };
}
