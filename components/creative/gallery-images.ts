import { range } from "effect/Array";
import { ImagePicker } from "./grid-slider-animator";

const images = range(1, 10).map((index) => ({
  url: `/images/gallery-${index}.webp`,
  width: 1000,
  height: 1300,
}));

export const slideImages = new ImagePicker(images);
