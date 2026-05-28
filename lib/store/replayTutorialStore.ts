"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ReplayScope } from "@/lib/replay-query/replayQueryTypes";

interface ReplayTutorialState {
  dismissed: boolean;
  completedSteps: string[];
  lastViewedReplayScope: ReplayScope | null;
  setDismissed: (dismissed: boolean) => void;
  markStepCompleted: (stepId: string) => void;
  setLastViewedReplayScope: (scope: ReplayScope) => void;
  resetTutorial: () => void;
}

const replayTutorialInitial = {
  dismissed: false,
  completedSteps: [] as string[],
  lastViewedReplayScope: null as ReplayScope | null,
};

export const useReplayTutorialStore = create<ReplayTutorialState>()(
  persist(
    (set) => ({
      ...replayTutorialInitial,
      setDismissed: (dismissed) => set({ dismissed }),
      markStepCompleted: (stepId) =>
        set((state) => {
          if (state.completedSteps.includes(stepId)) return state;
          return { completedSteps: [...state.completedSteps, stepId] };
        }),
      setLastViewedReplayScope: (scope) => set({ lastViewedReplayScope: scope }),
      resetTutorial: () => set(replayTutorialInitial),
    }),
    {
      name: "productai-replay-tutorial",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dismissed: state.dismissed,
        completedSteps: state.completedSteps,
        lastViewedReplayScope: state.lastViewedReplayScope,
      }),
    }
  )
);
