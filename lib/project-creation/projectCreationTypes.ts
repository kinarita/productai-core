export type ProjectWizardStep = 1 | 2 | 3;

export type DiscoveryMode = "quick" | "guided";

export interface ProjectCreationInput {
  idea: string;
  targetUsers: string;
  successGoal: string;
  discoveryMode: DiscoveryMode;
  /** Accumulated CEO clarification answers (Phase 16). */
  clarifications?: string;
}

export interface CreatedProjectMeta {
  missionId: string;
  idea: string;
  targetUsers: string;
  successGoal: string;
  discoveryMode: DiscoveryMode;
  createdAt: string;
  plannerStatus: "pending" | "planning_started";
  productBriefGenerated: boolean;
}

export type ProjectTimelineStageId =
  | "idea"
  | "opportunity"
  | "discovery"
  | "clarification"
  | "cpf"
  | "psf"
  | "mvp"
  | "planning"
  | "review"
  | "architecture"
  | "design"
  | "build"
  | "qa"
  | "release";

export interface ProjectTimelineStage {
  id: ProjectTimelineStageId;
  label: string;
  state: "done" | "current" | "upcoming";
}

export interface ProjectActivityItem {
  id: string;
  missionId: string;
  workerEmoji: string;
  workerName: string;
  message: string;
  timestamp: string;
}

export const projectCreationExamples = [
  "Expense Tracker",
  "SaaS Dashboard",
  "Chrome Extension",
  "AI Assistant",
] as const;
