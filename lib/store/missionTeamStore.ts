"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";
import type { MissionWorkflowStageId } from "@/lib/mission-team/missionWorkflow";

export type MissionTeamWorkflowViewId = "overview" | "workflow" | "planning" | "direction" | "roles";

interface MissionTeamState {
  selectedRole: MissionTeamRoleId | null;
  selectedStage: MissionWorkflowStageId | null;
  activeWorkflowView: MissionTeamWorkflowViewId;
  setSelectedRole: (role: MissionTeamRoleId | null) => void;
  setSelectedStage: (stage: MissionWorkflowStageId | null) => void;
  setActiveWorkflowView: (view: MissionTeamWorkflowViewId) => void;
}

export const useMissionTeamStore = create<MissionTeamState>()(
  persist(
    (set) => ({
      selectedRole: null,
      selectedStage: null,
      activeWorkflowView: "overview",
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSelectedStage: (stage) => set({ selectedStage: stage }),
      setActiveWorkflowView: (view) => set({ activeWorkflowView: view }),
    }),
    {
      name: "productai-mission-team",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRole: state.selectedRole,
        selectedStage: state.selectedStage,
        activeWorkflowView: state.activeWorkflowView,
      }),
    }
  )
);
