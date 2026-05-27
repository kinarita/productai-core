import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uiStoreInitial } from "@/lib/store/initialState";

export type FeedFilter = "all" | "approvals" | "escalations" | "implementation";

interface UiState {
  sidebarCollapsed: boolean;
  activeMissionId: string | null;
  selectedDecisionId: string | null;
  activeFeedFilter: FeedFilter;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveMission: (missionId: string | null) => void;
  setSelectedDecision: (decisionId: string | null) => void;
  setFeedFilter: (filter: FeedFilter) => void;
  resetToInitial: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      ...uiStoreInitial,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveMission: (missionId) => set({ activeMissionId: missionId }),
      setSelectedDecision: (decisionId) => set({ selectedDecisionId: decisionId }),
      setFeedFilter: (filter) => set({ activeFeedFilter: filter }),
      resetToInitial: () => set({ ...uiStoreInitial }),
    }),
    {
      name: "productai-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeMissionId: state.activeMissionId,
        selectedDecisionId: state.selectedDecisionId,
        activeFeedFilter: state.activeFeedFilter,
      }),
    }
  )
);
