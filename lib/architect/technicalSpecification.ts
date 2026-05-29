import type { Mission } from "@/types/productai";
import type { MissionPlanRecord } from "@/lib/director/missionPlan";
import { specificationIdFromMission } from "@/lib/architect/architectWorkspace";
import { artifactIdForReview } from "@/lib/review/reviewComments";
import { getCommentsForArtifact } from "@/lib/review/reviewComments";

export interface TechnicalSpecificationRecord {
  specificationId: string;
  missionId: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  architectureSummary: string;
  constraints: string[];
  assumptions: string[];
  openQuestions: string[];
  createdAt: string;
  updatedAt: string;
  artifactReviewHref: string;
}

export function buildTechnicalSpecificationRecord(input: {
  mission: Mission;
  missionPlan: MissionPlanRecord;
}): TechnicalSpecificationRecord {
  const { mission, missionPlan } = input;
  const artifactId = artifactIdForReview(mission.id, "technical_specification");
  const comments = getCommentsForArtifact(artifactId);

  const openQuestions: string[] = [];
  comments
    .filter((c) => c.severity === "concern" || c.severity === "suggestion")
    .forEach((c) => openQuestions.push(`${c.title}: ${c.comment}`));

  if (mission.blockers.length) {
    openQuestions.push(`Mission blockers: ${mission.blockers.join("; ")}`);
  }
  if (!openQuestions.length) {
    openQuestions.push("No open architecture questions recorded—confirm auth and data boundaries with Director.");
  }

  return {
    specificationId: specificationIdFromMission(mission.id),
    missionId: mission.id,
    title: `${mission.name} — Technical Specification`,
    problemStatement: missionPlan.objective,
    proposedSolution: missionPlan.scopeSummary,
    architectureSummary: mission.architectureSummary || missionPlan.scopeSummary,
    constraints: [
      "Human authorization required before implementation boundaries.",
      "No autonomous code generation or repository changes from ProductAI.",
      ...missionPlan.risks.slice(0, 2),
    ],
    assumptions: missionPlan.assumptions,
    openQuestions,
    createdAt: missionPlan.createdAt,
    updatedAt: mission.updatedAt,
    artifactReviewHref: `/artifact-review?mission=${mission.id}&artifact=${artifactId}`,
  };
}
