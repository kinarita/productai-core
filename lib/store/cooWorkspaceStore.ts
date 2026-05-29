"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CooPipelineStageId, CooWorkspaceViewId } from "@/lib/coo/cooWorkspace";

interface CooWorkspaceState {
  selectedMissionId: string | null;
  selectedStage: CooPipelineStageId | null;
  selectedView: CooWorkspaceViewId;
  selectedRecommendationId: string | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedStage: (stage: CooPipelineStageId | null) => void;
  setSelectedView: (view: CooWorkspaceViewId) => void;
  setSelectedRecommendation: (id: string | null) => void;
}

export const useCooWorkspaceStore = create<CooWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedStage: null,
      selectedView: "pipeline",
      selectedRecommendationId: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedStage: (stage) => set({ selectedStage: stage }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedRecommendation: (id) => set({ selectedRecommendationId: id }),
    }),
    {
      name: "productai-coo-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedStage: state.selectedStage,
        selectedView: state.selectedView,
        selectedRecommendationId: state.selectedRecommendationId,
      }),
    }
  )
);
