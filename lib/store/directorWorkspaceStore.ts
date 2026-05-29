"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DirectorWorkspaceViewId } from "@/lib/director/directorWorkspace";
import type { DirectorReviewScheduleState } from "@/lib/director/directorWorkspace";

interface DirectorWorkspaceState {
  selectedMissionId: string | null;
  selectedBriefId: string | null;
  selectedView: DirectorWorkspaceViewId;
  selectedReviewState: DirectorReviewScheduleState | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedBrief: (id: string | null) => void;
  setSelectedView: (view: DirectorWorkspaceViewId) => void;
  setSelectedReviewState: (state: DirectorReviewScheduleState | null) => void;
}

export const useDirectorWorkspaceStore = create<DirectorWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedBriefId: null,
      selectedView: "context",
      selectedReviewState: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedBrief: (id) => set({ selectedBriefId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
    }),
    {
      name: "productai-director-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedBriefId: state.selectedBriefId,
        selectedView: state.selectedView,
        selectedReviewState: state.selectedReviewState,
      }),
    }
  )
);
