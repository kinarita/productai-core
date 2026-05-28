import type { OrganizationFeedItem } from "@/types/productai";

type AdvisoryLevel = NonNullable<OrganizationFeedItem["advisoryLevel"]>;
type ReplaySource = NonNullable<OrganizationFeedItem["replaySource"]>;
type ReplayCategory = NonNullable<OrganizationFeedItem["replayCategory"]>;
type ContinuityCategory = NonNullable<OrganizationFeedItem["continuityCategory"]>;
type ReplaySeverity = NonNullable<OrganizationFeedItem["replaySeverity"]>;
type GovernanceCategory = NonNullable<OrganizationFeedItem["governanceCategory"]>;

const replayCategorySet = new Set<ReplayCategory>([
  "replay_summary",
  "replay_memory",
  "replay_review",
  "replay_runtime",
  "replay_governance",
  "replay_advisory",
  "replay_timeline",
]);

const continuityCategorySet = new Set<ContinuityCategory>([
  "continuity_stable",
  "continuity_review",
  "continuity_advisory",
  "continuity_runtime",
  "continuity_governance",
  "continuity_replay",
]);

const replaySeveritySet = new Set<ReplaySeverity>(["low", "moderate", "elevated", "critical_review"]);
const replaySourceSet = new Set<ReplaySource>([
  "queue",
  "governance",
  "runtime",
  "replay",
  "memory",
  "orchestration",
  "advisory",
]);
const advisoryLevelSet = new Set<AdvisoryLevel>(["informational", "advisory", "elevated"]);
const governanceCategorySet = new Set<GovernanceCategory>([
  "governance_summary",
  "governance_review",
  "governance_continuity",
  "governance_runtime",
  "governance_processing",
  "governance_replay",
]);

function warnNormalization(field: string, value: unknown, fallback: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `[metadata] Unknown ${field} received (${String(value)}). Falling back to ${fallback} to preserve governance continuity.`
  );
}

export function coerceReplayCategory(value: unknown): ReplayCategory {
  if (typeof value === "string" && replayCategorySet.has(value as ReplayCategory)) {
    return value as ReplayCategory;
  }
  if (value != null) warnNormalization("replayCategory", value, "replay_governance");
  return "replay_governance";
}

export function coerceContinuityCategory(value: unknown): ContinuityCategory {
  if (value === "stable") return "continuity_stable";
  if (value === "degraded") return "continuity_advisory";
  if (typeof value === "string" && continuityCategorySet.has(value as ContinuityCategory)) {
    return value as ContinuityCategory;
  }
  if (value != null) warnNormalization("continuityCategory", value, "continuity_governance");
  return "continuity_governance";
}

export function coerceReplaySeverity(value: unknown): ReplaySeverity {
  if (typeof value === "string" && replaySeveritySet.has(value as ReplaySeverity)) {
    return value as ReplaySeverity;
  }
  if (value != null) warnNormalization("replaySeverity", value, "moderate");
  return "moderate";
}

export function coerceReplaySource(value: unknown): ReplaySource {
  if (value === "runtime_observer") return "runtime";
  if (value === "coo") return "orchestration";
  if (value === "ceo") return "advisory";
  if (value === "system") return "governance";
  if (typeof value === "string" && replaySourceSet.has(value as ReplaySource)) {
    return value as ReplaySource;
  }
  if (value != null) warnNormalization("replaySource", value, "governance");
  return "governance";
}

export function coerceAdvisoryLevel(value: unknown): AdvisoryLevel {
  if (value === "advisory_low") return "informational";
  if (value === "advisory_moderate") return "advisory";
  if (value === "advisory_elevated") return "elevated";
  if (typeof value === "string" && advisoryLevelSet.has(value as AdvisoryLevel)) {
    return value as AdvisoryLevel;
  }
  if (value != null) warnNormalization("advisoryLevel", value, "advisory");
  return "advisory";
}

export function coerceGovernanceCategory(value: unknown): GovernanceCategory {
  if (typeof value === "string" && governanceCategorySet.has(value as GovernanceCategory)) {
    return value as GovernanceCategory;
  }
  if (value != null) warnNormalization("governanceCategory", value, "governance_summary");
  return "governance_summary";
}

export function coerceReplayTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

interface ReplayMetadataInput {
  governanceCategory?: unknown;
  replayCategory?: unknown;
  continuityCategory?: unknown;
  advisoryLevel?: unknown;
  replaySeverity?: unknown;
  replaySource?: unknown;
  replayTags?: unknown;
}

export function validateReplayMetadata(input: ReplayMetadataInput = {}) {
  return {
    governanceCategory: coerceGovernanceCategory(input.governanceCategory),
    replayCategory: coerceReplayCategory(input.replayCategory),
    continuityCategory: coerceContinuityCategory(input.continuityCategory),
    advisoryLevel: coerceAdvisoryLevel(input.advisoryLevel),
    replaySeverity: coerceReplaySeverity(input.replaySeverity),
    replaySource: coerceReplaySource(input.replaySource),
    replayTags: coerceReplayTags(input.replayTags),
  };
}
