export type DeliveryPipelineStageId =
  | "task_planning"
  | "ready"
  | "in_progress"
  | "review"
  | "repository_ready"
  | "release_ready"
  | "released";

export type DeliveryWorkspaceViewId =
  | "pipeline"
  | "board"
  | "ownership"
  | "review"
  | "repository"
  | "release"
  | "summary"
  | "context";

export interface DeliveryPipelineStage {
  id: DeliveryPipelineStageId;
  title: string;
  description: string;
}

export const deliveryPipelineStages: DeliveryPipelineStage[] = [
  {
    id: "task_planning",
    title: "Task Planning",
    description: "Task scope and dependencies being framed.",
  },
  {
    id: "ready",
    title: "Ready",
    description: "Task is ready to begin work.",
  },
  {
    id: "in_progress",
    title: "In Progress",
    description: "Active implementation or coordination in progress.",
  },
  {
    id: "review",
    title: "Review",
    description: "Task is under review.",
  },
  {
    id: "repository_ready",
    title: "Repository Ready",
    description: "Work is complete and repository artifacts are linked.",
  },
  {
    id: "release_ready",
    title: "Release Ready",
    description: "Task contributes to a release-ready mission state.",
  },
  {
    id: "released",
    title: "Released",
    description: "Delivered through release.",
  },
];

export const deliveryWorkspaceAdvisoryNote =
  "The delivery workspace provides visibility into task progress and review continuity. No automatic execution, prioritization, or task creation.";

export function getDeliveryPipelineStage(id: DeliveryPipelineStageId): DeliveryPipelineStage {
  return deliveryPipelineStages.find((s) => s.id === id) ?? deliveryPipelineStages[0];
}

export function deliveryStageLabel(id: DeliveryPipelineStageId): string {
  return getDeliveryPipelineStage(id).title;
}
