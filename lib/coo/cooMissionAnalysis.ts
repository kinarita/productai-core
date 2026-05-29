import type { Mission, Task } from "@/types/productai";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import {
  inferMissionWorkflowStage,
  getPrimaryRoleForMission,
  getWorkflowStage,
} from "@/lib/mission-team/missionWorkflow";
import type { CooPipelineStageId } from "@/lib/coo/cooWorkspace";
import { getCooPipelineStage } from "@/lib/coo/cooWorkspace";

export interface CooMissionPipelineRow {
  missionId: string;
  missionName: string;
  currentStage: CooPipelineStageId;
  currentStageLabel: string;
  primaryRole: string;
  status: string;
  attentionCount: number;
  updatedAt: string;
  health: Mission["health"];
  progress: number;
}

export interface CooMissionBoardItem {
  missionId: string;
  missionName: string;
  stage: CooPipelineStageId;
  stageLabel: string;
  primaryRole: string;
  blockers: string[];
  progress: number;
  health: Mission["health"];
}

const workflowToCooStage: Record<string, CooPipelineStageId> = {
  ceo_idea: "planning",
  product_planning: "planning",
  ceo_authorization: "planning",
  mission_direction: "direction",
  architecture: "architecture",
  design: "design",
  development: "development",
  qa: "qa",
  release: "release",
  reflection: "reflection",
};

export function mapMissionToCooStage(mission: Mission): CooPipelineStageId {
  const workflowStage = inferMissionWorkflowStage(mission);
  return workflowToCooStage[workflowStage] ?? "direction";
}

export function buildCooMissionPipeline(input: {
  missions: Mission[];
  decisionAttention: DecisionAttentionItem[];
}): CooMissionPipelineRow[] {
  return input.missions
    .filter((m) => m.status === "active" || m.status === "planning" || m.status === "on_hold")
    .map((mission) => {
      const stage = mapMissionToCooStage(mission);
      const role = getPrimaryRoleForMission(mission);
      const attentionCount = input.decisionAttention.filter(
        (a) => a.missionId === mission.id
      ).length;
      return {
        missionId: mission.id,
        missionName: mission.name,
        currentStage: stage,
        currentStageLabel: getCooPipelineStage(stage).title,
        primaryRole: role.replaceAll("_", " "),
        status: mission.status.replaceAll("_", " "),
        attentionCount,
        updatedAt: mission.updatedAt,
        health: mission.health,
        progress: mission.progress,
      };
    })
    .sort((a, b) => b.attentionCount - a.attentionCount || a.missionName.localeCompare(b.missionName));
}

export function buildCooMissionBoard(input: {
  missions: Mission[];
  tasks: Task[];
}): CooMissionBoardItem[] {
  return input.missions
    .filter((m) => m.status !== "completed")
    .map((mission) => {
      const stage = mapMissionToCooStage(mission);
      const workflowStage = inferMissionWorkflowStage(mission);
      const blockers = [
        ...mission.blockers,
        ...input.tasks
          .filter((t) => t.missionId === mission.id && t.status === "blocked")
          .map((t) => t.title),
      ].slice(0, 4);
      return {
        missionId: mission.id,
        missionName: mission.name,
        stage,
        stageLabel: getWorkflowStage(workflowStage).title,
        primaryRole: getPrimaryRoleForMission(mission).replaceAll("_", " "),
        blockers,
        progress: mission.progress,
        health: mission.health,
      };
    });
}

export function buildCooMissionContext(input: {
  mission: Mission;
  tasks: Task[];
  decisionAttention: DecisionAttentionItem[];
}) {
  const stage = mapMissionToCooStage(input.mission);
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const relatedAttention = input.decisionAttention.filter(
    (a) => a.missionId === input.mission.id
  );
  const dependencies = missionTasks.flatMap((t) => t.dependencies).slice(0, 6);
  const coordinationAreas: string[] = [];
  if (stage === "planning") coordinationAreas.push("Product Planner alignment");
  if (stage === "direction") coordinationAreas.push("Director delivery coordination");
  if (stage === "architecture") coordinationAreas.push("Architect review cadence");
  if (input.mission.blockers.length > 0) {
    coordinationAreas.push("Blocker visibility for executive review");
  }
  if (relatedAttention.length > 0) {
    coordinationAreas.push("Decision attention follow-up reading");
  }

  return {
    currentStage: stage,
    currentStageLabel: getCooPipelineStage(stage).title,
    dependencies,
    relatedAttention: relatedAttention.slice(0, 4),
    recommendedCoordinationAreas: coordinationAreas,
    advisoryNote:
      "COO context supports coordination visibility—not automatic mission routing or prioritization.",
  };
}
