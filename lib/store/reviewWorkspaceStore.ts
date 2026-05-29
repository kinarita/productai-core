"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ReviewWorkspaceViewId } from "@/lib/review/artifactReview";
import type { ReviewStateId } from "@/lib/review/reviewStatus";

interface ReviewWorkspaceState {
  selectedArtifactId: string | null;
  selectedMissionId: string | null;
  selectedReviewState: ReviewStateId | null;
  selectedView: ReviewWorkspaceViewId;
  setSelectedArtifact: (id: string | null) => void;
  setSelectedMission: (id: string | null) => void;
  setSelectedReviewState: (state: ReviewStateId | null) => void;
  setSelectedView: (view: ReviewWorkspaceViewId) => void;
}

export const useReviewWorkspaceStore = create<ReviewWorkspaceState>()(
  persist(
    (set) => ({
      selectedArtifactId: null,
      selectedMissionId: null,
      selectedReviewState: null,
      selectedView: "board",
      setSelectedArtifact: (id) => set({ selectedArtifactId: id }),
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-artifact-review",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedArtifactId: state.selectedArtifactId,
        selectedMissionId: state.selectedMissionId,
        selectedReviewState: state.selectedReviewState,
        selectedView: state.selectedView,
      }),
    }
  )
);
