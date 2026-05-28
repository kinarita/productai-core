import type { OrganizationFeedItem } from "@/types/productai";
import type { ProcessingAuditEntry, ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { buildGovernanceMemory } from "@/lib/orchestration/governance-history/governanceMemory";
import { buildExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceSnapshot";
import { buildGovernanceTimeline } from "@/lib/orchestration/governance-history/governanceTimeline";
import type { GovernanceReplayBundle } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";
import type { SyncWarning } from "@/lib/store/syncStore";
import { buildReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function buildGovernanceReplay(input: {
  processingSessions: ProcessingSession[];
  processingAuditTrail: ProcessingAuditEntry[];
  feedItems: OrganizationFeedItem[];
  runtimeAlerts: RuntimeAlert[];
  syncWarnings: SyncWarning[];
  persistedSnapshots?: GovernanceReplayBundle["snapshots"];
  replayQuery?: ReplayQueryState;
  allEventCount?: number;
}): GovernanceReplayBundle {
  const timeline = buildGovernanceTimeline(input);
  const latestSnapshot = buildExecutiveGovernanceSnapshot(input);
  const analytics = buildProcessingAnalytics(input.processingSessions);
  const snapshots = [latestSnapshot, ...(input.persistedSnapshots ?? [])]
    .filter((snapshot, index, arr) => arr.findIndex((entry) => entry.id === snapshot.id) === index)
    .slice(0, 10);
  const memoryItems = buildGovernanceMemory(timeline);
  const diagnostics = buildReplayDiagnostics({
    events: timeline,
    allEventCount: input.allEventCount ?? timeline.length,
    feedItems: input.feedItems,
    replayQuery: input.replayQuery ?? replayQueryDefaults,
    memoryItems,
  });
  return {
    events: timeline,
    latestSnapshot,
    snapshots,
    continuityExplanation: analytics.continuityExplanation,
    memoryItems,
    diagnostics,
  };
}
