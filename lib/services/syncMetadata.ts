/**
 * Sync metadata helpers — foundation for future conflict resolution.
 * syncedAt marks when an entity was last aligned with backend persistence.
 */

export function markSyncedAt(): string {
  return new Date().toISOString();
}

export function withSyncedAt<T extends { syncedAt?: string }>(entity: T, syncedAt?: string): T {
  return {
    ...entity,
    syncedAt: syncedAt ?? markSyncedAt(),
  };
}

export function getMostRecentSyncTime(...values: (string | undefined | null)[]): string | null {
  let best: number | null = null;
  let bestValue: string | null = null;

  for (const value of values) {
    if (!value) continue;
    const ts = Date.parse(value);
    if (Number.isNaN(ts)) continue;
    if (best === null || ts > best) {
      best = ts;
      bestValue = value;
    }
  }

  return bestValue;
}
