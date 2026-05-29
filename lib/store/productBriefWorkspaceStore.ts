"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductBriefWorkspaceViewId } from "@/lib/brief/productBriefWorkspace";
import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";

interface ProductBriefWorkspaceState {
  selectedBriefId: string | null;
  selectedMissionId: string | null;
  selectedStatus: ProductBriefStateId | null;
  selectedView: ProductBriefWorkspaceViewId;
  setSelectedBrief: (id: string | null) => void;
  setSelectedMission: (id: string | null) => void;
  setSelectedStatus: (status: ProductBriefStateId | null) => void;
  setSelectedView: (view: ProductBriefWorkspaceViewId) => void;
}

export const useProductBriefWorkspaceStore = create<ProductBriefWorkspaceState>()(
  persist(
    (set) => ({
      selectedBriefId: null,
      selectedMissionId: null,
      selectedStatus: null,
      selectedView: "board",
      setSelectedBrief: (id) => set({ selectedBriefId: id }),
      setSelectedMission: (id) => set({ selectedMissionId: id }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: "productai-product-brief",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedBriefId: state.selectedBriefId,
        selectedMissionId: state.selectedMissionId,
        selectedStatus: state.selectedStatus,
        selectedView: state.selectedView,
      }),
    }
  )
);
