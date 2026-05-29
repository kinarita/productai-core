"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildGovernanceNarrativeFromRecords,
  type ExecutiveGovernanceNarrative,
} from "@/lib/orchestration/governance-history/governanceNarratives";
import {
  buildActiveReviewJourney,
  type ExecutiveReviewJourney,
} from "@/lib/orchestration/governance-history/reviewJourney";
import { buildNarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import type { GovernanceStoryModeId } from "@/lib/orchestration/governance-history/storyModes";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

interface GovernanceNarrativeState {
  narratives: ExecutiveGovernanceNarrative[];
  journeys: ExecutiveReviewJourney[];
  activeStoryMode: GovernanceStoryModeId;
  activeJourneyId: string | null;
  setActiveStoryMode: (mode: GovernanceStoryModeId) => void;
  setActiveJourney: (id: string | null) => void;
  saveNarrative: (input: {
    interpretations: ReplayInterpretationRecord[];
    journals: GovernanceJournalEntry[];
    digestGeneratedAt?: string;
  }) => ExecutiveGovernanceNarrative;
  saveJourney: (input: {
    interpretations: ReplayInterpretationRecord[];
    journals: GovernanceJournalEntry[];
  }) => ExecutiveReviewJourney;
  removeNarrative: (id: string) => void;
  clearNarratives: () => void;
}

const MAX_NARRATIVES = 24;
const MAX_JOURNEYS = 12;

export const useGovernanceNarrativeStore = create<GovernanceNarrativeState>()(
  persist(
    (set) => ({
      narratives: [],
      journeys: [],
      activeStoryMode: "summary_story",
      activeJourneyId: null,
      setActiveStoryMode: (mode) => set({ activeStoryMode: mode }),
      setActiveJourney: (id) => set({ activeJourneyId: id }),
      saveNarrative: (input) => {
        const narrative = buildGovernanceNarrativeFromRecords(input);
        set((state) => ({
          narratives: [narrative, ...state.narratives].slice(0, MAX_NARRATIVES),
        }));
        return narrative;
      },
      saveJourney: (input) => {
        const summary = buildNarrativeSummary({
          interpretations: input.interpretations,
          journals: input.journals,
        });
        const journey = buildActiveReviewJourney({ ...input, narrativeSummary: summary });
        set((state) => ({
          journeys: [journey, ...state.journeys].slice(0, MAX_JOURNEYS),
          activeJourneyId: journey.id,
        }));
        return journey;
      },
      removeNarrative: (id) =>
        set((state) => ({ narratives: state.narratives.filter((n) => n.id !== id) })),
      clearNarratives: () => set({ narratives: [], journeys: [], activeJourneyId: null }),
    }),
    {
      name: "productai-governance-narratives",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        narratives: state.narratives,
        journeys: state.journeys,
        activeStoryMode: state.activeStoryMode,
        activeJourneyId: state.activeJourneyId,
      }),
    }
  )
);
