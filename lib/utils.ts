import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSSR(): boolean {
  return typeof window === "undefined";
}

export const getCssVarInPx = (document: Document, varName: string): number => {
  const rootStyle = getComputedStyle(document.documentElement);
  const rawValue = rootStyle.getPropertyValue(varName)?.trim() || "";

  if (!rawValue) return 0;

  if (rawValue.endsWith("px")) {
    return parseFloat(rawValue) || 0;
  }

  if (rawValue.endsWith("rem")) {
    const rootFontSize = parseFloat(rootStyle.fontSize) || 16;
    return (parseFloat(rawValue) || 0) * rootFontSize;
  }

  // fallback: try to parse whatever value is provided (e.g., number)
  return parseFloat(rawValue) || 0;
};
