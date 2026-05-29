"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeliveryWorkspaceViewId } from "@/lib/delivery/deliveryWorkspace";
import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";

interface DeliveryWorkspaceState {
  selectedMissionId: string | null;
  selectedTaskId: string | null;
  selectedRole: MissionTeamRoleId | null;
  selectedView: DeliveryWorkspaceViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedTask: (id: string | null) => void;
  setSelectedRole: (role: MissionTeamRoleId | null) => void;
  setSelectedView: (view: DeliveryWorkspaceViewId) => void;
}

export const useDeliveryWorkspaceStore = create<DeliveryWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedTaskId: null,
      selectedRole: null,
      selectedView: "pipeline",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedTask: (id) => set({ selectedTaskId: id }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-delivery-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedTaskId: state.selectedTaskId,
        selectedRole: state.selectedRole,
        selectedView: state.selectedView,
      }),
    }
  )
);
