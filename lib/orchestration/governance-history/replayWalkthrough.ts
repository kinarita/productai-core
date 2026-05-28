import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export type ReplayWalkthroughFocusArea =
  | "visibility"
  | "continuity"
  | "governance_attention"
  | "human_interpretation";

export interface ReplayWalkthroughStep {
  id: string;
  title: string;
  description: string;
  focusArea: ReplayWalkthroughFocusArea;
  recommendedAction: string;
  relatedReplayQuery?: Partial<ReplayQueryState>;
}

export const governanceReplayWalkthroughSteps: ReplayWalkthroughStep[] = [
  {
    id: "replay-visibility",
    title: "Replay visibility",
    description:
      "Replay visibility score, metadata completeness, and replay confidence describe how readable the current governance window is—not operational urgency.",
    focusArea: "visibility",
    recommendedAction:
      "Review visibility and completeness before interpreting continuity concentration in this scope.",
    relatedReplayQuery: { scope: "organization", replayWindow: "latest" },
  },
  {
    id: "continuity-review",
    title: "Continuity review",
    description:
      "Continuity review, advisory density, and replay concentration indicate where governance interpretation may need additional context. They remain advisory signals.",
    focusArea: "continuity",
    recommendedAction:
      "Use continuity and advisory density to prioritize human review sequencing—not automated action.",
    relatedReplayQuery: { continuity: "continuity_review", governance: "review_lifecycle" },
  },
  {
    id: "governance-attention",
    title: "Governance attention",
    description:
      "Decision attention explains why items may need executive interpretation: governance memory, recurring review patterns, and replay-informed context.",
    focusArea: "governance_attention",
    recommendedAction:
      "Trace attention items through Organization Feed and Judgment for lifecycle context.",
    relatedReplayQuery: { governanceAttention: "attention", governance: "decision_attention" },
  },
  {
    id: "human-interpretation",
    title: "Human interpretation",
    description:
      "Replay diagnostics are interpretive governance aids. They do not initiate operational execution.",
    focusArea: "human_interpretation",
    recommendedAction:
      "Confirm human-in-the-loop review before any handoff or execution authorization elsewhere in ProductAI.",
    relatedReplayQuery: { scope: "organization" },
  },
];

export function getWalkthroughStep(id: string): ReplayWalkthroughStep | undefined {
  return governanceReplayWalkthroughSteps.find((step) => step.id === id);
}
