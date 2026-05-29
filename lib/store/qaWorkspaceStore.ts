"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { QaWorkspaceViewId, QaReviewStateId } from "@/lib/qa/qaWorkspace";

interface QaWorkspaceState {
  selectedMissionId: string | null;
  selectedTestPlanId: string | null;
  selectedView: QaWorkspaceViewId;
  selectedReviewState: QaReviewStateId | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedTestPlan: (id: string | null) => void;
  setSelectedView: (view: QaWorkspaceViewId) => void;
  setSelectedReviewState: (state: QaReviewStateId | null) => void;
}

export const useQaWorkspaceStore = create<QaWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedTestPlanId: null,
      selectedView: "context",
      selectedReviewState: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedTestPlan: (id) => set({ selectedTestPlanId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
    }),
    {
      name: "productai-qa-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedTestPlanId: state.selectedTestPlanId,
        selectedView: state.selectedView,
        selectedReviewState: state.selectedReviewState,
      }),
    }
  )
);

