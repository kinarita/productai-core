"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HandoffRoleId, HandoffWorkspaceViewId } from "@/lib/handoff/handoffWorkflow";

interface HandoffWorkspaceState {
  selectedMissionId: string | null;
  selectedRole: HandoffRoleId | null;
  selectedArtifactId: string | null;
  selectedView: HandoffWorkspaceViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedRole: (role: HandoffRoleId | null) => void;
  setSelectedArtifact: (id: string | null) => void;
  setSelectedView: (view: HandoffWorkspaceViewId) => void;
}

export const useHandoffWorkspaceStore = create<HandoffWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedRole: null,
      selectedArtifactId: null,
      selectedView: "flow",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSelectedArtifact: (id) => set({ selectedArtifactId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-team-handoff",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedRole: state.selectedRole,
        selectedArtifactId: state.selectedArtifactId,
        selectedView: state.selectedView,
      }),
    }
  )
);
