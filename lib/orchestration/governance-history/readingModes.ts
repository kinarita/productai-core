import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export type GovernanceReadingModeId =
  | "executive_overview"
  | "deep_review"
  | "runtime_continuity"
  | "attention_tracking";

export type GovernanceWorkspacePanelId =
  | "digest"
  | "replay_history"
  | "journals"
  | "comparison"
  | "continuity_memory"
  | "review_sequencing"
  | "diagnostics"
  | "longitudinal";

export interface GovernanceReadingMode {
  id: GovernanceReadingModeId;
  title: string;
  description: string;
  recommendedPanels: GovernanceWorkspacePanelId[];
  recommendedReplayQuery: ReplayQueryState;
  readingFocus: string;
}

function modeQuery(partial: Partial<ReplayQueryState>): ReplayQueryState {
  return mergeReplayQuery(replayQueryDefaults, partial);
}

export const governanceReadingModes: GovernanceReadingMode[] = [
  {
    id: "executive_overview",
    title: "Executive overview",
    description:
      "Continuity summary, governance digest, and replay confidence for organization-wide reading.",
    recommendedPanels: ["digest", "diagnostics", "review_sequencing"],
    recommendedReplayQuery: modeQuery({
      scope: "organization",
      replayWindow: "latest",
      governance: "governance_summary",
    }),
    readingFocus: "continuity summary · governance digest · replay confidence",
  },
  {
    id: "deep_review",
    title: "Deep review",
    description:
      "Interpretation history, journals, review concentration, and continuity shifts for reflective reading.",
    recommendedPanels: ["replay_history", "journals", "longitudinal", "comparison"],
    recommendedReplayQuery: modeQuery({
      scope: "governance_review",
      governance: "review_lifecycle",
      review: "processing_review_required",
      replayWindow: "medium",
    }),
    readingFocus: "interpretation history · journals · review concentration · continuity shifts",
  },
  {
    id: "runtime_continuity",
    title: "Runtime continuity",
    description:
      "Advisory density, runtime continuity signals, and replay diagnostics in observability context.",
    recommendedPanels: ["diagnostics", "comparison", "continuity_memory", "digest"],
    recommendedReplayQuery: modeQuery({
      scope: "runtime",
      continuity: "continuity_runtime",
      governance: "runtime_governance",
      replayWindow: "short",
    }),
    readingFocus: "advisory density · runtime continuity · replay diagnostics",
  },
  {
    id: "attention_tracking",
    title: "Attention tracking",
    description:
      "Decision attention lifecycle, unresolved review themes, and governance memory traceability.",
    recommendedPanels: ["journals", "replay_history", "digest", "review_sequencing"],
    recommendedReplayQuery: modeQuery({
      governanceAttention: "attention",
      governance: "decision_attention",
      replayWindow: "latest",
    }),
    readingFocus: "decision attention lifecycle · unresolved themes · governance memory",
  },
];

export function getGovernanceReadingMode(id: GovernanceReadingModeId): GovernanceReadingMode {
  return (
    governanceReadingModes.find((mode) => mode.id === id) ?? governanceReadingModes[0]
  );
}
