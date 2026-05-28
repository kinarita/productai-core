import type { OrganizationFeedItem } from "@/types/productai";
import type { ProcessingAuditEntry, ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import type {
  GovernanceTimelineEvent,
  GovernanceTimelineEventType,
} from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";
import type { SyncWarning } from "@/lib/store/syncStore";

function severityByType(type: GovernanceTimelineEventType): GovernanceTimelineEvent["severity"] {
  if (type === "review_requested" || type === "processing_paused") return "elevated";
  if (type === "runtime_advisory") return "moderate";
  if (type === "continuity_score_changed") return "moderate";
  return "low";
}

export function buildGovernanceTimeline(input: {
  processingSessions: ProcessingSession[];
  processingAuditTrail: ProcessingAuditEntry[];
  feedItems: OrganizationFeedItem[];
  runtimeAlerts: RuntimeAlert[];
  syncWarnings: SyncWarning[];
}): GovernanceTimelineEvent[] {
  const events: GovernanceTimelineEvent[] = [];
  input.processingAuditTrail.slice(0, 80).forEach((audit) => {
    const session = input.processingSessions.find((s) => s.queueItemId === audit.queueItemId);
    const eventType: GovernanceTimelineEventType =
      audit.action === "processing_review_requested"
        ? "review_requested"
        : audit.action === "processing_review_resolved"
          ? "review_resolved"
          : audit.action === "processing_paused"
            ? "processing_paused"
            : audit.action === "processing_governance_activated"
              ? "processing_resumed"
              : "governance_summary";
    events.push({
      id: `timeline-audit-${audit.id}`,
      timestamp: audit.timestamp,
      eventType,
      missionId: session?.missionId ?? "unknown",
      source: audit.role,
      severity: severityByType(eventType),
      title: audit.action.replaceAll("_", " "),
      summary: audit.message,
      relatedReasonCategory: session?.latestReviewReason?.category,
      relatedProcessingSessionId: session?.id,
      relatedExecutionQueueItemId: audit.queueItemId,
    });
  });

  input.feedItems.slice(0, 40).forEach((feed) => {
    let eventType: GovernanceTimelineEventType = "governance_summary";
    if (feed.governanceCategory === "governance_review") eventType = "review_requested";
    if (feed.continuityCategory === "continuity_review") eventType = "review_resolved";
    if (feed.governanceCategory === "governance_runtime") eventType = "runtime_advisory";
    if (feed.replayCategory === "replay_summary") eventType = "continuity_score_changed";
    events.push({
      id: `timeline-feed-${feed.id}`,
      timestamp: feed.timestamp,
      eventType,
      missionId: feed.missionId ?? "organization",
      taskId: feed.taskId,
      source: feed.authorName,
      severity: feed.replaySeverity ?? severityByType(eventType),
      title: feed.type,
      summary: feed.message,
      relatedFeedItemId: feed.id,
    });
  });

  input.runtimeAlerts.slice(0, 20).forEach((alert) => {
    events.push({
      id: `timeline-runtime-${alert.id}`,
      timestamp: alert.timestamp,
      eventType: "runtime_advisory",
      missionId: "organization",
      source: "Runtime Observer",
      severity: alert.severity === "danger" ? "critical_review" : alert.severity === "warning" ? "elevated" : "moderate",
      title: "runtime advisory",
      summary: alert.message,
    });
  });

  input.syncWarnings.slice(0, 20).forEach((warning) => {
    events.push({
      id: `timeline-sync-${warning.id}`,
      timestamp: warning.lastSeenAt ?? warning.createdAt,
      eventType: "runtime_advisory",
      missionId: "organization",
      source: "Runtime Observer",
      severity: "moderate",
      title: "sync instability",
      summary: warning.message,
    });
  });

  return events.slice(0, 200);
}
