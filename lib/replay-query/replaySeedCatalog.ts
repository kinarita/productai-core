import { buildReplayMetadata } from "@/lib/replay-query/replayMetadata";
import { replayCategoryLabels, replayContinuityLabels } from "@/lib/replay-query/replayLabels";
import {
  ADVISORY_LEVELS,
  CONTINUITY_CATEGORIES,
  GOVERNANCE_CATEGORIES,
  REPLAY_CATEGORIES,
  REPLAY_SEVERITIES,
  REPLAY_SOURCES,
} from "@/lib/replay-query/replayTaxonomy";
import type { DecisionAttentionLifecycle, OrganizationFeedItem } from "@/types/productai";
import { missions } from "@/data/mockData";

export const DECISION_ATTENTION_SEED_IDS = [
  "f-attn-generated",
  "f-attn-reviewed",
  "f-attn-resolved",
  "f-attn-deferred",
] as const;

type SeedLifecycle = DecisionAttentionLifecycle;

type AttentionSeedSpec = {
  id: (typeof DECISION_ATTENTION_SEED_IDS)[number];
  lifecycle: SeedLifecycle;
  missionId: string;
  type: OrganizationFeedItem["type"];
  status: OrganizationFeedItem["status"];
  governanceCategory: (typeof GOVERNANCE_CATEGORIES)[number]["value"];
  replayCategory: (typeof REPLAY_CATEGORIES)[number]["value"];
  continuityCategory: (typeof CONTINUITY_CATEGORIES)[number]["value"];
  advisoryLevel: (typeof ADVISORY_LEVELS)[number]["value"];
  replaySeverity: (typeof REPLAY_SEVERITIES)[number]["value"];
  replaySource: (typeof REPLAY_SOURCES)[number]["value"];
  replayTags: string[];
  decisionAttentionSeverity: OrganizationFeedItem["decisionAttentionSeverity"];
  decisionAttentionCategory: string;
  decisionAttentionSource: string;
  decisionAttentionReplayConfidence: OrganizationFeedItem["decisionAttentionReplayConfidence"];
  message: string;
  reason: string;
  timestamp: string;
};

const governanceReview = GOVERNANCE_CATEGORIES.find((e) => e.value === "governance_review")!.value;
const replayReview = REPLAY_CATEGORIES.find((e) => e.value === "replay_review")!.value;

const attentionSeedSpecs: AttentionSeedSpec[] = [
  {
    id: "f-attn-generated",
    lifecycle: "generated",
    missionId: "m-2",
    type: "decision_attention_generated",
    status: "in_review",
    governanceCategory: governanceReview,
    replayCategory: replayReview,
    continuityCategory: "continuity_review",
    advisoryLevel: "advisory",
    replaySeverity: "moderate",
    replaySource: "orchestration",
    replayTags: ["decision_attention", "generated", "executive_review", "replay_seed"],
    decisionAttentionSeverity: "elevated_review",
    decisionAttentionCategory: "executive_review",
    decisionAttentionSource: "diagnostics",
    decisionAttentionReplayConfidence: "moderate",
    message:
      "Executive review attention has been recorded for continuity interpretation. Replay continuity examples are available for governance interpretation.",
    reason: `Review continuity (${replayContinuityLabels.continuity_review}) requires executive interpretation.`,
    timestamp: "1:05 PM",
  },
  {
    id: "f-attn-reviewed",
    lifecycle: "reviewed",
    missionId: "m-1",
    type: "decision_attention_reviewed",
    status: "in_review",
    governanceCategory: governanceReview,
    replayCategory: replayReview,
    continuityCategory: "continuity_governance",
    advisoryLevel: "advisory",
    replaySeverity: "elevated",
    replaySource: "orchestration",
    replayTags: ["decision_attention", "reviewed", "replay_seed"],
    decisionAttentionSeverity: "advisory",
    decisionAttentionCategory: "replay_continuity",
    decisionAttentionSource: "diagnostics",
    decisionAttentionReplayConfidence: "moderate",
    message:
      "Executive review attention was reviewed with replay continuity context. Visibility remains advisory for judgment sequencing.",
    reason: `${replayCategoryLabels.replay_review} context indicates reduced interpretability in the current window.`,
    timestamp: "1:12 PM",
  },
  {
    id: "f-attn-resolved",
    lifecycle: "resolved",
    missionId: "m-3",
    type: "decision_attention_resolved",
    status: "approved",
    governanceCategory: governanceReview,
    replayCategory: replayReview,
    continuityCategory: "continuity_stable",
    advisoryLevel: "informational",
    replaySeverity: "low",
    replaySource: "advisory",
    replayTags: ["decision_attention", "resolved", "continuity", "replay_seed"],
    decisionAttentionSeverity: "informational",
    decisionAttentionCategory: "governance_memory",
    decisionAttentionSource: "memory",
    decisionAttentionReplayConfidence: "high",
    message:
      "Executive review attention was resolved after continuity interpretation. Decision attention context was preserved across replay and feed views.",
    reason: `Historical ${replayCategoryLabels.replay_memory} indicates stable continuity after executive review.`,
    timestamp: "1:20 PM",
  },
  {
    id: "f-attn-deferred",
    lifecycle: "deferred",
    missionId: "m-4",
    type: "decision_attention_deferred",
    status: "pending",
    governanceCategory: governanceReview,
    replayCategory: replayReview,
    continuityCategory: "continuity_advisory",
    advisoryLevel: "advisory",
    replaySeverity: "moderate",
    replaySource: "runtime",
    replayTags: ["decision_attention", "deferred", "replay_seed"],
    decisionAttentionSeverity: "advisory",
    decisionAttentionCategory: "runtime_advisory",
    decisionAttentionSource: "runtime",
    decisionAttentionReplayConfidence: "limited",
    message:
      "Executive review attention was deferred pending additional replay context. Continuity review remains advisory.",
    reason: `${replayContinuityLabels.continuity_runtime} advisories remain active for continuity interpretation.`,
    timestamp: "1:28 PM",
  },
];

export function buildDecisionAttentionSeedPayloads(): Array<
  Omit<OrganizationFeedItem, "id"> & { id: string }
> {
  return attentionSeedSpecs.map((spec) => {
    const mission = missions.find((m) => m.id === spec.missionId);
    const replayMeta = buildReplayMetadata({
      governanceCategory: spec.governanceCategory,
      replayCategory: spec.replayCategory,
      continuityCategory: spec.continuityCategory,
      advisoryLevel: spec.advisoryLevel,
      replaySeverity: spec.replaySeverity,
      replaySource: spec.replaySource,
      replayTags: spec.replayTags,
    });
    return {
      id: spec.id,
      type: spec.type,
      author: "COO",
      authorName: "Nova",
      missionId: spec.missionId,
      missionName: mission?.name ?? spec.missionId,
      message: spec.message,
      timestamp: spec.timestamp,
      status: spec.status,
      ...replayMeta,
      decisionAttentionId: `attention-seed-${spec.lifecycle}`,
      decisionAttentionSeverity: spec.decisionAttentionSeverity,
      decisionAttentionCategory: spec.decisionAttentionCategory,
      decisionAttentionReason: spec.reason,
      decisionAttentionSource: spec.decisionAttentionSource,
      decisionAttentionReplayConfidence: spec.decisionAttentionReplayConfidence,
      decisionAttentionContinuityCategory: spec.continuityCategory,
      decisionAttentionLifecycle: spec.lifecycle,
    };
  });
}
