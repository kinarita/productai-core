import { apiClient } from "@/lib/services/apiClient";
import type { ReplaySeedDiagnostics } from "@/lib/replay-query/replaySeedDiagnostics";

const LAST_REFRESH_KEY = "productai-replay-seed-last-refresh";

export interface ReplaySeedRefreshResult {
  inserted: number;
  skipped: number;
  insertedIds: string[];
  skippedIds: string[];
  message: string;
}

export function getLastReplaySeedRefreshAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_REFRESH_KEY);
}

function setLastReplaySeedRefreshAt(timestamp: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_REFRESH_KEY, timestamp);
}

export async function refreshDecisionAttentionSeeds(): Promise<ReplaySeedRefreshResult> {
  const result = await apiClient<ReplaySeedRefreshResult>("/api/feed/replay-seeds", {
    method: "POST",
  });
  setLastReplaySeedRefreshAt(new Date().toISOString());
  return result;
}

export async function fetchReplaySeedDiagnostics(): Promise<ReplaySeedDiagnostics> {
  const lastRefreshAt = getLastReplaySeedRefreshAt();
  const query = lastRefreshAt ? `?lastRefreshAt=${encodeURIComponent(lastRefreshAt)}` : "";
  return apiClient<ReplaySeedDiagnostics>(`/api/feed/replay-seeds${query}`);
}
