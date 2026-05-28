import {
  ADVISORY_LEVELS,
  CONTINUITY_CATEGORIES,
  GOVERNANCE_CATEGORIES,
  REPLAY_CATEGORIES,
  REPLAY_SEVERITIES,
  REPLAY_SOURCES,
  replayTaxonomyFallbacks,
  type AdvisoryLevel,
  type ContinuityCategory,
  type GovernanceCategory,
  type ReplayCategory,
  type ReplaySeverity,
  type ReplaySource,
} from "@/lib/replay-query/replayTaxonomy";
import {
  recordAliasNormalization,
  recordInvalidAdvisory,
  recordInvalidContinuity,
  recordInvalidReplayCategory,
  recordInvalidSeverity,
  recordInvalidSource,
} from "@/lib/replay-query/replayValidationMetrics";

function warnNormalization(field: string, value: unknown, fallback: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `[metadata] Unknown ${field} received (${String(value)}). Falling back to ${fallback} to preserve governance continuity.`
  );
}

function findTaxonomyValue<T extends string>(
  entries: readonly { value: T; aliases?: readonly string[] }[],
  value: unknown
): { value: T; aliasMatched: boolean } | null {
  if (typeof value !== "string") return null;
  const canonical = entries.find((entry) => entry.value === value);
  if (canonical) return { value: canonical.value, aliasMatched: false };
  const alias = entries.find((entry) => entry.aliases?.includes(value));
  if (!alias) return null;
  return { value: alias.value, aliasMatched: true };
}

export function coerceReplayCategory(value: unknown): ReplayCategory {
  const normalized = findTaxonomyValue(REPLAY_CATEGORIES, value);
  if (normalized) return normalized.value;
  recordInvalidReplayCategory();
  if (value != null) warnNormalization("replayCategory", value, "replay_governance");
  return replayTaxonomyFallbacks.replayCategory;
}

export function coerceContinuityCategory(value: unknown): ContinuityCategory {
  const normalized = findTaxonomyValue(CONTINUITY_CATEGORIES, value);
  if (normalized) {
    if (normalized.aliasMatched) recordAliasNormalization();
    return normalized.value;
  }
  recordInvalidContinuity();
  if (value != null) warnNormalization("continuityCategory", value, "continuity_governance");
  return replayTaxonomyFallbacks.continuityCategory;
}

export function coerceReplaySeverity(value: unknown): ReplaySeverity {
  const normalized = findTaxonomyValue(REPLAY_SEVERITIES, value);
  if (normalized) return normalized.value;
  recordInvalidSeverity();
  if (value != null) warnNormalization("replaySeverity", value, "moderate");
  return replayTaxonomyFallbacks.replaySeverity;
}

export function coerceReplaySource(value: unknown): ReplaySource {
  const normalized = findTaxonomyValue(REPLAY_SOURCES, value);
  if (normalized) {
    if (normalized.aliasMatched) recordAliasNormalization();
    return normalized.value;
  }
  recordInvalidSource();
  if (value != null) warnNormalization("replaySource", value, "governance");
  return replayTaxonomyFallbacks.replaySource;
}

export function coerceAdvisoryLevel(value: unknown): AdvisoryLevel {
  const normalized = findTaxonomyValue(ADVISORY_LEVELS, value);
  if (normalized) {
    if (normalized.aliasMatched) recordAliasNormalization();
    return normalized.value;
  }
  recordInvalidAdvisory();
  if (value != null) warnNormalization("advisoryLevel", value, "advisory");
  return replayTaxonomyFallbacks.advisoryLevel;
}

export function coerceGovernanceCategory(value: unknown): GovernanceCategory {
  const normalized = findTaxonomyValue(GOVERNANCE_CATEGORIES, value);
  if (normalized) return normalized.value;
  if (value != null) warnNormalization("governanceCategory", value, "governance_summary");
  return replayTaxonomyFallbacks.governanceCategory;
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
