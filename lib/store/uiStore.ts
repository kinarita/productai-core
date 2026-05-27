import { create } from "zustand";

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
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeMissionId: null,
  selectedDecisionId: null,
  activeFeedFilter: "all",
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveMission: (missionId) => set({ activeMissionId: missionId }),
  setSelectedDecision: (decisionId) => set({ selectedDecisionId: decisionId }),
  setFeedFilter: (filter) => set({ activeFeedFilter: filter }),
}));
