import "server-only";

import { buildReplaySeedDiagnosticsFromPresence } from "@/lib/replay-query/replaySeedDiagnostics";
import type { ReplaySeedDiagnostics } from "@/lib/replay-query/replaySeedDiagnostics";
import type { DecisionAttentionLifecycle } from "@/types/productai";
import { feedRepository } from "@/lib/server/repositories/feedRepository";
import { listDecisionAttentionSeedPresence } from "@/lib/server/replay/replaySeedRefreshCore";

export function buildReplaySeedDiagnosticsFromDatabase(
  lastRefreshAt?: string | null
): ReplaySeedDiagnostics {
  const { presentIds, missingIds } = listDecisionAttentionSeedPresence();
  const lifecycleBySeedId: Record<string, DecisionAttentionLifecycle | undefined> = {};

  for (const id of presentIds) {
    const row = feedRepository.getById(id);
    const lifecycle = row?.decisionAttentionLifecycle;
    if (lifecycle) {
      lifecycleBySeedId[id] = lifecycle as DecisionAttentionLifecycle;
    }
  }

  return buildReplaySeedDiagnosticsFromPresence({
    presentIds,
    missingIds,
    lifecycleBySeedId,
    lastRefreshAt,
  });
}
