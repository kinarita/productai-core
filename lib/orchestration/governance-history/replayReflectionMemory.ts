import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

export interface ReplayReflectionObservation {
  id: string;
  theme: string;
  observation: string;
  supportCount: number;
}

export function deriveReplayReflectionObservations(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
}): ReplayReflectionObservation[] {
  const observations: ReplayReflectionObservation[] = [];

  const runtimeCount = input.interpretations.filter((r) => r.scope === "runtime").length;
  if (runtimeCount >= 2) {
    observations.push({
      id: "recurring-runtime",
      theme: "Recurring runtime interpretation",
      observation:
        "Runtime continuity has been interpreted multiple times in recent sessions. Use comparison to read shifts—not automated remediation.",
      supportCount: runtimeCount,
    });
  }

  const elevatedReview = input.interpretations.filter(
    (r) => r.continuityStability === "elevated_review"
  ).length;
  if (elevatedReview >= 2) {
    observations.push({
      id: "elevated-review-focus",
      theme: "Repeated elevated review focus",
      observation:
        "Elevated review continuity appeared in multiple interpretation records. Sequencing remains human-led.",
      supportCount: elevatedReview,
    });
  }

  const limitedConfidence = input.interpretations.filter((r) => r.replayConfidence === "limited").length;
  if (limitedConfidence >= 2) {
    observations.push({
      id: "visibility-degradation",
      theme: "Replay visibility degradation trend",
      observation:
        "Limited replay confidence was noted across recent interpretations. Treat as advisory reading context.",
      supportCount: limitedConfidence,
    });
  }

  const advisoryDense = input.interpretations.filter(
    (r) => r.continuityStability === "advisory_dense"
  ).length;
  if (advisoryDense >= 2) {
    observations.push({
      id: "continuity-drift",
      theme: "Continuity drift observation",
      observation:
        "Advisory-dense continuity readings recurred. Compare scopes to support reflective governance review.",
      supportCount: advisoryDense,
    });
  }

  const attentionJournals = input.journals.filter((j) => j.relatedAttentionId).length;
  if (attentionJournals >= 1) {
    observations.push({
      id: "attention-themes",
      theme: "Unresolved attention themes",
      observation:
        "Governance journals reference decision attention context. Follow up through Feed and Judgment for lifecycle traceability.",
      supportCount: attentionJournals,
    });
  }

  return observations.slice(0, 6);
}
