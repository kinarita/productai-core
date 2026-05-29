"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CeoAttentionFilterId,
  CeoCommandCenterViewId,
} from "@/lib/ceo-command/ceoCommandCenterWorkspace";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";

interface CeoCommandCenterState {
  selectedMissionId: string | null;
  selectedView: CeoCommandCenterViewId;
  selectedRole: HandoffRoleId | null;
  selectedAttentionFilter: CeoAttentionFilterId;
  setSelectedMission: (id: string | null) => void;
  setSelectedView: (view: CeoCommandCenterViewId) => void;
  setSelectedRole: (role: HandoffRoleId | null) => void;
  setSelectedAttentionFilter: (filter: CeoAttentionFilterId) => void;
}

export const useCeoCommandCenterStore = create<CeoCommandCenterState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedView: "context",
      selectedRole: null,
      selectedAttentionFilter: "all",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSelectedAttentionFilter: (filter) => set({ selectedAttentionFilter: filter }),
    }),
    {
      name: "productai-ceo-command-center",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedView: state.selectedView,
        selectedRole: state.selectedRole,
        selectedAttentionFilter: state.selectedAttentionFilter,
      }),
    }
  )
);
