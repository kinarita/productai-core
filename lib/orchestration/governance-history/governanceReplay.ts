import type { OrganizationFeedItem } from "@/types/productai";
import type { ProcessingAuditEntry, ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { buildGovernanceMemory } from "@/lib/orchestration/governance-history/governanceMemory";
import { buildExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceSnapshot";
import { buildGovernanceTimeline } from "@/lib/orchestration/governance-history/governanceTimeline";
import type { GovernanceReplayBundle } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";
import type { SyncWarning } from "@/lib/store/syncStore";

export function buildGovernanceReplay(input: {
  processingSessions: ProcessingSession[];
  processingAuditTrail: ProcessingAuditEntry[];
  feedItems: OrganizationFeedItem[];
  runtimeAlerts: RuntimeAlert[];
  syncWarnings: SyncWarning[];
}): GovernanceReplayBundle {
  const timeline = buildGovernanceTimeline(input);
  const latestSnapshot = buildExecutiveGovernanceSnapshot(input);
  const analytics = buildProcessingAnalytics(input.processingSessions);
  const snapshots = [latestSnapshot];
  const memoryItems = buildGovernanceMemory(timeline);
  return {
    events: timeline,
    latestSnapshot,
    snapshots,
    continuityExplanation: analytics.continuityExplanation,
    memoryItems,
  };
}
