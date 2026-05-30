import type { Mission } from "@/types/productai";
import { inferProductLifecycleStage } from "@/lib/lifecycle/lifecycleAnalysis";
import type { PlannerRunStatus } from "@/lib/agents/planner/plannerTypes";
import type { PmfStage } from "@/lib/pmf/pmfJourney";
import type { ReleaseItem } from "@/types/productai";
import type { ProjectTimelineStage, ProjectTimelineStageId } from "@/lib/project-creation/projectCreationTypes";

const stageOrder: ProjectTimelineStageId[] = [
  "idea",
  "opportunity",
  "discovery",
  "clarification",
  "cpf",
  "psf",
  "mvp",
  "planning",
  "review",
  "architecture",
  "design",
  "build",
  "qa",
  "release",
];

const lifecycleToTimeline: Record<string, ProjectTimelineStageId> = {
  idea: "idea",
  planning: "planning",
  direction: "planning",
  architecture: "architecture",
  design: "design",
  development: "build",
  qa: "qa",
  release: "release",
  outcome: "release",
};

const stageLabels: Record<ProjectTimelineStageId, string> = {
  idea: "Idea",
  opportunity: "Opportunity",
  discovery: "Discovery",
  clarification: "Clarification",
  cpf: "Problem",
  psf: "Solution",
  mvp: "MVP",
  planning: "Planning",
  review: "Review",
  architecture: "Architecture",
  design: "Design",
  build: "Build",
  qa: "QA",
  release: "Release",
};

const pmfStageToTimeline: Record<PmfStage, ProjectTimelineStageId> = {
  idea_validation: "idea",
  opportunity_discovery: "opportunity",
  cpf: "cpf",
  psf: "psf",
  mvp: "mvp",
  pmf: "mvp",
};

function timelineStageFromPlanner(
  plannerStatus?: PlannerRunStatus,
  pmfStage?: PmfStage
): ProjectTimelineStageId | null {
  switch (plannerStatus) {
    case "assessing":
      return pmfStage ? pmfStageToTimeline[pmfStage] ?? "discovery" : "discovery";
    case "awaiting_clarification":
      return "clarification";
    case "working":
      return "planning";
    case "completed":
      return "review";
    default:
      return null;
  }
}

export function buildProjectTimeline(input: {
  mission: Mission;
  releases?: ReleaseItem[];
  plannerStatus?: PlannerRunStatus;
  pmfStage?: PmfStage;
}): ProjectTimelineStage[] {
  const fromPlanner = timelineStageFromPlanner(input.plannerStatus, input.pmfStage);
  const fromLifecycle =
    lifecycleToTimeline[
      inferProductLifecycleStage({
        mission: input.mission,
        releases: input.releases ?? [],
        signalCount: 0,
      })
    ] ?? "planning";

  const current = fromPlanner ?? fromLifecycle;
  const currentIndex = stageOrder.indexOf(current);
  const safeIndex = currentIndex >= 0 ? currentIndex : stageOrder.indexOf("planning");

  return stageOrder.map((id, index) => ({
    id,
    label: stageLabels[id],
    state:
      index < safeIndex
        ? ("done" as const)
        : index === safeIndex
          ? ("current" as const)
          : ("upcoming" as const),
  }));
}
