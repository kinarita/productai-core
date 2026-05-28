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
    | "memory";
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
  governanceCategory?:
    | "governance_summary"
    | "governance_review"
    | "governance_continuity"
    | "governance_runtime"
    | "governance_processing"
    | "governance_replay";
  replayCategory?:
    | "replay_summary"
    | "replay_memory"
    | "replay_review"
    | "replay_runtime"
    | "replay_governance"
    | "replay_advisory"
    | "replay_timeline";
  continuityCategory?:
    | "continuity_stable"
    | "continuity_review"
    | "continuity_advisory"
    | "continuity_runtime"
    | "continuity_governance"
    | "continuity_replay";
  advisoryLevel?:
    | "informational"
    | "advisory"
    | "elevated"
    | "advisory_low"
    | "advisory_moderate"
    | "advisory_elevated";
  replayTags?: string[];
  replaySeverity?: "low" | "moderate" | "elevated" | "critical_review";
  replaySource?:
    | "queue"
    | "governance"
    | "runtime"
    | "replay"
    | "memory"
    | "orchestration"
    | "advisory"
    | "runtime_observer"
    | "coo"
    | "ceo"
    | "system";
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
