"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ReleaseReadinessLevelId, ReleaseWorkspaceViewId } from "@/lib/release/releaseWorkspace";

interface ReleaseWorkspaceState {
  selectedMissionId: string | null;
  selectedReleaseState: ReleaseReadinessLevelId | null;
  selectedView: ReleaseWorkspaceViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedReleaseState: (level: ReleaseReadinessLevelId | null) => void;
  setSelectedView: (view: ReleaseWorkspaceViewId) => void;
}

export const useReleaseWorkspaceStore = create<ReleaseWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedReleaseState: null,
      selectedView: "board",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedReleaseState: (level) => set({ selectedReleaseState: level }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-release-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedReleaseState: state.selectedReleaseState,
        selectedView: state.selectedView,
      }),
    }
  )
);
