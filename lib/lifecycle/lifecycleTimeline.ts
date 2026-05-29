import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import { lifecycleStageLabel, productLifecycleStages } from "@/lib/lifecycle/productLifecycle";
import { buildMissionLifecycleView, inferProductLifecycleStage } from "@/lib/lifecycle/lifecycleAnalysis";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";

export interface LifecycleTimelineStep {
  stage: ProductLifecycleStageId;
  label: string;
  status: "completed" | "current" | "upcoming";
  detail: string;
}

export function buildLifecycleTimeline(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}): LifecycleTimelineStep[] {
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  const current = inferProductLifecycleStage({
    mission: input.mission,
    releases: input.releases,
    signalCount: signals.length,
  });
  const currentIndex = productLifecycleStages.findIndex((s) => s.id === current);
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const release = input.releases.find((r) => r.relatedMissionId === input.mission.id);

  return productLifecycleStages.map((stage, index) => {
    let detail = "Upcoming in the product journey.";
    if (index < currentIndex) detail = "Stage completed for coordination reading.";
    if (index === currentIndex) {
      detail = buildMissionLifecycleView(input).progressNote;
    }
    if (stage.id === "development" && missionTasks.length > 0) {
      detail = `${missionTasks.filter((t) => t.status === "active").length} active task(s)`;
    }
    if (stage.id === "release" && release) {
      detail = `${release.state} · v${release.version}`;
    }
    if (stage.id === "outcome" && signals.length > 0) {
      detail = `${signals.length} outcome signal(s) recorded`;
    }

    return {
      stage: stage.id,
      label: lifecycleStageLabel(stage.id),
      status:
        index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
      detail,
    };
  });
}

export function buildMissionLifecycleContext(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}) {
  const view = buildMissionLifecycleView(input);
  const timeline = buildLifecycleTimeline(input);
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });

  return {
    view,
    timeline,
    signalCount: signals.length,
    advisoryNote:
      "Lifecycle context integrates COO, delivery, repository, release, and outcome workspaces—no automatic stage advancement.",
  };
}
