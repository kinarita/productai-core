import type { BackendHealthStatus } from "@/lib/store/syncStore";
import type { PersistenceMode } from "@/lib/config/persistenceMode";

export function formatBackendHealthLabel(status: BackendHealthStatus): string {
  if (status === "healthy") return "Operational";
  if (status === "degraded") return "Delayed";
  return "Backend unavailable — local continuity maintained";
}

export function getSuggestedRetryLabel(pendingHydrationCount: number): string {
  if (pendingHydrationCount <= 0) return "Retry available now";
  if (pendingHydrationCount === 1) return "Suggested retry in 30s";
  if (pendingHydrationCount === 2) return "Suggested retry in 1m";
  return "Suggested retry in 2m";
}

export function getRemoteModeExplanation(mode: PersistenceMode): string {
  if (mode === "local") {
    return "Browser-first persistence. Backend sync is not required.";
  }
  if (mode === "hybrid") {
    return "Local-first with best-effort backend sync. Local-only data is preserved.";
  }
  return "Future mode: backend source-of-truth with local cache. Auth and multi-user required before production use.";
}
