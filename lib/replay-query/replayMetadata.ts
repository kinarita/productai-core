import type { OrganizationFeedItem } from "@/types/productai";
import { replayTaxonomyFallbacks } from "@/lib/replay-query/replayTaxonomy";
import { validateReplayMetadata } from "@/lib/replay-query/replayValidation";

export interface ReplayMetadata {
  governanceCategory: NonNullable<OrganizationFeedItem["governanceCategory"]>;
  replayCategory: NonNullable<OrganizationFeedItem["replayCategory"]>;
  continuityCategory: NonNullable<OrganizationFeedItem["continuityCategory"]>;
  advisoryLevel: NonNullable<OrganizationFeedItem["advisoryLevel"]>;
  replayTags: NonNullable<OrganizationFeedItem["replayTags"]>;
  replaySeverity: NonNullable<OrganizationFeedItem["replaySeverity"]>;
  replaySource: NonNullable<OrganizationFeedItem["replaySource"]>;
}

const defaults: Required<ReplayMetadata> = {
  governanceCategory: replayTaxonomyFallbacks.governanceCategory,
  replayCategory: replayTaxonomyFallbacks.replayCategory,
  continuityCategory: replayTaxonomyFallbacks.continuityCategory,
  advisoryLevel: replayTaxonomyFallbacks.advisoryLevel,
  replayTags: [],
  replaySeverity: replayTaxonomyFallbacks.replaySeverity,
  replaySource: replayTaxonomyFallbacks.replaySource,
};

export function resolveReplaySeverity(input: {
  advisoryLevel?: ReplayMetadata["advisoryLevel"];
  governanceCategory?: ReplayMetadata["governanceCategory"];
}): ReplayMetadata["replaySeverity"] {
  if (input.governanceCategory === "governance_review") return "moderate";
  if (input.advisoryLevel === "advisory_elevated" || input.advisoryLevel === "elevated") return "elevated";
  if (
    input.advisoryLevel === "advisory_moderate" ||
    input.advisoryLevel === "advisory" ||
    input.advisoryLevel === "advisory_low" ||
    input.advisoryLevel === "informational"
  )
    return "moderate";
  return "moderate";
}

export function buildReplayMetadata(partial: ReplayMetadata): ReplayMetadata {
  const merged = normalizeReplayMetadata(partial);
  return {
    ...merged,
    replaySeverity:
      merged.replaySeverity ??
      resolveReplaySeverity({
        advisoryLevel: merged.advisoryLevel,
        governanceCategory: merged.governanceCategory,
      }),
  };
}

export function normalizeReplayMetadata(partial?: Partial<OrganizationFeedItem>): ReplayMetadata {
  const validated = validateReplayMetadata(partial ?? {});
  return {
    governanceCategory: validated.governanceCategory ?? defaults.governanceCategory,
    replayCategory: validated.replayCategory ?? defaults.replayCategory,
    continuityCategory: validated.continuityCategory ?? defaults.continuityCategory,
    advisoryLevel: validated.advisoryLevel ?? defaults.advisoryLevel,
    replayTags: validated.replayTags ?? defaults.replayTags,
    replaySeverity:
      validated.replaySeverity ??
      resolveReplaySeverity({
        advisoryLevel: validated.advisoryLevel,
        governanceCategory: validated.governanceCategory,
      }),
    replaySource: validated.replaySource ?? defaults.replaySource,
  };
}
