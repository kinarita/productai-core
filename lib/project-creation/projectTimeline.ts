import type { Mission } from "@/types/productai";
import { inferProductLifecycleStage } from "@/lib/lifecycle/lifecycleAnalysis";
import type { ReleaseItem } from "@/types/productai";
import type { ProjectTimelineStage, ProjectTimelineStageId } from "@/lib/project-creation/projectCreationTypes";

const stageOrder: ProjectTimelineStageId[] = [
  "idea",
  "planning",
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
  planning: "Planning",
  architecture: "Architecture",
  design: "Design",
  build: "Build",
  qa: "QA",
  release: "Release",
};

export function buildProjectTimeline(input: {
  mission: Mission;
  releases?: ReleaseItem[];
}): ProjectTimelineStage[] {
  const current = lifecycleToTimeline[
    inferProductLifecycleStage({
      mission: input.mission,
      releases: input.releases ?? [],
      signalCount: 0,
    })
  ] ?? "planning";

  const currentIndex = stageOrder.indexOf(current);

  return stageOrder.map((id, index) => ({
    id,
    label: stageLabels[id],
    state:
      index < currentIndex
        ? ("done" as const)
        : index === currentIndex
          ? ("current" as const)
          : ("upcoming" as const),
  }));
}
