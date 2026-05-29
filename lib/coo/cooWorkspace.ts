export type CooPipelineStageId =
  | "planning"
  | "direction"
  | "architecture"
  | "design"
  | "development"
  | "qa"
  | "release"
  | "reflection";

export type CooWorkspaceViewId =
  | "pipeline"
  | "board"
  | "workflow"
  | "bottlenecks"
  | "recommendations"
  | "context";

export interface CooPipelineStage {
  id: CooPipelineStageId;
  title: string;
  description: string;
}

export const cooPipelineStages: CooPipelineStage[] = [
  {
    id: "planning",
    title: "Planning",
    description: "Product planning and CEO authorization framing.",
  },
  {
    id: "direction",
    title: "Direction",
    description: "Mission direction, delivery plan, and coordination.",
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "Technical design and system boundaries.",
  },
  {
    id: "design",
    title: "Design",
    description: "UX and UI alignment for the mission.",
  },
  {
    id: "development",
    title: "Development",
    description: "Implementation and refactoring in progress.",
  },
  {
    id: "qa",
    title: "QA",
    description: "Quality review and validation.",
  },
  {
    id: "release",
    title: "Release",
    description: "Release readiness and delivery handoff.",
  },
  {
    id: "reflection",
    title: "Reflection",
    description: "Post-delivery reflection for continuity.",
  },
];

export const cooWorkspaceAdvisoryNote =
  "The COO workspace highlights operational continuity across active missions. Recommendations are advisory—no automatic prioritization or execution.";

export function getCooPipelineStage(id: CooPipelineStageId): CooPipelineStage {
  return cooPipelineStages.find((s) => s.id === id) ?? cooPipelineStages[0];
}

export function cooStageLabel(id: CooPipelineStageId): string {
  return getCooPipelineStage(id).title;
}
