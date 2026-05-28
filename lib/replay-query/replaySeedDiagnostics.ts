import { DECISION_ATTENTION_SEED_IDS } from "@/lib/replay-query/replaySeedCatalog";
import type { DecisionAttentionLifecycle } from "@/types/productai";

export interface ReplaySeedDiagnostics {
  totalSeeds: number;
  availableSeeds: number;
  missingSeeds: string[];
  hydrationReady: boolean;
  lastRefreshAt?: string;
  continuityCoverage: Record<DecisionAttentionLifecycle, boolean>;
}

const lifecycles: DecisionAttentionLifecycle[] = [
  "generated",
  "reviewed",
  "resolved",
  "deferred",
];

export function buildReplaySeedDiagnostics(input: {
  presentSeedIds: string[];
  missingSeedIds: string[];
  lifecyclePresent: Partial<Record<DecisionAttentionLifecycle, boolean>>;
  lastRefreshAt?: string | null;
}): ReplaySeedDiagnostics {
  const continuityCoverage = lifecycles.reduce(
    (acc, lifecycle) => {
      acc[lifecycle] = Boolean(input.lifecyclePresent[lifecycle]);
      return acc;
    },
    {} as Record<DecisionAttentionLifecycle, boolean>
  );

  const hydrationReady =
    input.missingSeedIds.length === 0 &&
    lifecycles.every((lifecycle) => continuityCoverage[lifecycle]);

  return {
    totalSeeds: DECISION_ATTENTION_SEED_IDS.length,
    availableSeeds: input.presentSeedIds.length,
    missingSeeds: input.missingSeedIds,
    hydrationReady,
    lastRefreshAt: input.lastRefreshAt ?? undefined,
    continuityCoverage,
  };
}

export function buildReplaySeedDiagnosticsFromPresence(input: {
  presentIds: string[];
  missingIds: string[];
  lifecycleBySeedId: Record<string, DecisionAttentionLifecycle | undefined>;
  lastRefreshAt?: string | null;
}): ReplaySeedDiagnostics {
  const lifecyclePresent = lifecycles.reduce(
    (acc, lifecycle) => {
      acc[lifecycle] = Object.values(input.lifecycleBySeedId).includes(lifecycle);
      return acc;
    },
    {} as Partial<Record<DecisionAttentionLifecycle, boolean>>
  );

  return buildReplaySeedDiagnostics({
    presentSeedIds: input.presentIds,
    missingSeedIds: input.missingIds,
    lifecyclePresent,
    lastRefreshAt: input.lastRefreshAt,
  });
}
