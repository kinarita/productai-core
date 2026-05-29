import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export interface ReviewSequenceStep {
  id: string;
  title: string;
  description: string;
  replayQuery: Partial<ReplayQueryState>;
  rationale: string;
}

export function buildReviewSequenceSteps(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  currentQuery: ReplayQueryState;
}): ReviewSequenceStep[] {
  const steps: ReviewSequenceStep[] = [];

  if (input.interpretations.length > 0) {
    const latest = input.interpretations[0];
    steps.push({
      id: "continue-interpretation",
      title: "Continue prior interpretation context",
      description:
        "Reopen the most recent governance interpretation and compare continuity reading—not automated priority.",
      replayQuery: latest.replayQuery,
      rationale: latest.reviewFocus.slice(0, 160),
    });
  }

  if (input.currentQuery.governanceAttention === "all") {
    steps.push({
      id: "attention-lifecycle",
      title: "Review decision attention lifecycle",
      description:
        "Trace attention-oriented replay context for unresolved review themes.",
      replayQuery: { governanceAttention: "attention", governance: "decision_attention" },
      rationale: "Attention tracking supports human sequencing only.",
    });
  }

  const elevated = input.interpretations.filter(
    (r) => r.continuityStability === "elevated_review"
  );
  if (elevated.length > 0) {
    steps.push({
      id: "review-concentration",
      title: "Revisit review concentration",
      description:
        "Read elevated review density as advisory context for human judgment sequencing.",
      replayQuery: {
        continuity: "continuity_review",
        governance: "review_lifecycle",
        severity: "elevated",
      },
      rationale: `${elevated.length} recent interpretation(s) noted elevated review continuity.`,
    });
  }

  const runtime = input.interpretations.filter((r) => r.scope === "runtime");
  if (runtime.length > 0 || input.currentQuery.scope === "runtime") {
    steps.push({
      id: "runtime-continuity",
      title: "Continue runtime continuity interpretation",
      description:
        "Runtime observability framing for advisory density—no operational automation.",
      replayQuery: { scope: "runtime", continuity: "continuity_runtime" },
      rationale: "Runtime continuity remains interpretive observability.",
    });
  }

  const attentionJournal = input.journals.find((j) => j.relatedAttentionId);
  if (attentionJournal) {
    steps.push({
      id: "journal-attention",
      title: "Resume journal-linked attention theme",
      description: attentionJournal.humanInterpretation.slice(0, 140),
      replayQuery: attentionJournal.relatedReplayQuery,
      rationale: "Human journal context preserved for review continuity.",
    });
  }

  steps.push({
    id: "longitudinal-digest",
    title: "Read governance digest sequence",
    description:
      "Review digest continuity and unresolved themes before opening the next replay scope.",
    replayQuery: { scope: "organization", replayWindow: "latest" },
    rationale: "Digest sequencing is recommendation-only executive reading support.",
  });

  return steps.slice(0, 6);
}
