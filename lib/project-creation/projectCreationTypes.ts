export type ProjectWizardStep = 1 | 2 | 3 | 4;

export interface ProjectCreationInput {
  idea: string;
  targetUsers: string;
  successGoal: string;
}

export interface CreatedProjectMeta {
  missionId: string;
  idea: string;
  targetUsers: string;
  successGoal: string;
  createdAt: string;
  plannerStatus: "pending" | "planning_started";
  productBriefGenerated: boolean;
}

export type ProjectTimelineStageId =
  | "idea"
  | "planning"
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
