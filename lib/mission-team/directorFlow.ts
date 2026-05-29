import type { Mission } from "@/types/productai";

export type DirectorFlowStepId =
  | "mission_plan"
  | "task_breakdown"
  | "schedule"
  | "assignment_coordination"
  | "review_coordination"
  | "risk_sharing";

export interface DirectorFlowStep {
  id: DirectorFlowStepId;
  title: string;
  description: string;
  artifact: string;
}

export const directorFlowSteps: DirectorFlowStep[] = [
  {
    id: "mission_plan",
    title: "Mission plan",
    description: "Frame mission outcomes and delivery boundaries.",
    artifact: "Mission Plan",
  },
  {
    id: "task_breakdown",
    title: "Task breakdown",
    description: "Decompose work for Mission Team roles.",
    artifact: "Task breakdown",
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Make timing visible for executive review.",
    artifact: "Delivery Plan",
  },
  {
    id: "assignment_coordination",
    title: "Assignment coordination",
    description: "Align Architect, Designer, Developer, and QA responsibilities.",
    artifact: "Assignment map",
  },
  {
    id: "review_coordination",
    title: "Review coordination",
    description: "Coordinate review cadence without autonomous routing.",
    artifact: "Review Schedule",
  },
  {
    id: "risk_sharing",
    title: "Risk sharing",
    description: "Surface blockers and risks for CEO visibility.",
    artifact: "Risk summary",
  },
];

export function buildDirectorFlowStatus(mission: Mission): {
  activeStep: DirectorFlowStep;
  progressLabel: string;
  advisoryNote: string;
} {
  const progressIndex = Math.min(
    directorFlowSteps.length - 1,
    Math.floor((mission.progress / 100) * directorFlowSteps.length)
  );
  const activeStep = directorFlowSteps[progressIndex];
  return {
    activeStep,
    progressLabel: `Direction step: ${activeStep.title}`,
    advisoryNote:
      "Mission direction coordinates delivery planning and reviews. Director leads—COO aligns across Planner and Architect.",
  };
}
