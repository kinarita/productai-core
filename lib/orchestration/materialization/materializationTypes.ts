import type { MaterializationLifecycleStatus } from "@/lib/orchestration/execution/executionTypes";
import type { ExecutionReadiness } from "@/types/productai";

export interface MaterializationRecord {
  id: string;
  ticketId: string;
  proposalId: string;
  executionPlanId?: string;
  missionId: string;
  status: MaterializationLifecycleStatus;
  taskIds: string[];
  createdAt: string;
  governanceReviewedAt?: string;
}

export interface MaterializationResult {
  record: MaterializationRecord;
  taskIds: string[];
  readiness: ExecutionReadiness;
}

export interface ExecutionReadinessSummary {
  missionId: string;
  governanceReviewed: number;
  executionReady: number;
  blocked: number;
  pendingReview: number;
  runtimeAdvisory?: string;
}