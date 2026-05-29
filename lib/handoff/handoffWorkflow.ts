import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";
import type { MissionWorkflowStageId } from "@/lib/mission-team/missionWorkflow";

export type HandoffRoleId =
  | "ceo"
  | "product_planner"
  | "director"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer"
  | "release";

export type HandoffWorkspaceViewId =
  | "flow"
  | "board"
  | "artifacts"
  | "timeline"
  | "summary"
  | "context";

export interface HandoffFlowStep {
  id: HandoffRoleId;
  title: string;
  description: string;
  receivesFrom: HandoffRoleId | null;
  handsOffTo: HandoffRoleId | null;
}

export const handoffFlowSteps: HandoffFlowStep[] = [
  {
    id: "ceo",
    title: "CEO",
    description: "Product idea and executive framing.",
    receivesFrom: null,
    handsOffTo: "product_planner",
  },
  {
    id: "product_planner",
    title: "Product Planner",
    description: "Product brief, user problem, MVP scope, and feature proposals.",
    receivesFrom: "ceo",
    handsOffTo: "director",
  },
  {
    id: "director",
    title: "Director",
    description: "Mission plan, delivery plan, task breakdown, and review schedule.",
    receivesFrom: "product_planner",
    handsOffTo: "architect",
  },
  {
    id: "architect",
    title: "Architect",
    description: "Technical specification, system design, and dependency planning.",
    receivesFrom: "director",
    handsOffTo: "designer",
  },
  {
    id: "designer",
    title: "Designer",
    description: "UI proposal, user flow, design notes, and component proposals.",
    receivesFrom: "architect",
    handsOffTo: "developer",
  },
  {
    id: "developer",
    title: "Developer",
    description: "Implementation plan, development notes, and repository context.",
    receivesFrom: "designer",
    handsOffTo: "qa_reviewer",
  },
  {
    id: "qa_reviewer",
    title: "QA Reviewer",
    description: "Test plan, QA notes, release checklist, and validation summary.",
    receivesFrom: "developer",
    handsOffTo: "release",
  },
  {
    id: "release",
    title: "Release",
    description: "Release readiness handoff from QA validation.",
    receivesFrom: "qa_reviewer",
    handsOffTo: null,
  },
];

export const handoffWorkspaceAdvisoryNote =
  "AI team handoff workflow shows what each role receives, produces, and passes forward—visualization only, no automatic approval or delegation.";

const workflowToHandoffRole: Record<MissionWorkflowStageId, HandoffRoleId> = {
  ceo_idea: "ceo",
  product_planning: "product_planner",
  ceo_authorization: "product_planner",
  mission_direction: "director",
  architecture: "architect",
  design: "designer",
  development: "developer",
  qa: "qa_reviewer",
  release: "release",
  reflection: "release",
};

export function handoffRoleLabel(id: HandoffRoleId): string {
  return handoffFlowSteps.find((s) => s.id === id)?.title ?? id;
}

export function handoffRoleIndex(id: HandoffRoleId): number {
  return handoffFlowSteps.findIndex((s) => s.id === id);
}

export function nextHandoffRole(id: HandoffRoleId): HandoffRoleId | null {
  const step = handoffFlowSteps.find((s) => s.id === id);
  return step?.handsOffTo ?? null;
}

export function previousHandoffRole(id: HandoffRoleId): HandoffRoleId | null {
  const step = handoffFlowSteps.find((s) => s.id === id);
  return step?.receivesFrom ?? null;
}

export function inferHandoffRoleFromWorkflow(stageId: MissionWorkflowStageId): HandoffRoleId {
  return workflowToHandoffRole[stageId] ?? "director";
}

export function missionTeamRoleToHandoff(role: MissionTeamRoleId): HandoffRoleId {
  return role;
}
