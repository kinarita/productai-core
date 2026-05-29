import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { NarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";

export interface ExecutiveReviewJourney {
  id: string;
  title: string;
  startedAt: string;
  recentThemes: string[];
  recentInterpretations: string[];
  recentJournals: string[];
  continuityFocus: string;
  nextSuggestedReading: string;
}

export function createReviewJourney(input: {
  title: string;
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  narrativeSummary: NarrativeSummary;
}): ExecutiveReviewJourney {
  const themes = [
    ...new Set(
      input.journals
        .flatMap((j) => j.continuityFocusTags ?? [])
        .concat(input.narrativeSummary.continuityTheme.split(" ").slice(0, 3))
    ),
  ].filter(Boolean);

  return {
    id: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    startedAt: new Date().toISOString(),
    recentThemes: themes.slice(0, 8),
    recentInterpretations: input.interpretations.map((r) => r.id).slice(0, 12),
    recentJournals: input.journals.map((j) => j.id).slice(0, 12),
    continuityFocus: input.narrativeSummary.continuityTheme,
    nextSuggestedReading:
      input.interpretations[0]?.reviewFocus ??
      "Continue governance reading with advisory sequencing—no automated routing.",
  };
}

export function buildActiveReviewJourney(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  narrativeSummary: NarrativeSummary;
}): ExecutiveReviewJourney {
  return createReviewJourney({
    title: `Review journey · ${new Date().toISOString().slice(0, 10)}`,
    ...input,
  });
}
