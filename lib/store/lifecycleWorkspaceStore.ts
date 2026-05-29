"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductLifecycleStageId, LifecycleWorkspaceViewId } from "@/lib/lifecycle/productLifecycle";

interface LifecycleWorkspaceState {
  selectedMissionId: string | null;
  selectedStage: ProductLifecycleStageId | null;
  selectedView: LifecycleWorkspaceViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedStage: (stage: ProductLifecycleStageId | null) => void;
  setSelectedView: (view: LifecycleWorkspaceViewId) => void;
}

export const useLifecycleWorkspaceStore = create<LifecycleWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedStage: null,
      selectedView: "timeline",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedStage: (stage) => set({ selectedStage: stage }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-lifecycle-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedStage: state.selectedStage,
        selectedView: state.selectedView,
      }),
    }
  )
);
