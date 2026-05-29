import type { Mission, Task } from "@/types/productai";
import type { CooBottleneckObservation } from "@/lib/coo/cooBottleneckDetection";
import { mapMissionToCooStage } from "@/lib/coo/cooMissionAnalysis";
import { getCooPipelineStage } from "@/lib/coo/cooWorkspace";

export interface CooRecommendation {
  id: string;
  category:
    | "review_area"
    | "follow_up"
    | "coordination"
    | "cross_team_dependency";
  title: string;
  detail: string;
}

export interface CooRecommendationsBundle {
  recommendedReviewAreas: CooRecommendation[];
  suggestedFollowUp: CooRecommendation[];
  missionsRequiringCoordination: CooRecommendation[];
  crossTeamDependencies: CooRecommendation[];
  advisoryNote: string;
}

export function buildCooRecommendations(input: {
  missions: Mission[];
  tasks: Task[];
  bottlenecks: CooBottleneckObservation[];
}): CooRecommendationsBundle {
  const active = input.missions.filter((m) => m.status === "active" || m.status === "planning");

  const recommendedReviewAreas: CooRecommendation[] = input.bottlenecks
    .filter((b) => b.severity === "review_suggested")
    .slice(0, 5)
    .map((b) => ({
      id: `rec-review-${b.id}`,
      category: "review_area" as const,
      title: b.label,
      detail: b.detail,
    }));

  if (recommendedReviewAreas.length === 0 && active.length > 0) {
    recommendedReviewAreas.push({
      id: "rec-review-default",
      category: "review_area",
      title: "Mission continuity reading",
      detail: "Active missions appear distributed across stages. Periodic executive review reading is suggested.",
    });
  }

  const suggestedFollowUp: CooRecommendation[] = active
    .filter((m) => m.blockers.length > 0)
    .slice(0, 4)
    .map((m) => ({
      id: `rec-follow-${m.id}`,
      category: "follow_up" as const,
      title: `Follow-up: ${m.name}`,
      detail: `Open blockers may benefit from coordination reading: ${m.blockers.slice(0, 2).join("; ")}.`,
    }));

  const missionsRequiringCoordination: CooRecommendation[] = active
    .filter((m) => {
      const stage = mapMissionToCooStage(m);
      return stage === "planning" || stage === "direction" || stage === "architecture";
    })
    .slice(0, 5)
    .map((m) => {
      const stage = mapMissionToCooStage(m);
      return {
        id: `rec-coord-${m.id}`,
        category: "coordination" as const,
        title: `${m.name} · ${getCooPipelineStage(stage).title}`,
        detail: `${m.name} may benefit from additional ${stage} coordination across Mission Team roles.`,
      };
    });

  const crossTeamDependencies: CooRecommendation[] = input.tasks
    .filter((t) => t.dependencies.length > 1 && t.status !== "completed")
    .slice(0, 5)
    .map((t) => ({
      id: `rec-dep-${t.id}`,
      category: "cross_team_dependency" as const,
      title: t.title,
      detail: `Cross-team dependency visibility: ${t.dependencies.slice(0, 3).join(", ")} (${t.missionName}).`,
    }));

  return {
    recommendedReviewAreas,
    suggestedFollowUp,
    missionsRequiringCoordination,
    crossTeamDependencies,
    advisoryNote:
      "Recommendations are advisory coordination notes—not prioritization or execution directives.",
  };
}
