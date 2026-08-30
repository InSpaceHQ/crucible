export type FadeStrategy =
  | "sweep-time-random"
  | "sweep-ring"
  | "sweep-random-staggered";

export interface PixelGridAnimatorOptions {
  pixelSize?: number;
  baseColor?: string;
  saturations?: [number, number] | [number, number, number];
  variant?: "checkerboard" | "threeWay" | "scatter";
  fadeDuration?: number;
  fadeStrategy?: FadeStrategy;
  cleanupOnExit?: number;
  onHidden?: () => void;
}

interface Square {
  x: number;
  y: number;
  size: number;
  variant: 0 | 1 | 2;
}

const RAMP = 0.3;
const FALLBACK_HSL: [number, number, number] = [230, 80, 50];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function parseRgb(str: string): [number, number, number] | null {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[,\s/]+/).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2]];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function getBaseHsl(baseColor: string): [number, number, number] {
  if (typeof window === "undefined") return FALLBACK_HSL;
  const el = document.createElement("div");
  el.style.color = baseColor;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);
  const rgb = parseRgb(computed);
  if (!rgb) return FALLBACK_HSL;
  return rgbToHsl(rgb[0], rgb[1], rgb[2]);
}

type Variant = "checkerboard" | "threeWay" | "scatter";

function computeCheckerboardVariant(xi: number, yi: number): 0 | 1 {
  return ((xi + yi) % 2) as 0 | 1;
}

function computeThreeWayVariant(xi: number, yi: number): 0 | 1 | 2 {
  return ((xi + yi) % 3) as 0 | 1 | 2;
}

function computeScatterVariant(
  xi: number,
  yi: number,
  colorCount: number,
  scatterMap: Map<string, number>,
): 0 | 1 | 2 {
  const key = `${xi},${yi}`;
  let idx = scatterMap.get(key);
  if (idx === undefined) {
    const len = colorCount || 1;
    idx = Math.floor(Math.random() * len);
    scatterMap.set(key, idx);
  }
  return (idx % (colorCount || 1)) as 0 | 1 | 2;
}

function computeTileVariant(
  variant: Variant,
  xi: number,
  yi: number,
  colorCount: number,
  scatterMap: Map<string, number>,
): 0 | 1 | 2 {
  switch (variant) {
    case "threeWay":
      return computeThreeWayVariant(xi, yi);
    case "scatter":
      return computeScatterVariant(xi, yi, colorCount, scatterMap);
    case "checkerboard":
      return computeCheckerboardVariant(xi, yi);
  }
}

