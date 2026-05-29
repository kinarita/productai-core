import type { Mission } from "@/types/productai";
import { mapMissionToCooStage } from "@/lib/coo/cooMissionAnalysis";
import type { CooPipelineStageId } from "@/lib/coo/cooWorkspace";
import { cooPipelineStages } from "@/lib/coo/cooWorkspace";

export interface CooWorkflowStageCount {
  stage: CooPipelineStageId;
  title: string;
  missionCount: number;
  missionNames: string[];
}

export interface CooWorkflowSummary {
  stages: CooWorkflowStageCount[];
  activeMissionCount: number;
  releaseReadyCount: number;
  advisoryNote: string;
}

export interface CooWorkspaceSummary {
  activeMissions: number;
  potentialBottlenecks: number;
  reviewConcentrations: number;
  missionDistribution: CooWorkflowStageCount[];
  advisoryNote: string;
}

export function buildCooWorkflowSummary(missions: Mission[]): CooWorkflowSummary {
  const active = missions.filter(
    (m) => m.status === "active" || m.status === "planning" || m.status === "on_hold"
  );

  const stages: CooWorkflowStageCount[] = cooPipelineStages.map((stage) => {
    const matched = active.filter((m) => mapMissionToCooStage(m) === stage.id);
    return {
      stage: stage.id,
      title: stage.title,
      missionCount: matched.length,
      missionNames: matched.map((m) => m.name),
    };
  });

  const releaseReadyCount = active.filter(
    (m) => mapMissionToCooStage(m) === "release" || (m.progress >= 90 && m.lifecycle === "Release")
  ).length;

  return {
    stages,
    activeMissionCount: active.length,
    releaseReadyCount,
    advisoryNote:
      "Workflow overview aggregates mission stages for COO coordination visibility—no automatic routing.",
  };
}

export function buildCooWorkspaceSummary(input: {
  missions: Mission[];
  bottleneckCount: number;
  reviewConcentrationCount: number;
}): CooWorkspaceSummary {
  const workflow = buildCooWorkflowSummary(input.missions);
  return {
    activeMissions: workflow.activeMissionCount,
    potentialBottlenecks: input.bottleneckCount,
    reviewConcentrations: input.reviewConcentrationCount,
    missionDistribution: workflow.stages.filter((s) => s.missionCount > 0),
    advisoryNote:
      "The COO workspace highlights operational continuity across active missions.",
  };
}
