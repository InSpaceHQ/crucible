import type { Id } from "~/convex/_generated/dataModel";

export type ViewProfileDetail = {
  id: Id<"players">;
  profile: {
    name: string;
    teamName: string;
    teamLogo: string;
    gameName: string;
    kills: number;
    wins: number;
    matches: number;
  };
};

const bus = new EventTarget();

const VIEW_PROFILE = "view-profile";

export function emitViewProfile(detail: ViewProfileDetail) {
  bus.dispatchEvent(new CustomEvent(VIEW_PROFILE, { detail }));
}

export function onViewProfile(handler: (detail: ViewProfileDetail) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<ViewProfileDetail>).detail);
  bus.addEventListener(VIEW_PROFILE, listener);
  return () => bus.removeEventListener(VIEW_PROFILE, listener);
}
