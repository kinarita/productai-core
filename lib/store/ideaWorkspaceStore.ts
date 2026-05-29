"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IdeaWorkspaceViewId, IdeaStateId } from "@/lib/idea/ideaWorkspace";

interface IdeaWorkspaceState {
  selectedIdeaId: string | null;
  selectedView: IdeaWorkspaceViewId;
  selectedStatus: IdeaStateId | null;
  selectedProductBrief: boolean;
  setSelectedIdea: (id: string | null) => void;
  setSelectedView: (view: IdeaWorkspaceViewId) => void;
  setSelectedStatus: (status: IdeaStateId | null) => void;
  setSelectedProductBrief: (selected: boolean) => void;
}

export const useIdeaWorkspaceStore = create<IdeaWorkspaceState>()(
  persist(
    (set) => ({
      selectedIdeaId: null,
      selectedView: "canvas",
      selectedStatus: null,
      selectedProductBrief: true,
      setSelectedIdea: (id) => set({ selectedIdeaId: id }),
      setSelectedView: (view) => set({ selectedView: view }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),
      setSelectedProductBrief: (selected) => set({ selectedProductBrief: selected }),
    }),
    {
      name: "productai-idea-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedIdeaId: state.selectedIdeaId,
        selectedView: state.selectedView,
        selectedStatus: state.selectedStatus,
        selectedProductBrief: state.selectedProductBrief,
      }),
    }
  )
);
