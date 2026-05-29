"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OutcomeStatusId, OutcomeWorkspaceViewId } from "@/lib/outcome/outcomeWorkspace";

interface OutcomeWorkspaceState {
  selectedMissionId: string | null;
  selectedOutcomeState: OutcomeStatusId | null;
  selectedView: OutcomeWorkspaceViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedOutcomeState: (state: OutcomeStatusId | null) => void;
  setSelectedView: (view: OutcomeWorkspaceViewId) => void;
}

export const useOutcomeWorkspaceStore = create<OutcomeWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedOutcomeState: null,
      selectedView: "board",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedOutcomeState: (state) => set({ selectedOutcomeState: state }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-code-release-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedOutcomeState: state.selectedOutcomeState,
        selectedView: state.selectedView,
      }),
    }
  )
);
