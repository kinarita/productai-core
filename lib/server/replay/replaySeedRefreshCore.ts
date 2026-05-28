import "server-only";

import {
  buildDecisionAttentionSeedPayloads,
  DECISION_ATTENTION_SEED_IDS,
} from "@/lib/replay-query/replaySeedCatalog";
import { feedRepository } from "@/lib/server/repositories/feedRepository";

export interface ReplaySeedRefreshResult {
  inserted: number;
  skipped: number;
  insertedIds: string[];
  skippedIds: string[];
  message: string;
}

export function refreshDecisionAttentionSeedsCore(): ReplaySeedRefreshResult {
  const payloads = buildDecisionAttentionSeedPayloads();
  const insertedIds: string[] = [];
  const skippedIds: string[] = [];

  for (const payload of payloads) {
    const result = feedRepository.upsertReplaySeedFeedItem({
      id: payload.id,
      missionId: payload.missionId,
      missionName: payload.missionName,
      type: payload.type,
      status: payload.status ?? null,
      author: payload.author,
      authorName: payload.authorName,
      message: payload.message,
      createdAt: payload.timestamp,
      governanceCategory: payload.governanceCategory ?? null,
      replayCategory: payload.replayCategory ?? null,
      continuityCategory: payload.continuityCategory ?? null,
      advisoryLevel: payload.advisoryLevel ?? null,
      replaySeverity: payload.replaySeverity ?? null,
      replaySource: payload.replaySource ?? null,
      replayTags: payload.replayTags ?? null,
      decisionAttentionId: payload.decisionAttentionId ?? null,
      decisionAttentionSeverity: payload.decisionAttentionSeverity ?? null,
      decisionAttentionCategory: payload.decisionAttentionCategory ?? null,
      decisionAttentionReason: payload.decisionAttentionReason ?? null,
      decisionAttentionSource: payload.decisionAttentionSource ?? null,
      decisionAttentionReplayConfidence: payload.decisionAttentionReplayConfidence ?? null,
      decisionAttentionContinuityCategory: payload.decisionAttentionContinuityCategory ?? null,
      decisionAttentionLifecycle: payload.decisionAttentionLifecycle ?? null,
    });
    if (result.action === "inserted") {
      insertedIds.push(payload.id);
    } else {
      skippedIds.push(payload.id);
    }
  }

  const message =
    insertedIds.length > 0
      ? `Replay continuity examples are available for governance interpretation (${insertedIds.length} seed item(s) added).`
      : "Replay seeds already available.";

  return {
    inserted: insertedIds.length,
    skipped: skippedIds.length,
    insertedIds,
    skippedIds,
    message,
  };
}

export function listDecisionAttentionSeedPresence(): {
  seedIds: readonly string[];
  presentIds: string[];
  missingIds: string[];
} {
  const presentIds = DECISION_ATTENTION_SEED_IDS.filter((id) => Boolean(feedRepository.getById(id)));
  const missingIds = DECISION_ATTENTION_SEED_IDS.filter((id) => !presentIds.includes(id));
  return {
    seedIds: DECISION_ATTENTION_SEED_IDS,
    presentIds,
    missingIds,
  };
}
