"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CrossReviewWorkspaceViewId } from "@/lib/cross-review/crossRoleReviewWorkspace";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";

interface CrossReviewWorkspaceState {
  selectedMissionId: string | null;
  selectedArtifactId: string | null;
  selectedReviewId: string | null;
  selectedView: CrossReviewWorkspaceViewId;
  selectedRole: HandoffRoleId | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedArtifact: (id: string | null) => void;
  setSelectedReview: (id: string | null) => void;
  setSelectedView: (view: CrossReviewWorkspaceViewId) => void;
  setSelectedRole: (role: HandoffRoleId | null) => void;
}

export const useCrossReviewWorkspaceStore = create<CrossReviewWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedArtifactId: null,
      selectedReviewId: null,
      selectedView: "overview",
      selectedRole: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedArtifact: (id) => set({ selectedArtifactId: id }),
      setSelectedReview: (id) => set({ selectedReviewId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedRole: (role) => set({ selectedRole: role }),
    }),
    {
      name: "productai-review-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedArtifactId: state.selectedArtifactId,
        selectedReviewId: state.selectedReviewId,
        selectedView: state.selectedView,
        selectedRole: state.selectedRole,
      }),
    }
  )
);
