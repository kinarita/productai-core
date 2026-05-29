"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ArtifactLineageViewId } from "@/lib/lineage/artifactLineageWorkspace";

interface ArtifactLineageState {
  selectedMissionId: string | null;
  selectedArtifactId: string | null;
  selectedView: ArtifactLineageViewId;
  setSelectedMission: (id: string | null) => void;
  setSelectedArtifact: (id: string | null) => void;
  setSelectedView: (view: ArtifactLineageViewId) => void;
}

export const useArtifactLineageStore = create<ArtifactLineageState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedArtifactId: null,
      selectedView: "context",
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedArtifact: (id) => set({ selectedArtifactId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-artifact-lineage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedArtifactId: state.selectedArtifactId,
        selectedView: state.selectedView,
      }),
    }
  )
);