export class PixelGridAnimator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private squares: Square[] = [];
  private starts: number[] = [];
  private colors: string[] = [];
  private scatterMap = new Map<string, number>();
  private rafId: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private phase: "idle" | "showing" | "fading" = "idle";
  private fadeStart = 0;
  private fadeEnd = 0;

  private pixelSize: number;
  private baseColor: string;
  private saturations: number[];
  private variant: "checkerboard" | "threeWay" | "scatter";
  private fadeDuration: number;
  private fadeStrategy: FadeStrategy;
  private cleanupOnExit: number;
  private onHidden?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    options: PixelGridAnimatorOptions = {},
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("PixelGridAnimator: 2d context unavailable");
    this.ctx = ctx;
    this.pixelSize = options.pixelSize ?? 50;
    this.baseColor = options.baseColor ?? "var(--background)";
    this.saturations = options.saturations ?? [-10, -15];
    this.variant = options.variant ?? "checkerboard";
    this.fadeDuration = options.fadeDuration ?? 1.5;
    this.fadeStrategy = options.fadeStrategy ?? "sweep-time-random";
    this.cleanupOnExit = options.cleanupOnExit ?? 0;
    this.onHidden = options.onHidden;
    window.addEventListener("resize", this.handleResize);
  }

  setOptions(partial: PixelGridAnimatorOptions) {
    if (partial.pixelSize !== undefined) this.pixelSize = partial.pixelSize;
    if (partial.baseColor !== undefined) this.baseColor = partial.baseColor;
    if (partial.saturations !== undefined)
      this.saturations = partial.saturations;
    if (partial.variant !== undefined) this.variant = partial.variant;
    if (partial.fadeDuration !== undefined)
      this.fadeDuration = partial.fadeDuration;
    if (partial.fadeStrategy !== undefined)
      this.fadeStrategy = partial.fadeStrategy;
    if (partial.cleanupOnExit !== undefined)
      this.cleanupOnExit = partial.cleanupOnExit;
    if (partial.onHidden !== undefined) this.onHidden = partial.onHidden;
  }

  show() {
    this.cancelAnim();
    this.buildColors();
    this.buildSquares();
    this.drawStatic();
    this.phase = "showing";
  }

  refreshColors() {
    if (this.phase !== "showing") return;
    this.buildColors();
    this.drawStatic();
  }

  hide() {
    this.phase = "fading";
    this.startFade();
  }

  destroy() {
    this.cancelAnim();
    window.removeEventListener("resize", this.handleResize);
    this.squares = [];
    this.starts = [];
    this.scatterMap.clear();
  }

  private cancelAnim() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private effectiveSaturations(): number[] {
    let expected: number;
    if (this.variant === "checkerboard") expected = 2;
    else if (this.variant === "threeWay") expected = 3;
    else expected = Math.min(3, Math.max(2, this.saturations.length));
    const arr = this.saturations.slice(0, expected);
    while (arr.length < expected) arr.push(0);
    if (this.saturations.length !== expected) {
      console.warn(
        `PixelGridAnimator: variant "${this.variant}" expects ${expected} saturations, got ${this.saturations.length}; coerced.`,
      );
    }
    return arr;
  }

  private buildColors() {
    const [h, s, l] = getBaseHsl(this.baseColor);
    this.colors = this.effectiveSaturations().map(
      (sat) => `hsl(${h} ${clamp(s + sat, 0, 100)}% ${l}%)`,
    );
  }

  private buildSquares() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const hgt = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(hgt * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${hgt}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const squares: Square[] = [];
    for (let y = 0; y < hgt; y += this.pixelSize) {
      for (let x = 0; x < w; x += this.pixelSize) {
        const xi = (x / this.pixelSize) | 0;
        const yi = (y / this.pixelSize) | 0;
        const variant = computeTileVariant(
          this.variant,
          xi,
          yi,
          this.colors.length,
          this.scatterMap,
        );
        squares.push({ x, y, size: this.pixelSize, variant });
      }
    }
    this.squares = squares;
  }

  private drawStatic() {
    const w = window.innerWidth;
    const hgt = window.innerHeight;
    this.ctx.clearRect(0, 0, w, hgt);
    this.ctx.globalAlpha = 1;
    for (const sq of this.squares) {
      this.ctx.fillStyle = this.colors[sq.variant];
      this.ctx.fillRect(sq.x, sq.y, sq.size, sq.size);
    }
  }

  private computeTimeRandomStarts(n: number): number[] {
    const out = new Array<number>(n);
    for (let i = 0; i < n; i++) out[i] = Math.random() * this.fadeDuration;
    return out;
  }

  private computeRandomStaggeredStarts(n: number): number[] {
    const windowSec = Math.max(0.001, this.fadeDuration - RAMP);
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order.map((_, i) => (i / order.length) * windowSec);
  }

  private computeRingStarts(): number[] {
    const windowSec = Math.max(0.001, this.fadeDuration - RAMP);
    const origins: [number, number][] = [
      [0, 0],
      [window.innerWidth, 0],
      [0, window.innerHeight],
      [window.innerWidth, window.innerHeight],
      [window.innerWidth / 2, window.innerHeight / 2],
    ];
    const o = origins[Math.floor(Math.random() * origins.length)];
    const dist = this.squares.map((sq) =>
      Math.hypot(sq.x + sq.size / 2 - o[0], sq.y + sq.size / 2 - o[1]),
    );
    let maxD = 0;
    for (const d of dist) if (d > maxD) maxD = d;
    return dist.map((d) => (d / (maxD || 1)) * windowSec);
  }

  private computeFadeStarts(): number[] {
    const n = this.squares.length;
    switch (this.fadeStrategy) {
      case "sweep-random-staggered":
        return this.computeRandomStaggeredStarts(n);
      case "sweep-ring":
        return this.computeRingStarts();
      default:
        return this.computeTimeRandomStarts(n);
    }
  }

  private startFade() {
    const n = this.squares.length;
    if (n === 0) {
      this.scheduleUnmount();
      return;
    }
    this.starts = this.computeFadeStarts();
    this.fadeEnd = 0;
    for (let i = 0; i < n; i++)
      this.fadeEnd = Math.max(this.fadeEnd, this.starts[i] + RAMP);

    this.fadeStart = performance.now();
    const frame = (now: number) => {
      const t = (now - this.fadeStart) / 1000;
      const w = window.innerWidth;
      const hgt = window.innerHeight;
      this.ctx.clearRect(0, 0, w, hgt);
      for (let i = 0; i < n; i++) {
        const alpha = 1 - clamp((t - this.starts[i]) / RAMP, 0, 1);
        if (alpha <= 0) continue;
        const sq = this.squares[i];
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = this.colors[sq.variant];
        this.ctx.fillRect(sq.x, sq.y, sq.size, sq.size);
      }
      this.ctx.globalAlpha = 1;
      if (t < this.fadeEnd) {
        this.rafId = requestAnimationFrame(frame);
      } else {
        this.rafId = null;
        this.scheduleUnmount();
      }
    };
    this.rafId = requestAnimationFrame(frame);
  }

  private scheduleUnmount() {
    const minCleanup =
      this.cleanupOnExit > 0 ? Math.max(5, this.cleanupOnExit) : 0;
    const delay = Math.max(0, minCleanup - this.fadeDuration) * 1000;
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.onHidden?.();
    }, delay);
  }

  private handleResize = () => {
    if (this.phase === "showing") {
      this.buildSquares();
      this.drawStatic();
    } else if (this.phase === "fading") {
      const old = this.starts;
      this.buildSquares();
      this.starts = this.squares.map((_, i) => old[i] ?? 0);
      this.fadeEnd = 0;
      for (let i = 0; i < this.starts.length; i++) {
        this.fadeEnd = Math.max(this.fadeEnd, this.starts[i] + RAMP);
      }
    } else {
      this.buildSquares();
    }
  };
}
