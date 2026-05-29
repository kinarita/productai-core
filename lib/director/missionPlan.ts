import type { Mission } from "@/types/productai";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import { missionPlanIdFromMission } from "@/lib/director/directorWorkspace";

export interface MissionPlanRecord {
  missionPlanId: string;
  briefId: string;
  missionId: string;
  title: string;
  objective: string;
  scopeSummary: string;
  successCriteria: string[];
  assumptions: string[];
  risks: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export function buildMissionPlanRecord(input: {
  mission: Mission;
  brief: ProductBriefRecord;
}): MissionPlanRecord {
  const { mission, brief } = input;
  return {
    missionPlanId: missionPlanIdFromMission(mission.id),
    briefId: brief.briefId,
    missionId: mission.id,
    title: `${mission.name} — Mission Plan`,
    objective: mission.summary || mission.description,
    scopeSummary: mission.requirementsSummary || brief.plannerNotes[0] || mission.description,
    successCriteria: [
      "CEO-approved Product Brief scope delivered without scope drift.",
      `Mission progress target aligned with ${mission.lifecycle} phase.`,
      mission.releaseReadiness.summary,
    ],
    assumptions: [
      "Human authorization remains required for execution boundaries.",
      "Existing Mission Team tasks are organized—not auto-generated.",
      ...(brief.approvalNotes.length ? brief.approvalNotes.slice(0, 1) : []),
    ],
    risks: mission.blockers.length
      ? mission.blockers
      : ["No blockers recorded—monitor review cadence during planning."],
    dependencies: [
      ...mission.taskIds.slice(0, 2).map((id) => `Task ${id}`),
      ...(mission.relatedPullRequests.length
        ? [`PR context: ${mission.relatedPullRequests[0]}`]
        : []),
    ],
    createdAt: brief.approvedAt ?? brief.createdAt,
    updatedAt: mission.updatedAt,
  };
}
