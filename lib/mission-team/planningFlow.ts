import type { Mission } from "@/types/productai";

export type PlanningFlowStepId =
  | "idea_intake"
  | "problem_framing"
  | "value_proposition"
  | "mvp_scope"
  | "feature_priority"
  | "product_brief";

export interface PlanningFlowStep {
  id: PlanningFlowStepId;
  title: string;
  description: string;
  artifact: string;
}

export const planningFlowSteps: PlanningFlowStep[] = [
  {
    id: "idea_intake",
    title: "Idea intake",
    description: "Capture the CEO idea in product-oriented language.",
    artifact: "CEO idea summary",
  },
  {
    id: "problem_framing",
    title: "Problem framing",
    description: "Clarify user problems and context.",
    artifact: "Problem statement",
  },
  {
    id: "value_proposition",
    title: "Value proposition",
    description: "Articulate why the product matters.",
    artifact: "Value proposition draft",
  },
  {
    id: "mvp_scope",
    title: "MVP scope",
    description: "Define the smallest valuable release.",
    artifact: "MVP Scope",
  },
  {
    id: "feature_priority",
    title: "Feature priority",
    description: "Sequence features for human review—not automatic prioritization.",
    artifact: "Feature Proposal",
  },
  {
    id: "product_brief",
    title: "Product brief",
    description: "Consolidate planning outputs for CEO authorization.",
    artifact: "Product Brief",
  },
];

export function buildPlanningFlowStatus(mission: Mission): {
  activeStep: PlanningFlowStep;
  progressLabel: string;
  advisoryNote: string;
} {
  const progressIndex = Math.min(
    planningFlowSteps.length - 1,
    Math.floor((mission.progress / 100) * planningFlowSteps.length)
  );
  const activeStep = planningFlowSteps[progressIndex];
  return {
    activeStep,
    progressLabel: `Planning step: ${activeStep.title}`,
    advisoryNote:
      "The product planning stage is currently refining the mission scope and MVP definition. Product Planner leads—COO coordinates only.",
  };
}
