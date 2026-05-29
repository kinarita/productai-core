import type {
  AdvisoryLevel,
  ContinuityCategory,
  GovernanceCategory,
  ReplayCategory,
  ReplaySeverity,
  ReplaySource,
} from "@/lib/replay-query/replayTaxonomy";

export type MissionLifecyclePhase =
  | "Idea"
  | "Requirements"
  | "Specification"
  | "Architecture"
  | "UI/UX"
  | "Implementation"
  | "Review"
  | "Release";

export type AgentRole =
  | "CEO"
  | "COO"
  | "Architect"
  | "Engineer"
  | "QA"
  | "Runtime Observer";

export type AgentStatus = "active" | "idle" | "analyzing" | "reviewing";

export type MissionHealth = "stable" | "delayed" | "risky" | "blocked";

export type MissionStatus = "planning" | "active" | "on_hold" | "completed";

export type TaskStatus = "active" | "in_review" | "blocked" | "completed";

export type TaskPriority = "high" | "medium" | "low";

export type TaskCreatedFrom = "judgment" | "manual" | "mission" | "materialization";

export type ExecutionReadiness =
  | "planning"
  | "governance_reviewed"
  | "execution_ready"
  | "blocked";

export interface TaskProvenance {
  createdFromProposalId?: string;
  createdFromExecutionTicketId?: string;
  createdFromExecutionPlanId?: string;
  governanceApprovedBy?: string;
  materializedAt?: string;
  executionReadiness?: ExecutionReadiness;
  governanceNotes?: string[];
  executionBoundaryNote?: string;
  queueItemId?: string;
}

export type DecisionStatus = "pending" | "approved" | "rejected";
export type DecisionAttentionSeverity =
  | "informational"
  | "advisory"
  | "elevated_review"
  | "executive_focus";
export type DecisionAttentionLifecycle = "generated" | "reviewed" | "resolved" | "deferred";

export type ReleaseState = "candidate" | "staging" | "production" | "rolled_back";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask?: string;
}

export interface ReleaseReadiness {
  score: number;
  label: string;
  summary: string;
  blockers: string[];
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  /** CEO-facing operational summary — updated as the mission evolves */
  summary: string;
  status: MissionStatus;
  lifecycle: MissionLifecyclePhase;
  progress: number;
  health: MissionHealth;
  assignedAgents: AgentRole[];
  blockers: string[];
  recentActivity: string;
  createdAt?: string;
  updatedAt: string;
  syncedAt?: string;
  requirementsSummary: string;
  architectureSummary: string;
  releaseReadiness: ReleaseReadiness;
  relatedBranches: string[];
  relatedPullRequests: string[];
  memoryInsightIds: string[];
  decisionIds: string[];
  taskIds: string[];
  activityIds: string[];
}

export interface Task {
  id: string;
  title: string;
  missionId: string;
  missionName: string;
  status: TaskStatus;
  assignedTo: AgentRole;
  /** Optional agent identity for assignment */
  assignedAgentId?: string;
  /** Task IDs (t-*) or free-text dependency labels */
  dependencies: string[];
  eta: string;
  progress: number;
  priority?: TaskPriority;
  relatedDecisionId?: string;
  createdFrom?: TaskCreatedFrom;
  provenance?: TaskProvenance;
  /** Structured event trail (local-only) */
  events?: TaskEvent[];
  updatedAt?: string;
  createdAt?: string;
  syncedAt?: string;
}

export type TaskEventType =
  | "status_change"
  | "task_started"
  | "moved_to_review"
  | "blocked"
  | "completed"
  | "reassigned"
  | "revision_requested"
  | "note";

export type TaskEventSource = "tasks" | "mission" | "judgment" | "runtime" | "system";

export interface TaskEvent {
  id: string;
  type: TaskEventType;
  message: string;
  timestamp: string;
  actor?: AgentRole;
  agentId?: string;
  source: TaskEventSource;
}

export interface Decision {
  id: string;
  title: string;
  relatedMissionId: string;
  missionName: string;
  summary: string;
  /** Optional tasks impacted by this decision */
  relatedTaskIds?: string[];
  optionA: { label: string; description: string };
  optionB: { label: string; description: string };
  risks: string[];
  costImpact: string;
  timeImpact: string;
  teamOpinions: {
    role: AgentRole;
    opinion: string;
    stance: "support" | "neutral" | "concern";
  }[];
  status: DecisionStatus;
  priority: "high" | "medium" | "low";
  createdAt?: string;
  updatedAt?: string;
  syncedAt?: string;
}

export interface MemoryItem {
  id: string;
  category: "learning" | "architecture" | "incident" | "pattern";
  title: string;
  summary: string;
  relatedMissionId?: string;
  missionName?: string;
  createdAt: string;
  tags: string[];
}

export interface ReleaseItem {
  id: string;
  version: string;
  relatedMissionId: string;
  missionName: string;
  branch: string;
  state: ReleaseState;
  deployedAt?: string;
}

