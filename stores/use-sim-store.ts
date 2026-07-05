"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Id } from "~/convex/_generated/dataModel";

interface SimStore {
  lastCompetitionId: Id<"competitions"> | null;
  setLastCompetitionId: (id: Id<"competitions"> | null) => void;
}

export const useSimStore = create<SimStore>()(
  persist(
    (set) => ({
      lastCompetitionId: null,
      setLastCompetitionId: (id) => set({ lastCompetitionId: id }),
    }),
    { name: "sim-store" },
  ),
);
