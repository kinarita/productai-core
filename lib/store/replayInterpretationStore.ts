"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createReplayInterpretationRecord,
  type ReplayInterpretationRecord,
} from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ReplayInterpretationState {
  records: ReplayInterpretationRecord[];
  comparisonLeftId: string | null;
  comparisonRightId: string | null;
  recordInterpretation: (input: {
    replayQuery: ReplayQueryState;
    diagnostics: ReplayDiagnostics;
    interpretationPreset?: string | null;
    summary?: string;
    reviewFocus?: string;
  }) => ReplayInterpretationRecord;
  removeRecord: (id: string) => void;
  setComparisonLeft: (id: string | null) => void;
  setComparisonRight: (id: string | null) => void;
  clearRecords: () => void;
}

const MAX_RECORDS = 48;

export const useReplayInterpretationStore = create<ReplayInterpretationState>()(
  persist(
    (set) => ({
      records: [],
      comparisonLeftId: null,
      comparisonRightId: null,
      recordInterpretation: (input) => {
        const record = createReplayInterpretationRecord(input);
        set((state) => ({
          records: [record, ...state.records].slice(0, MAX_RECORDS),
        }));
        return record;
      },
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          comparisonLeftId: state.comparisonLeftId === id ? null : state.comparisonLeftId,
          comparisonRightId: state.comparisonRightId === id ? null : state.comparisonRightId,
        })),
      setComparisonLeft: (id) => set({ comparisonLeftId: id }),
      setComparisonRight: (id) => set({ comparisonRightId: id }),
      clearRecords: () => set({ records: [], comparisonLeftId: null, comparisonRightId: null }),
    }),
    {
      name: "productai-replay-interpretation-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        records: state.records,
        comparisonLeftId: state.comparisonLeftId,
        comparisonRightId: state.comparisonRightId,
      }),
    }
  )
);
