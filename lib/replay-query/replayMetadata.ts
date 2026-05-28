import type { OrganizationFeedItem } from "@/types/productai";

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
  governanceCategory: "governance_summary",
  replayCategory: "replay_timeline",
  continuityCategory: "continuity_stable",
  advisoryLevel: "advisory_low",
  replayTags: [],
  replaySeverity: "low",
  replaySource: "system",
};

export function resolveReplaySeverity(input: {
  advisoryLevel?: ReplayMetadata["advisoryLevel"];
  governanceCategory?: ReplayMetadata["governanceCategory"];
}): ReplayMetadata["replaySeverity"] {
  if (input.governanceCategory === "governance_review") return "moderate";
  if (input.advisoryLevel === "advisory_elevated") return "elevated";
  if (input.advisoryLevel === "advisory_moderate") return "moderate";
  return "low";
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
  return {
    governanceCategory: partial?.governanceCategory ?? defaults.governanceCategory,
    replayCategory: partial?.replayCategory ?? defaults.replayCategory,
    continuityCategory: partial?.continuityCategory ?? defaults.continuityCategory,
    advisoryLevel: partial?.advisoryLevel ?? defaults.advisoryLevel,
    replayTags: partial?.replayTags ?? defaults.replayTags,
    replaySeverity:
      partial?.replaySeverity ??
      resolveReplaySeverity({
        advisoryLevel: partial?.advisoryLevel,
        governanceCategory: partial?.governanceCategory,
      }),
    replaySource: partial?.replaySource ?? defaults.replaySource,
  };
}
