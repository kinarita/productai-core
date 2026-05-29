import type { Mission } from "@/types/productai";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import type { DesignSpecificationRecord } from "@/lib/designer/designSpecification";

export interface TechnicalRiskReviewView {
  technicalRisks: string[];
  complexityAreas: string[];
  integrationRisks: string[];
  dependencyRisks: string[];
  openTechnicalQuestions: string[];
}

export function buildTechnicalRiskReview(input: {
  mission: Mission;
  technicalSpec: TechnicalSpecificationRecord;
  designSpec: DesignSpecificationRecord;
}): TechnicalRiskReviewView {
  return {
    technicalRisks: input.technicalSpec.constraints.slice(0, 3),
    complexityAreas: [
      `Mission lifecycle: ${input.mission.lifecycle} at ${input.mission.progress}% progress.`,
      `Health: ${input.mission.health} — monitor during implementation planning.`,
      input.mission.architectureSummary.slice(0, 100),
    ],
    integrationRisks: input.mission.relatedPullRequests.length
      ? [`PR context: ${input.mission.relatedPullRequests.join(", ")}`]
      : ["No external PR integration flagged—internal planning scope only."],
    dependencyRisks: input.mission.blockers.length
      ? input.mission.blockers
      : ["No blockers recorded—confirm with Director and Architect."],
    openTechnicalQuestions: [
      ...input.technicalSpec.openQuestions.slice(0, 2),
      ...input.designSpec.designPrinciples.slice(0, 1).map((p) => `Design: ${p}`),
    ],
  };
}
