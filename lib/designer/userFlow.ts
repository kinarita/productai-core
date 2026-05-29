import type { Mission } from "@/types/productai";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import { userFlowIdFromMission } from "@/lib/designer/designerWorkspace";

export interface UserFlowRecord {
  userFlowId: string;
  missionId: string;
  title: string;
  targetUser: string;
  entryPoint: string;
  primaryFlow: string[];
  alternativeFlows: string[];
  exitPoints: string[];
  createdAt: string;
  updatedAt: string;
}

export function buildUserFlowRecord(input: {
  mission: Mission;
  specification: TechnicalSpecificationRecord;
}): UserFlowRecord {
  const { mission, specification } = input;
  return {
    userFlowId: userFlowIdFromMission(mission.id),
    missionId: mission.id,
    title: `${mission.name} — User Flow`,
    targetUser: "CEO and Mission Team operators reviewing planning artifacts.",
    entryPoint: "CEO Home or relevant workspace entry for the mission.",
    primaryFlow: [
      "Open mission context from CEO Home or workspace navigation.",
      "Review planning artifacts (brief, plan, specification) for alignment.",
      `Navigate to ${mission.name} detail and design workspaces.`,
      "Record human review feedback in Artifact Review when ready.",
    ],
    alternativeFlows: [
      "Executive replay path via Runtime & Cost for governance reading.",
      "Cross-mission comparison via Organization Feed continuity.",
    ],
    exitPoints: [
      "Design review candidate noted—development planning considered by humans.",
      "Return to mission detail for coordination without autonomous execution.",
    ],
    createdAt: specification.createdAt,
    updatedAt: mission.updatedAt,
  };
}
