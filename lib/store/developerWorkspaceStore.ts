"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeveloperWorkspaceViewId } from "@/lib/developer/developerWorkspace";
import type { DevelopmentReadinessStateId } from "@/lib/developer/developerWorkspace";

interface DeveloperWorkspaceState {
  selectedMissionId: string | null;
  selectedImplementationPlanId: string | null;
  selectedView: DeveloperWorkspaceViewId;
  selectedReviewState: DevelopmentReadinessStateId | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedImplementationPlan: (id: string | null) => void;
  setSelectedView: (view: DeveloperWorkspaceViewId) => void;
  setSelectedReviewState: (state: DevelopmentReadinessStateId | null) => void;
}

export const useDeveloperWorkspaceStore = create<DeveloperWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedImplementationPlanId: null,
      selectedView: "context",
      selectedReviewState: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedImplementationPlan: (id) => set({ selectedImplementationPlanId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
    }),
    {
      name: "productai-developer-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedImplementationPlanId: state.selectedImplementationPlanId,
        selectedView: state.selectedView,
        selectedReviewState: state.selectedReviewState,
      }),
    }
  )
);
