import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";

export interface ContinuityMapNode {
  id: string;
  kind: "interpretation" | "journal" | "attention" | "continuity";
  label: string;
  at: string;
  detail: string;
  continuityCategory?: string;
}

export interface GovernanceContinuityMap {
  nodes: ContinuityMapNode[];
  flowSummary: string;
  reviewConcentrationLabel: string;
  attentionLifecycleLabel: string;
}

export function buildGovernanceContinuityMap(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
}): GovernanceContinuityMap {
  const nodes: ContinuityMapNode[] = [];

  for (const record of [...input.interpretations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )) {
    nodes.push({
      id: record.id,
      kind: "interpretation",
      label: `${record.scope} · ${record.window}`,
      at: record.createdAt,
      detail: record.summary,
      continuityCategory: record.continuityStability,
    });
  }

  for (const journal of [...input.journals].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )) {
    nodes.push({
      id: journal.id,
      kind: journal.relatedAttentionId ? "attention" : "journal",
      label: journal.title,
      at: journal.createdAt,
      detail: journal.humanInterpretation.slice(0, 140),
      continuityCategory: journal.continuityCategory,
    });
  }

  const elevated = input.interpretations.filter(
    (r) => r.continuityStability === "elevated_review"
  ).length;
  const attentionCount = input.journals.filter((j) => j.relatedAttentionId).length;

  return {
    nodes: nodes.slice(-16),
    flowSummary:
      nodes.length >= 2
        ? `Continuity map spans ${nodes.length} recorded points from ${nodes[0].at.slice(0, 10)} to ${nodes[nodes.length - 1].at.slice(0, 10)}—read as flow, not isolated events.`
        : "Record interpretations and journals to visualize governance continuity as a flow.",
    reviewConcentrationLabel:
      elevated > 0
        ? `${elevated} interpretation(s) noted elevated review continuity.`
        : "No elevated review concentration in the map window.",
    attentionLifecycleLabel:
      attentionCount > 0
        ? `${attentionCount} journal-linked attention theme(s) present.`
        : "Attention lifecycle not yet linked in journals.",
  };
}
