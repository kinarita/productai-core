"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ArchitectWorkspaceViewId } from "@/lib/architect/architectWorkspace";
import type { ArchitectureReviewStateId } from "@/lib/architect/architectWorkspace";

interface ArchitectWorkspaceState {
  selectedMissionId: string | null;
  selectedSpecificationId: string | null;
  selectedView: ArchitectWorkspaceViewId;
  selectedReviewState: ArchitectureReviewStateId | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedSpecification: (id: string | null) => void;
  setSelectedView: (view: ArchitectWorkspaceViewId) => void;
  setSelectedReviewState: (state: ArchitectureReviewStateId | null) => void;
}

export const useArchitectWorkspaceStore = create<ArchitectWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedSpecificationId: null,
      selectedView: "context",
      selectedReviewState: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedSpecification: (id) => set({ selectedSpecificationId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
    }),
    {
      name: "productai-architect-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedSpecificationId: state.selectedSpecificationId,
        selectedView: state.selectedView,
        selectedReviewState: state.selectedReviewState,
      }),
    }
  )
);
