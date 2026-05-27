export type MissionLifecyclePhase =
  | "Idea"
  | "Requirements"
  | "Specification"
  | "Architecture"
  | "UI/UX"
  | "Implementation"
  | "Review"
  | "Release";

export type AgentRole = "COO" | "Architect" | "Engineer" | "QA";

export type AgentStatus = "active" | "idle" | "analyzing" | "reviewing";

export type MissionHealth = "stable" | "delayed" | "risky" | "blocked";

export type MissionStatus = "planning" | "active" | "on_hold" | "completed";

export type TaskStatus = "active" | "in_review" | "blocked" | "completed";

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
  status: MissionStatus;
  lifecycle: MissionLifecyclePhase;
  progress: number;
  health: MissionHealth;
  assignedAgents: AgentRole[];
  blockers: string[];
  recentActivity: string;
  updatedAt: string;
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
  dependencies: string[];
  eta: string;
  progress: number;
}

export interface Decision {
  id: string;
  title: string;
  relatedMissionId: string;
  missionName: string;
  summary: string;
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
    | "coordination"
    | "task_assignment"
    | "implementation"
    | "architecture"
    | "qa_review"
    | "escalation"
    | "approval_required";
  author: AgentRole;
  authorName: string;
  missionId: string;
  missionName: string;
  message: string;
  timestamp: string;
  requiresCeoApproval?: boolean;
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
