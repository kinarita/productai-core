import type { Mission } from "@/types/productai";
import type { DesignSpecificationRecord } from "@/lib/designer/designSpecification";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import { implementationPlanIdFromMission } from "@/lib/developer/developerWorkspace";
import { artifactIdForReview } from "@/lib/review/reviewComments";

export interface ImplementationPlanRecord {
  implementationPlanId: string;
  missionId: string;
  title: string;
  implementationSummary: string;
  frontendScope: string;
  backendScope: string;
  databaseScope: string;
  aiScope: string;
  integrationScope: string;
  createdAt: string;
  updatedAt: string;
  artifactReviewHref: string;
}

export function buildImplementationPlanRecord(input: {
  mission: Mission;
  designSpec: DesignSpecificationRecord;
  technicalSpec: TechnicalSpecificationRecord;
}): ImplementationPlanRecord {
  const { mission, designSpec, technicalSpec } = input;
  const artifactId = artifactIdForReview(mission.id, "implementation_plan");
  return {
    implementationPlanId: implementationPlanIdFromMission(mission.id),
    missionId: mission.id,
    title: `${mission.name} — Implementation Plan`,
    implementationSummary: `${technicalSpec.proposedSolution} — organized for human-led implementation boundaries, not autonomous execution.`,
    frontendScope: `Workspace UIs per ${designSpec.layoutGuidelines[0]} — ${mission.lifecycle} phase.`,
    backendScope: "Next.js API routes and analysis builders—planning data only, no auto task or mission creation.",
    databaseScope: "Mission, Task, and workspace state via stores and mock continuity—localStorage persistence.",
    aiScope: "AI organizes artifacts and recommendations—CEO and roles authorize; no autonomous runtime.",
    integrationScope: mission.relatedPullRequests.length
      ? `Repository context: ${mission.relatedPullRequests.join(", ")} — design only, no GitHub actions.`
      : "Internal workspace integration—no external execution wiring.",
    createdAt: designSpec.createdAt,
    updatedAt: mission.updatedAt,
    artifactReviewHref: `/artifact-review?mission=${mission.id}&artifact=${artifactId}`,
  };
}
