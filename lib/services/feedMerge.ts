import type { OrganizationFeedItem } from "@/types/productai";

function parseUpdatedAt(value?: string): number | null {
  if (!value) return null;
  const n = Date.parse(value);
  return Number.isNaN(n) ? null : n;
}

export function shouldPreferRemoteFeedItem(localUpdatedAt?: string, remoteUpdatedAt?: string): boolean {
  if (!remoteUpdatedAt) return false;
  const localTs = parseUpdatedAt(localUpdatedAt);
  const remoteTs = parseUpdatedAt(remoteUpdatedAt);
  if (remoteTs === null) return false;
  if (localTs === null) return true;
  return remoteTs >= localTs;
}

function coalesceField<T>(primary: T | undefined | null, fallback: T | undefined | null): T | undefined {
  if (primary !== undefined && primary !== null && primary !== "") return primary;
  if (fallback !== undefined && fallback !== null && fallback !== "") return fallback;
  return undefined;
}

/**
 * Merges local and remote feed items while preserving replay and decision attention metadata.
 */
export function mergeOrganizationFeedItem(
  local: OrganizationFeedItem,
  remote: OrganizationFeedItem
): OrganizationFeedItem {
  const preferRemote = shouldPreferRemoteFeedItem(local.timestamp, remote.timestamp);
  const primary = preferRemote ? remote : local;
  const fallback = preferRemote ? local : remote;

  return {
    ...fallback,
    ...primary,
    governanceCategory: coalesceField(primary.governanceCategory, fallback.governanceCategory),
    replayCategory: coalesceField(primary.replayCategory, fallback.replayCategory),
    continuityCategory: coalesceField(primary.continuityCategory, fallback.continuityCategory),
    advisoryLevel: coalesceField(primary.advisoryLevel, fallback.advisoryLevel),
    replaySeverity: coalesceField(primary.replaySeverity, fallback.replaySeverity),
    replaySource: coalesceField(primary.replaySource, fallback.replaySource),
    replayTags: primary.replayTags?.length ? primary.replayTags : fallback.replayTags,
    decisionAttentionId: coalesceField(primary.decisionAttentionId, fallback.decisionAttentionId),
    decisionAttentionSeverity: coalesceField(
      primary.decisionAttentionSeverity,
      fallback.decisionAttentionSeverity
    ),
    decisionAttentionCategory: coalesceField(
      primary.decisionAttentionCategory,
      fallback.decisionAttentionCategory
    ),
    decisionAttentionReason: coalesceField(primary.decisionAttentionReason, fallback.decisionAttentionReason),
    decisionAttentionSource: coalesceField(primary.decisionAttentionSource, fallback.decisionAttentionSource),
    decisionAttentionReplayConfidence: coalesceField(
      primary.decisionAttentionReplayConfidence,
      fallback.decisionAttentionReplayConfidence
    ),
    decisionAttentionContinuityCategory: coalesceField(
      primary.decisionAttentionContinuityCategory,
      fallback.decisionAttentionContinuityCategory
    ),
    decisionAttentionLifecycle: coalesceField(
      primary.decisionAttentionLifecycle,
      fallback.decisionAttentionLifecycle
    ),
  };
}

export function countDecisionAttentionFeedItems(items: OrganizationFeedItem[]): number {
  return items.filter(
    (item) => Boolean(item.decisionAttentionId) || item.type.startsWith("decision_attention_")
  ).length;
}