export type MissionTeamFeedEventType =
  | "planning_started"
  | "planning_completed"
  | "direction_started"
  | "direction_completed"
  | "architecture_started"
  | "architecture_completed"
  | "design_started"
  | "design_completed"
  | "development_started"
  | "development_completed"
  | "qa_started"
  | "qa_completed";

export type CooFeedEventType =
  | "coo_review_generated"
  | "coo_bottleneck_observed"
  | "coo_coordination_note"
  | "coo_workflow_snapshot";

export type DeliveryFeedEventType =
  | "task_created"
  | "task_review_started"
  | "task_review_completed"
  | "repository_ready"
  | "release_readiness_updated"
  | "delivery_snapshot";

export type RepositoryFeedEventType =
  | "repository_created"
  | "branch_created"
  | "pull_request_opened"
  | "review_requested"
  | "review_completed"
  | "release_candidate_created"
  | "repository_snapshot";

export type ReleaseFeedEventType =
  | "release_checklist_updated"
  | "release_risk_observed"
  | "release_ready"
  | "release_snapshot";

export type OutcomeFeedEventType =
  | "outcome_observation_started"
  | "outcome_signal_recorded"
  | "outcome_review_recorded"
  | "outcome_followup_added"
  | "outcome_snapshot";

export type LifecycleFeedEventType =
  | "lifecycle_stage_changed"
  | "lifecycle_snapshot"
  | "lifecycle_context_updated";

export type HandoffFeedEventType =
  | "artifact_created"
  | "artifact_review_requested"
  | "artifact_approved"
  | "artifact_returned"
  | "artifact_handed_off"
  | "workflow_snapshot";

export type IdeaFeedEventType =
  | "idea_captured"
  | "idea_refined"
  | "product_brief_drafted"
  | "product_brief_review_requested"
  | "product_brief_approved"
  | "idea_snapshot";

export type ProductBriefFeedEventType =
  | "product_brief_created"
  | "product_brief_reviewed"
  | "product_brief_changes_requested"
  | "product_brief_approved"
  | "director_handoff_ready"
  | "product_brief_snapshot";

export type ReviewFeedEventType =
  | "artifact_comment_added"
  | "artifact_changes_requested"
  | "artifact_review_snapshot";

export interface OrganizationFeedItem {
  id: string;
  type:
    | "judgment"
    | "coordination"
    | "task_assignment"
    | "task_creation"
    | "implementation"
    | "architecture"
    | "qa_review"
    | "escalation"
    | "approval_required"
    | "runtime"
    | "memory"
    | "decision_attention_generated"
    | "decision_attention_reviewed"
    | "decision_attention_resolved"
    | "decision_attention_deferred"
    | MissionTeamFeedEventType
    | CooFeedEventType
    | DeliveryFeedEventType
    | RepositoryFeedEventType
    | ReleaseFeedEventType
    | OutcomeFeedEventType
    | LifecycleFeedEventType
    | HandoffFeedEventType
    | ReviewFeedEventType
    | IdeaFeedEventType
    | ProductBriefFeedEventType;
  author: AgentRole;
  authorName: string;
  missionId: string;
  missionName: string;
  /** Optional richer metadata for UI */
  title?: string;
  agentId?: string;
  taskId?: string;
  decisionId?: string;
  /** Optional status keyword for precise filtering */
  status?: TaskStatus | DecisionStatus;
  message: string;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  syncedAt?: string;
  requiresCeoApproval?: boolean;
  governanceCategory?: GovernanceCategory;
  replayCategory?: ReplayCategory;
  continuityCategory?: ContinuityCategory;
  advisoryLevel?: AdvisoryLevel | "advisory_low" | "advisory_moderate" | "advisory_elevated";
  replayTags?: string[];
  replaySeverity?: ReplaySeverity;
  replaySource?: ReplaySource | "runtime_observer" | "coo" | "ceo" | "system";
  decisionAttentionId?: string;
  decisionAttentionSeverity?: DecisionAttentionSeverity;
  decisionAttentionCategory?: string;
  decisionAttentionReason?: string;
  decisionAttentionSource?: string;
  decisionAttentionReplayConfidence?: "high" | "moderate" | "limited";
  decisionAttentionContinuityCategory?: ContinuityCategory;
  decisionAttentionLifecycle?: DecisionAttentionLifecycle;
}

export interface RuntimeCost {
  provider: string;
  tokensUsed: number;
  costUsd: number;
  trend: "up" | "down" | "stable";
  health: "healthy" | "degraded" | "down";
}

export interface Branch {
  name: string;
  relatedMissionId?: string;
  missionName: string;
  ahead: number;
  behind: number;
  lastCommit: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  branch: string;
  relatedMissionId?: string;
  missionName?: string;
  status: "open" | "merged" | "draft";
  author: string;
  reviews: number;
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  author: string;
  branch: string;
  relatedMissionId?: string;
  timestamp: string;
}

export const MISSION_LIFECYCLE_PHASES: MissionLifecyclePhase[] = [
  "Idea",
  "Requirements",
  "Specification",
  "Architecture",
  "UI/UX",
  "Implementation",
  "Review",
  "Release",
];
