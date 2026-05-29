import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export interface GovernanceJournalEntry {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  relatedReplayQuery: ReplayQueryState;
  relatedMissionId?: string;
  relatedAttentionId?: string;
  continuityCategory: string;
  reviewContext: string;
  humanInterpretation: string;
  recommendedFollowup?: string;
  continuityFocusTags?: string[];
  digestContext?: string;
  comparisonNote?: string;
}

export function createGovernanceJournalEntry(input: {
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
}): GovernanceJournalEntry {
  return {
    id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    title: input.title,
    summary: input.summary,
    relatedReplayQuery: input.relatedReplayQuery,
    relatedMissionId: input.relatedMissionId,
    relatedAttentionId: input.relatedAttentionId,
    continuityCategory: input.continuityCategory ?? "continuity_review",
    reviewContext:
      input.reviewContext ??
      "Executive governance review context recorded by a human reviewer.",
    humanInterpretation: input.humanInterpretation,
    recommendedFollowup: input.recommendedFollowup,
    continuityFocusTags: input.continuityFocusTags,
    digestContext: input.digestContext,
    comparisonNote: input.comparisonNote,
  };
}
