import { buildNarrativeSummary, type NarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

export interface ExecutiveGovernanceNarrative {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  timeWindow: string;
  continuityTheme: string;
  visibilityTrend: string;
  reviewTheme: string;
  attentionTheme: string;
  relatedInterpretations: string[];
  relatedJournals: string[];
  relatedDigests: string[];
}

export function createGovernanceNarrative(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  narrativeSummary: NarrativeSummary;
  digestGeneratedAt?: string;
}): ExecutiveGovernanceNarrative {
  const sorted = [...input.interpretations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  const timeWindow =
    sorted.length >= 2
      ? `${sorted[0].createdAt.slice(0, 10)} → ${sorted[sorted.length - 1].createdAt.slice(0, 10)}`
      : sorted[0]?.createdAt.slice(0, 10) ?? "current session";

  const visibilityTrend =
    sorted.length >= 2
      ? `Visibility ${sorted[0].visibilityScore} → ${sorted[sorted.length - 1].visibilityScore}`
      : sorted[0]
        ? `Visibility ${sorted[0].visibilityScore}`
        : "Not yet recorded";

  const attentionTheme =
    input.journals.find((j) => j.relatedAttentionId)?.title ??
    input.narrativeSummary.attentionContext.slice(0, 100);

  return {
    id: `narrative-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    title: input.narrativeSummary.title,
    summary: input.narrativeSummary.summary,
    timeWindow,
    continuityTheme: input.narrativeSummary.continuityTheme,
    visibilityTrend,
    reviewTheme: input.narrativeSummary.reviewFocus,
    attentionTheme,
    relatedInterpretations: input.interpretations.map((r) => r.id).slice(0, 12),
    relatedJournals: input.journals.map((j) => j.id).slice(0, 12),
    relatedDigests: input.digestGeneratedAt ? [input.digestGeneratedAt] : [],
  };
}

export function buildGovernanceNarrativeFromRecords(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  digestGeneratedAt?: string;
}): ExecutiveGovernanceNarrative {
  const narrativeSummary = buildNarrativeSummary({
    interpretations: input.interpretations,
    journals: input.journals,
  });
  return createGovernanceNarrative({
    ...input,
    narrativeSummary,
  });
}
