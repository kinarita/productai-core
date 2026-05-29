import type { Mission } from "@/types/productai";
import type { MissionPlanRecord } from "@/lib/director/missionPlan";

export interface DependencyDesignView {
  internalDependencies: string[];
  externalDependencies: string[];
  risks: string[];
  reviewAreas: string[];
}

export function buildDependencyDesign(input: {
  mission: Mission;
  missionPlan: MissionPlanRecord;
}): DependencyDesignView {
  const { mission, missionPlan } = input;
  return {
    internalDependencies: [
      ...missionPlan.dependencies,
      ...mission.taskIds.map((id) => `Task ${id}`),
      "Product Brief → Mission Plan → Technical Specification chain",
    ],
    externalDependencies: [
      ...(mission.relatedBranches.length
        ? mission.relatedBranches.map((b) => `Branch: ${b}`)
        : ["No external branch dependencies recorded"]),
      ...(mission.relatedPullRequests.length
        ? mission.relatedPullRequests.map((pr) => `PR: ${pr}`)
        : []),
    ],
    risks: missionPlan.risks.length ? missionPlan.risks : ["No risks escalated—monitor during design review."],
    reviewAreas: [
      "Authentication and session boundaries",
      "Data model alignment with Product Brief scope",
      "API surface vs. execution boundary",
      "Release readiness assumptions",
    ],
  };
}
