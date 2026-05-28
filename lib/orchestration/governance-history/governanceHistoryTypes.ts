import type {
  GovernanceContinuityExplanation,
  GovernanceSeverity,
  ProcessingReasonCategory,
} from "@/lib/orchestration/processing/processingTypes";

export type GovernanceTimelineEventType =
  | "review_requested"
  | "review_resolved"
  | "processing_paused"
  | "processing_resumed"
  | "execution_ready"
  | "execution_session_active"
  | "runtime_advisory"
  | "governance_summary"
  | "continuity_score_changed";

export interface GovernanceTimelineEvent {
  id: string;
  timestamp: string;
  eventType: GovernanceTimelineEventType;
  missionId: string;
  taskId?: string;
  source: string;
  severity: GovernanceSeverity;
  title: string;
  summary: string;
  relatedReasonCategory?: ProcessingReasonCategory;
  relatedFeedItemId?: string;
  relatedProcessingSessionId?: string;
  relatedExecutionQueueItemId?: string;
}

export interface ExecutiveGovernanceSnapshot {
  id: string;
  createdAt: string;
  governanceHealthScore: number;
  reviewRequiredCount: number;
  elevatedRiskCount: number;
  activeProcessingCount: number;
  runtimeInstabilityCount: number;
  summary: string;
  keyDrivers: string[];
  recommendedFocus: string[];
}

export type GovernanceMemoryType =
  | "recurring_risk"
  | "repeated_review_pattern"
  | "runtime_instability_pattern"
  | "governance_bottleneck"
  | "execution_readiness_pattern";

export interface GovernanceMemoryItem {
  id: string;
  createdAt: string;
  memoryType: GovernanceMemoryType;
  title: string;
  summary: string;
  evidenceEventIds: string[];
  relatedMissionIds: string[];
  recommendation: string;
}

export interface GovernanceReplayBundle {
  events: GovernanceTimelineEvent[];
  latestSnapshot: ExecutiveGovernanceSnapshot;
  snapshots: ExecutiveGovernanceSnapshot[];
  continuityExplanation: GovernanceContinuityExplanation;
  memoryItems: GovernanceMemoryItem[];
}

export interface GovernanceTrendPoint {
  label: string;
  governanceHealthScore: number;
  reviewDensity: number;
  runtimeInstability: number;
  advisoryDensity: number;
}

export interface ExecutiveReplaySummary {
  generatedAt: string;
  replayWindow: string;
  activeScope: string;
  continuityFocus: string;
  filteredSeverity: string;
  visibleEventCount: number;
  timelineDensity: string;
  activeReplayWindow: string;
  governanceHealthSummary: string;
  keyContinuityDrivers: string[];
  reviewPressureSummary: string;
  runtimeGovernanceSummary: string;
  recommendedExecutiveFocus: string[];
}
