"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GovernanceKnowledgeGraphState {
  selectedNodeId: string | null;
  explorerFilter: string;
  lastViewedAt: string | null;
  setSelectedNode: (id: string | null) => void;
  setExplorerFilter: (filter: string) => void;
  markViewed: () => void;
  clearSelection: () => void;
}

export const useGovernanceKnowledgeGraphStore = create<GovernanceKnowledgeGraphState>()(
  persist(
    (set) => ({
      selectedNodeId: null,
      explorerFilter: "all",
      lastViewedAt: null,
      setSelectedNode: (id) => set({ selectedNodeId: id, lastViewedAt: new Date().toISOString() }),
      setExplorerFilter: (filter) => set({ explorerFilter: filter }),
      markViewed: () => set({ lastViewedAt: new Date().toISOString() }),
      clearSelection: () => set({ selectedNodeId: null }),
    }),
    {
      name: "productai-governance-graph",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedNodeId: state.selectedNodeId,
        explorerFilter: state.explorerFilter,
        lastViewedAt: state.lastViewedAt,
      }),
    }
  )
);
