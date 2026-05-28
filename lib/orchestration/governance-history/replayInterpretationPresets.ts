import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export type ReplayInterpretationFocus =
  | "executive_overview"
  | "runtime_continuity"
  | "governance_review"
  | "attention_interpretation";

export interface ReplayInterpretationPreset {
  id: string;
  title: string;
  description: string;
  recommendedReplayQuery: ReplayQueryState;
  interpretationFocus: ReplayInterpretationFocus;
  recommendedAction: string;
}

function presetQuery(partial: Partial<ReplayQueryState>): ReplayQueryState {
  return mergeReplayQuery(replayQueryDefaults, partial);
}

export const replayInterpretationPresets: ReplayInterpretationPreset[] = [
  {
    id: "executive-overview",
    title: "Executive overview",
    description:
      "Read replay visibility, continuity stability, and governance density as an organization-wide interpretation frame.",
    recommendedReplayQuery: presetQuery({
      scope: "organization",
      replayWindow: "latest",
      governance: "governance_summary",
    }),
    interpretationFocus: "executive_overview",
    recommendedAction:
      "Review visibility and completeness before sequencing mission-level governance reading.",
  },
  {
    id: "runtime-continuity",
    title: "Runtime continuity",
    description:
      "Focus on advisory density, runtime instability signals, and recurring continuity patterns in the latest window.",
    recommendedReplayQuery: presetQuery({
      scope: "runtime",
      continuity: "continuity_runtime",
      replayWindow: "short",
      governance: "runtime_governance",
    }),
    interpretationFocus: "runtime_continuity",
    recommendedAction:
      "Interpret runtime signals as observability context—confirm human review before execution posture changes.",
  },
  {
    id: "governance-review",
    title: "Governance review",
    description:
      "Examine review concentration, elevated review density, and unresolved continuity patterns requiring interpretation.",
    recommendedReplayQuery: presetQuery({
      scope: "governance_review",
      governance: "review_lifecycle",
      review: "processing_review_required",
      severity: "elevated",
      replayWindow: "medium",
    }),
    interpretationFocus: "governance_review",
    recommendedAction:
      "Use review concentration to prioritize human judgment sequencing—not automated remediation.",
  },
  {
    id: "attention-interpretation",
    title: "Attention interpretation",
    description:
      "Understand why attention may appear, including governance memory and recommendation-oriented reading paths.",
    recommendedReplayQuery: presetQuery({
      governanceAttention: "attention",
      governance: "decision_attention",
      replayWindow: "latest",
    }),
    interpretationFocus: "attention_interpretation",
    recommendedAction:
      "Trace attention through Organization Feed and Judgment for lifecycle context without initiating execution.",
  },
];

export function getReplayInterpretationPreset(id: string): ReplayInterpretationPreset | undefined {
  return replayInterpretationPresets.find((preset) => preset.id === id);
}
