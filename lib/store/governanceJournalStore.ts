"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createGovernanceJournalEntry,
  type GovernanceJournalEntry,
} from "@/lib/orchestration/governance-history/governanceJournal";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface GovernanceJournalState {
  entries: GovernanceJournalEntry[];
  addEntry: (input: {
    title: string;
    summary: string;
    relatedReplayQuery: ReplayQueryState;
    humanInterpretation: string;
    continuityCategory?: string;
    reviewContext?: string;
    relatedMissionId?: string;
    relatedAttentionId?: string;
    recommendedFollowup?: string;
    continuityFocusTags?: string[];
    digestContext?: string;
    comparisonNote?: string;
  }) => GovernanceJournalEntry;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
}

const MAX_ENTRIES = 64;

export const useGovernanceJournalStore = create<GovernanceJournalState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (input) => {
        const entry = createGovernanceJournalEntry(input);
        set((state) => ({ entries: [entry, ...state.entries].slice(0, MAX_ENTRIES) }));
        return entry;
      },
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: "productai-governance-journal",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
