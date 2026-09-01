import { animate } from "motion/react";
import { Array as Arr, Chunk, Effect, Number as Numer, pipe } from "effect";
import { safeStr } from "~/lib/data.helper";
import { range } from "effect/Array";
import { choice, shuffle } from "effect/Random";
import { clamp } from "effect/Order";

export type Media = {
  url: string;
  width?: number;
  height?: number;
};

export class GridSliderAnimation {
  enterDuration: number = 1;

  constructor(
    public params: {
      root: () => HTMLElement;
      images: Media[];
      transitionDelay?: number;
      enterDuration?: number;
    },
  ) {
    console.assert(
      params.images.length > 0,
      "[SlideOne] At least one image must be provided",
    );
    this.enterDuration = params.enterDuration ?? 1;
  }

  make(entry: { url: string }) {
    const img_el = document.createElement("img");

    const enterDuration = this.enterDuration;

    const HIDE = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
    const SHOW = "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)";
    const HIDE_UP = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";

    img_el.src = safeStr(entry.url);
    img_el.style.clipPath = HIDE;

    img_el.style.position = "absolute";
    img_el.style.top = "0px";
    img_el.style.left = "0px";

    return {
      el: img_el,

      enter(style = {}, option = {}) {
        return animate(
          img_el,
          {
            ...style,
            clipPath: SHOW,
          },
          {
            duration: enterDuration,
            // delay: index * 0.15,
            ease: "backOut",
            ...option,
          },
        );
      },

      exit(style = {}, option = {}) {
        return animate(
          img_el,
          {
            ...style,
            clipPath: HIDE_UP,
          },
          {
            duration: enterDuration,
            onComplete: () => {
              img_el.style.clipPath = HIDE;
            },
            ...option,
          },
        );
      },
    };
  }

  async loadImages() {
    const mms = pipe(
      this.params.images,
      Arr.map((entry) => {
        if (!entry.url) return null;
        return this.make({ url: entry.url });
      }),
      Arr.filter((e) => e !== null),
    );

    const promises = mms.map((entry) => {
      return new Promise<typeof entry>((res) => {
        entry.el.addEventListener("load", () => {
          res(entry);
        });
      });
    });

    return (await Promise.allSettled(promises))
      .filter((e) => e.status === "fulfilled")
      .map((e) => e.value);
  }

  async start() {
    const { transitionDelay = 1, root } = this.params;
    const mms = await this.loadImages();
    const root_ = root();

    // root_.style.position = "relative";

    for await (const m of mms) {
      if (!m) {
        continue;
      }

      root_.appendChild(m.el);
      await delay(transitionDelay * 1000);
      await m.enter();
    }
  }

  async close() {
    const images = this.params.root().querySelectorAll("img");

    if (!images) return;
    if (images.length < 1) return;

    const lastImage = images[images.length - 1];

    for (const image of images) {
      if (image !== lastImage) {
        animate(
          image,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          {
            duration: 0.4,
            onComplete: () => {
              image.remove();
            },
          },
        );
      }
    }

    await animate(
      lastImage,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        duration: 0.4,
        delay: 0.12,
        onComplete: () => {
          lastImage.remove();
        },
      },
    );
  }
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class ImageRandomizer {
  private images: Media[];

  constructor(images: Media[]) {
    this.images = pipe(shuffle(images), Effect.runSync, Chunk.toArray);
  }

  randomTake(limit: number = 3) {
    const totalImages = this.images;
    const randomImages = choice(totalImages);
    const collected = new Set<Media>();

    const getRandom = (): Media => {
      const next = Effect.runSync(randomImages);

      if (limit > totalImages.length) return next;

      if (!collected.has(next)) {
        return next;
      }

      return getRandom();
    };

    return range(1, limit).map(() => getRandom());
  }
}

export const RandomInt = {
  randomBetween(min: number, max: number) {
    const value = Math.floor(Math.random() * max);
    return clamp(Numer.Order)({ minimum: min, maximum: max })(value);
  },

  random(count: number) {
    return RandomInt.randomBetween(0, count);
  },
};
