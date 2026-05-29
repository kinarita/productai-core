"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DecisionThemeId } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import type { AtlasViewId } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";

interface DecisionMemoryAtlasState {
  selectedTheme: DecisionThemeId | null;
  selectedNodeId: string | null;
  activeAtlasView: AtlasViewId;
  lastViewedTheme: DecisionThemeId | null;
  setSelectedTheme: (theme: DecisionThemeId | null) => void;
  setSelectedNode: (id: string | null) => void;
  setActiveAtlasView: (view: AtlasViewId) => void;
  markThemeViewed: (theme: DecisionThemeId) => void;
  clearSelection: () => void;
}

export const useDecisionMemoryAtlasStore = create<DecisionMemoryAtlasState>()(
  persist(
    (set) => ({
      selectedTheme: null,
      selectedNodeId: null,
      activeAtlasView: "summary",
      lastViewedTheme: null,
      setSelectedTheme: (theme) =>
        set((state) => ({
          selectedTheme: theme,
          lastViewedTheme: theme ?? state.lastViewedTheme,
          activeAtlasView: theme ? "themes" : "summary",
        })),
      setSelectedNode: (id) =>
        set({ selectedNodeId: id, activeAtlasView: id ? "inspector" : "summary" }),
      setActiveAtlasView: (view) => set({ activeAtlasView: view }),
      markThemeViewed: (theme) => set({ lastViewedTheme: theme, selectedTheme: theme }),
      clearSelection: () => set({ selectedTheme: null, selectedNodeId: null }),
    }),
    {
      name: "productai-decision-memory-atlas",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedTheme: state.selectedTheme,
        selectedNodeId: state.selectedNodeId,
        activeAtlasView: state.activeAtlasView,
        lastViewedTheme: state.lastViewedTheme,
      }),
    }
  )
);
