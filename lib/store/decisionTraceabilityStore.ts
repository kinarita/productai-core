"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TraceabilityViewId } from "@/lib/orchestration/governance-history/decisionTraceability";

interface DecisionTraceabilityState {
  selectedPathwayId: string | null;
  selectedNodeId: string | null;
  activeTraceabilityView: TraceabilityViewId;
  lastViewedPathway: string | null;
  setSelectedPathway: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  setActiveTraceabilityView: (view: TraceabilityViewId) => void;
  markPathwayViewed: (id: string) => void;
  clearSelection: () => void;
}

export const useDecisionTraceabilityStore = create<DecisionTraceabilityState>()(
  persist(
    (set) => ({
      selectedPathwayId: null,
      selectedNodeId: null,
      activeTraceabilityView: "summary",
      lastViewedPathway: null,
      setSelectedPathway: (id) =>
        set((state) => ({
          selectedPathwayId: id,
          lastViewedPathway: id ?? state.lastViewedPathway,
          activeTraceabilityView: id ? "paths" : "summary",
        })),
      setSelectedNode: (id) =>
        set({ selectedNodeId: id, activeTraceabilityView: id ? "inspector" : "summary" }),
      setActiveTraceabilityView: (view) => set({ activeTraceabilityView: view }),
      markPathwayViewed: (id) => set({ lastViewedPathway: id, selectedPathwayId: id }),
      clearSelection: () => set({ selectedPathwayId: null, selectedNodeId: null }),
    }),
    {
      name: "productai-decision-traceability",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedPathwayId: state.selectedPathwayId,
        selectedNodeId: state.selectedNodeId,
        activeTraceabilityView: state.activeTraceabilityView,
        lastViewedPathway: state.lastViewedPathway,
      }),
    }
  )
);
