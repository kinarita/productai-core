"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  emptyReplayContinuityMemory,
  recordReplayContinuityContext,
  type ReplayContinuityMemory,
} from "@/lib/orchestration/governance-history/replayContinuityMemory";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import type { ReplayQueryState, ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

interface ReplayPersonalizationState {
  preferredReplayScope: ReplayScope;
  preferredReplayWindow: ReplayWindow;
  preferredSeverityFocus: string;
  preferredInterpretationPreset: string | null;
  lastReplayView: ReplayQueryState | null;
  continuityMemory: ReplayContinuityMemory;
  readabilityMode: "compact" | "expanded";
  setPreferredReplayScope: (scope: ReplayScope) => void;
  setPreferredReplayWindow: (window: ReplayWindow) => void;
  setPreferredSeverityFocus: (severity: string) => void;
  setPreferredInterpretationPreset: (presetId: string | null) => void;
  setReadabilityMode: (mode: "compact" | "expanded") => void;
  recordReplayView: (query: ReplayQueryState) => void;
  applyPersonalizationToQuery: (query: ReplayQueryState, urlHasOverrides: boolean) => ReplayQueryState;
  resetPersonalization: () => void;
}

const personalizationInitial = {
  preferredReplayScope: replayQueryDefaults.scope,
  preferredReplayWindow: replayQueryDefaults.replayWindow,
  preferredSeverityFocus: "all",
  preferredInterpretationPreset: null as string | null,
  lastReplayView: null as ReplayQueryState | null,
  continuityMemory: emptyReplayContinuityMemory,
  readabilityMode: "compact" as const,
};

export const useReplayPersonalizationStore = create<ReplayPersonalizationState>()(
  persist(
    (set, get) => ({
      ...personalizationInitial,
      setPreferredReplayScope: (scope) => set({ preferredReplayScope: scope }),
      setPreferredReplayWindow: (window) => set({ preferredReplayWindow: window }),
      setPreferredSeverityFocus: (severity) => set({ preferredSeverityFocus: severity }),
      setPreferredInterpretationPreset: (presetId) =>
        set({ preferredInterpretationPreset: presetId }),
      setReadabilityMode: (mode) => set({ readabilityMode: mode }),
      recordReplayView: (query) =>
        set((state) => ({
          lastReplayView: query,
          preferredReplayScope: query.scope,
          preferredReplayWindow: query.replayWindow,
          preferredSeverityFocus:
            query.severity !== "all" ? query.severity : state.preferredSeverityFocus,
          continuityMemory: recordReplayContinuityContext(state.continuityMemory, query),
        })),
      applyPersonalizationToQuery: (query, urlHasOverrides) => {
        if (urlHasOverrides) return query;
        const state = get();
        return mergeReplayQuery(query, {
          scope: state.preferredReplayScope,
          replayWindow: state.preferredReplayWindow,
          severity:
            state.preferredSeverityFocus !== "all"
              ? state.preferredSeverityFocus
              : query.severity,
        });
      },
      resetPersonalization: () => set(personalizationInitial),
    }),
    {
      name: "productai-replay-personalization",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferredReplayScope: state.preferredReplayScope,
        preferredReplayWindow: state.preferredReplayWindow,
        preferredSeverityFocus: state.preferredSeverityFocus,
        preferredInterpretationPreset: state.preferredInterpretationPreset,
        lastReplayView: state.lastReplayView,
        continuityMemory: state.continuityMemory,
        readabilityMode: state.readabilityMode,
      }),
    }
  )
);
