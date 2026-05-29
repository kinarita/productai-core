export type ProductLifecycleStageId =
  | "idea"
  | "planning"
  | "direction"
  | "architecture"
  | "design"
  | "development"
  | "qa"
  | "release"
  | "outcome";

export type LifecycleWorkspaceViewId =
  | "timeline"
  | "board"
  | "mission"
  | "journey"
  | "summary"
  | "context";

export interface ProductLifecycleStage {
  id: ProductLifecycleStageId;
  title: string;
  description: string;
}

export const productLifecycleStages: ProductLifecycleStage[] = [
  { id: "idea", title: "Idea", description: "CEO idea and initial product framing." },
  { id: "planning", title: "Planning", description: "Product planning and scope definition." },
  { id: "direction", title: "Direction", description: "Mission direction and delivery coordination." },
  { id: "architecture", title: "Architecture", description: "Technical design and system boundaries." },
  { id: "design", title: "Design", description: "UX and UI alignment." },
  { id: "development", title: "Development", description: "Implementation in progress." },
  { id: "qa", title: "QA", description: "Quality review and validation." },
  { id: "release", title: "Release", description: "Release readiness and delivery." },
  { id: "outcome", title: "Outcome", description: "Post-release observation and reflection." },
];

export const lifecycleWorkspaceAdvisoryNote =
  "This lifecycle view provides context across the product journey—existing workspace data integrated for executive reading, not automatic advancement or optimization.";

export function lifecycleStageLabel(id: ProductLifecycleStageId): string {
  return productLifecycleStages.find((s) => s.id === id)?.title ?? id;
}

export function lifecycleStageIndex(id: ProductLifecycleStageId): number {
  return productLifecycleStages.findIndex((s) => s.id === id);
}

export function previousLifecycleStage(id: ProductLifecycleStageId): ProductLifecycleStageId | null {
  const index = lifecycleStageIndex(id);
  return index > 0 ? productLifecycleStages[index - 1].id : null;
}
