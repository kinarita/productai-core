import type { Mission } from "@/types/productai";
import { briefIdFromMission } from "@/lib/brief/productBriefWorkspace";
import { missionPlanIdFromMission } from "@/lib/director/directorWorkspace";
import { specificationIdFromMission } from "@/lib/architect/architectWorkspace";
import { designSpecificationIdFromMission } from "@/lib/designer/designerWorkspace";
import { implementationPlanIdFromMission } from "@/lib/developer/developerWorkspace";
import { testPlanIdFromMission } from "@/lib/qa/qaWorkspace";
import { lineageIdFromMission } from "@/lib/lineage/artifactLineageWorkspace";

export interface ArtifactLineageRecord {
  lineageId: string;
  missionId: string;
  ideaId: string;
  productBriefId: string;
  missionPlanId: string;
  technicalSpecificationId: string;
  designSpecificationId: string;
  implementationPlanId: string;
  testPlanId: string;
  createdAt: string;
  updatedAt: string;
}

export function buildArtifactLineageRecord(mission: Mission): ArtifactLineageRecord {
  return {
    lineageId: lineageIdFromMission(mission.id),
    missionId: mission.id,
    ideaId: `idea-${mission.id}`,
    productBriefId: briefIdFromMission(mission.id),
    missionPlanId: missionPlanIdFromMission(mission.id),
    technicalSpecificationId: specificationIdFromMission(mission.id),
    designSpecificationId: designSpecificationIdFromMission(mission.id),
    implementationPlanId: implementationPlanIdFromMission(mission.id),
    testPlanId: testPlanIdFromMission(mission.id),
    createdAt: mission.createdAt ?? mission.updatedAt,
    updatedAt: mission.updatedAt,
  };
}
