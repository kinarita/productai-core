import type { Mission, Task } from "@/types/productai";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import { mapMissionToCooStage } from "@/lib/coo/cooMissionAnalysis";
import type { CooPipelineStageId } from "@/lib/coo/cooWorkspace";

export interface CooBottleneckObservation {
  id: string;
  missionId: string;
  missionName: string;
  stage: CooPipelineStageId;
  category:
    | "stage_dwell"
    | "attention_concentration"
    | "review_pending"
    | "qa_wait"
    | "design_wait"
    | "architecture_wait";
  label: string;
  detail: string;
  severity: "observation" | "review_suggested";
}

function isStaleUpdate(updatedAt: string): boolean {
  return /day|week|—/.test(updatedAt.toLowerCase());
}

export function detectCooBottlenecks(input: {
  missions: Mission[];
  tasks: Task[];
  decisionAttention: DecisionAttentionItem[];
}): CooBottleneckObservation[] {
  const observations: CooBottleneckObservation[] = [];

  for (const mission of input.missions.filter((m) => m.status === "active" || m.status === "planning")) {
    const stage = mapMissionToCooStage(mission);
    const attentionCount = input.decisionAttention.filter((a) => a.missionId === mission.id).length;
    const blockedTasks = input.tasks.filter(
      (t) => t.missionId === mission.id && (t.status === "blocked" || t.status === "in_review")
    );

    if (isStaleUpdate(mission.updatedAt) && mission.progress < 75) {
      observations.push({
        id: `bn-dwell-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "stage_dwell",
        label: "Potential bottleneck",
        detail: `${mission.name} has remained in ${stage} with limited recent movement (${mission.updatedAt}). Review suggested for continuity reading.`,
        severity: "review_suggested",
      });
    }

    if (attentionCount >= 2) {
      observations.push({
        id: `bn-attn-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "attention_concentration",
        label: "Review suggested",
        detail: `Decision attention appears concentrated on ${mission.name} (${attentionCount} item(s)). Executive review reading may help.`,
        severity: "review_suggested",
      });
    }

    if (blockedTasks.length > 0) {
      observations.push({
        id: `bn-review-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "review_pending",
        label: "Review suggested",
        detail: `${blockedTasks.length} task(s) blocked or in review for ${mission.name}. Coordination visibility only.`,
        severity: "review_suggested",
      });
    }

    if (stage === "qa" && mission.progress < 95 && mission.health !== "stable") {
      observations.push({
        id: `bn-qa-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "qa_wait",
        label: "Potential bottleneck",
        detail: `${mission.name} may benefit from additional QA review coordination.`,
        severity: "observation",
      });
    }

    if (stage === "design" && mission.blockers.length > 0) {
      observations.push({
        id: `bn-design-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "design_wait",
        label: "Potential bottleneck",
        detail: `Design stage for ${mission.name} has open blockers. Review suggested for mission continuity.`,
        severity: "review_suggested",
      });
    }

    if (stage === "architecture" && (mission.health === "delayed" || mission.health === "blocked")) {
      observations.push({
        id: `bn-arch-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        stage,
        category: "architecture_wait",
        label: "Potential bottleneck",
        detail: `${mission.name} may benefit from additional architecture review coordination.`,
        severity: "observation",
      });
    }
  }

  return observations.slice(0, 12);
}
