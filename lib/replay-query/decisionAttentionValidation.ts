import type {
  DecisionAttentionLifecycle,
  DecisionAttentionSeverity,
} from "@/types/productai";
import { coerceContinuityCategory } from "@/lib/replay-query/replayValidation";

const DECISION_ATTENTION_SEVERITIES: DecisionAttentionSeverity[] = [
  "informational",
  "advisory",
  "elevated_review",
  "executive_focus",
];

const DECISION_ATTENTION_LIFECYCLES: DecisionAttentionLifecycle[] = [
  "generated",
  "reviewed",
  "resolved",
  "deferred",
];

const REPLAY_CONFIDENCE_LEVELS = ["high", "moderate", "limited"] as const;

function warnNormalization(field: string, value: unknown, fallback: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `[decision-attention] Unknown ${field} (${String(value)}). Falling back to ${fallback}.`
  );
}

export function coerceDecisionAttentionSeverity(value: unknown): DecisionAttentionSeverity | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" && DECISION_ATTENTION_SEVERITIES.includes(value as DecisionAttentionSeverity)) {
    return value as DecisionAttentionSeverity;
  }
  warnNormalization("decisionAttentionSeverity", value, "advisory");
  return "advisory";
}

export function coerceDecisionAttentionLifecycle(
  value: unknown
): DecisionAttentionLifecycle | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" && DECISION_ATTENTION_LIFECYCLES.includes(value as DecisionAttentionLifecycle)) {
    return value as DecisionAttentionLifecycle;
  }
  warnNormalization("decisionAttentionLifecycle", value, "generated");
  return "generated";
}

export function coerceDecisionAttentionReplayConfidence(
  value: unknown
): "high" | "moderate" | "limited" | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" && REPLAY_CONFIDENCE_LEVELS.includes(value as (typeof REPLAY_CONFIDENCE_LEVELS)[number])) {
    return value as "high" | "moderate" | "limited";
  }
  warnNormalization("decisionAttentionReplayConfidence", value, "moderate");
  return "moderate";
}

export interface DecisionAttentionMetadataInput {
  decisionAttentionId?: unknown;
  decisionAttentionSeverity?: unknown;
  decisionAttentionCategory?: unknown;
  decisionAttentionReason?: unknown;
  decisionAttentionSource?: unknown;
  decisionAttentionReplayConfidence?: unknown;
  decisionAttentionContinuityCategory?: unknown;
  decisionAttentionLifecycle?: unknown;
}

export function validateDecisionAttentionMetadata(input: DecisionAttentionMetadataInput = {}) {
  const id =
    typeof input.decisionAttentionId === "string" && input.decisionAttentionId.trim().length > 0
      ? input.decisionAttentionId.trim()
      : undefined;
  const category =
    typeof input.decisionAttentionCategory === "string" && input.decisionAttentionCategory.trim().length > 0
      ? input.decisionAttentionCategory.trim()
      : undefined;
  const reason =
    typeof input.decisionAttentionReason === "string" && input.decisionAttentionReason.trim().length > 0
      ? input.decisionAttentionReason.trim()
      : undefined;
  const source =
    typeof input.decisionAttentionSource === "string" && input.decisionAttentionSource.trim().length > 0
      ? input.decisionAttentionSource.trim()
      : undefined;

  return {
    decisionAttentionId: id,
    decisionAttentionSeverity: coerceDecisionAttentionSeverity(input.decisionAttentionSeverity),
    decisionAttentionCategory: category,
    decisionAttentionReason: reason,
    decisionAttentionSource: source,
    decisionAttentionReplayConfidence: coerceDecisionAttentionReplayConfidence(
      input.decisionAttentionReplayConfidence
    ),
    decisionAttentionContinuityCategory: input.decisionAttentionContinuityCategory
      ? coerceContinuityCategory(input.decisionAttentionContinuityCategory)
      : undefined,
    decisionAttentionLifecycle: coerceDecisionAttentionLifecycle(input.decisionAttentionLifecycle),
  };
}

export function coerceGovernanceAttentionFilter(value: unknown): string {
  if (typeof value !== "string" || value === "all") return "all";
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "all" ||
    normalized === "attention" ||
    normalized === "decision_attention" ||
    normalized === "generated" ||
    normalized === "reviewed" ||
    normalized === "resolved" ||
    normalized === "deferred"
  ) {
    return normalized;
  }
  return "all";
}
