import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export type ReplayExampleFocusCategory =
  | "runtime_continuity"
  | "governance_concentration"
  | "advisory_pattern"
  | "review_density"
  | "executive_overview";

export interface ReplayExample {
  id: string;
  title: string;
  description: string;
  replayQuery: ReplayQueryState;
  recommendedInterpretation: string;
  focusCategory: ReplayExampleFocusCategory;
  drilldownPath: "/runtime-cost" | "/organization-feed" | "/ceo-home" | "/judgment";
}

function exampleQuery(partial: Partial<ReplayQueryState>): ReplayQueryState {
  return mergeReplayQuery(replayQueryDefaults, partial);
}

export const replayExampleLibrary: ReplayExample[] = [
  {
    id: "runtime-continuity-review",
    title: "Runtime continuity review",
    description:
      "Inspect runtime-derived continuity signals and provider health context within the latest replay window.",
    replayQuery: exampleQuery({
      scope: "runtime",
      continuity: "continuity_runtime",
      replayWindow: "latest",
    }),
    recommendedInterpretation:
      "Treat runtime continuity as observability context. Confirm human review before changing execution posture.",
    focusCategory: "runtime_continuity",
    drilldownPath: "/runtime-cost",
  },
  {
    id: "governance-concentration",
    title: "Governance concentration",
    description:
      "Review governance review lifecycle concentration and replay review categories in the current scope.",
    replayQuery: exampleQuery({
      governance: "review_lifecycle",
      replayWindow: "medium",
      scope: "governance_review",
    }),
    recommendedInterpretation:
      "Concentration indicates interpretive focus areas—not automated remediation.",
    focusCategory: "governance_concentration",
    drilldownPath: "/organization-feed",
  },
  {
    id: "recurring-advisory-pattern",
    title: "Recurring advisory pattern",
    description:
      "Explore advisory-elevated continuity and memory-linked governance patterns across the organization feed.",
    replayQuery: exampleQuery({
      continuity: "continuity_advisory",
      advisory: "advisory",
      governanceAttention: "attention",
    }),
    recommendedInterpretation:
      "Recurring advisories support continuity interpretation; they do not trigger autonomous governance.",
    focusCategory: "advisory_pattern",
    drilldownPath: "/organization-feed",
  },
  {
    id: "elevated-review-density",
    title: "Elevated review density",
    description:
      "Examine elevated severity and review-required processing context for executive sequencing.",
    replayQuery: exampleQuery({
      severity: "elevated",
      review: "processing_review_required",
      scope: "mission",
    }),
    recommendedInterpretation:
      "Review density guides prioritization for human judgment—not system-initiated execution.",
    focusCategory: "review_density",
    drilldownPath: "/runtime-cost",
  },
  {
    id: "executive-replay-overview",
    title: "Executive replay overview",
    description:
      "Organization-wide replay scope with decision attention visibility for CEO-level continuity reading.",
    replayQuery: exampleQuery({
      scope: "organization",
      governanceAttention: "decision_attention",
      replayWindow: "latest",
    }),
    recommendedInterpretation:
      "Use as an executive reading frame. Replay diagnostics support continuity interpretation across governance workflows.",
    focusCategory: "executive_overview",
    drilldownPath: "/ceo-home",
  },
];

export function getReplayExample(id: string): ReplayExample | undefined {
  return replayExampleLibrary.find((example) => example.id === id);
}
