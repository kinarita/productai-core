"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DesignerWorkspaceViewId } from "@/lib/designer/designerWorkspace";
import type { DesignReviewStateId } from "@/lib/designer/designerWorkspace";

interface DesignerWorkspaceState {
  selectedMissionId: string | null;
  selectedUserFlowId: string | null;
  selectedDesignSpecificationId: string | null;
  selectedView: DesignerWorkspaceViewId;
  selectedReviewState: DesignReviewStateId | null;
  setSelectedMission: (id: string | null) => void;
  setSelectedUserFlow: (id: string | null) => void;
  setSelectedDesignSpecification: (id: string | null) => void;
  setSelectedView: (view: DesignerWorkspaceViewId) => void;
  setSelectedReviewState: (state: DesignReviewStateId | null) => void;
}

export const useDesignerWorkspaceStore = create<DesignerWorkspaceState>()(
  persist(
    (set) => ({
      selectedMissionId: null,
      selectedUserFlowId: null,
      selectedDesignSpecificationId: null,
      selectedView: "context",
      selectedReviewState: null,
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedUserFlow: (id) => set({ selectedUserFlowId: id }),
      setSelectedDesignSpecification: (id) => set({ selectedDesignSpecificationId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedReviewState: (state) => set({ selectedReviewState: state }),
    }),
    {
      name: "productai-designer-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMissionId: state.selectedMissionId,
        selectedUserFlowId: state.selectedUserFlowId,
        selectedDesignSpecificationId: state.selectedDesignSpecificationId,
        selectedView: state.selectedView,
        selectedReviewState: state.selectedReviewState,
      }),
    }
  )
);
