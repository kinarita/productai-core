import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import { buildLifecycleStageBoard } from "@/lib/lifecycle/lifecycleAnalysis";
import { inferProductLifecycleStage } from "@/lib/lifecycle/lifecycleAnalysis";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { inferOutcomeStatus } from "@/lib/outcome/outcomeAnalysis";

export interface LifecycleOverviewSummary {
  ideas: number;
  activePlanning: number;
  developmentMissions: number;
  qaMissions: number;
  releaseReady: number;
  released: number;
  observedOutcomes: number;
  advisoryNote: string;
}

export function buildLifecycleOverviewSummary(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}): LifecycleOverviewSummary {
  const board = buildLifecycleStageBoard(input);

  const count = (stage: ProductLifecycleStageId) =>
    board.find((b) => b.stage === stage)?.missions.length ?? 0;

  let observedOutcomes = 0;
  for (const mission of input.missions) {
    const signals = buildOutcomeSignals({
      mission,
      tasks: input.tasks,
      memories: input.memories,
      feedItems: input.feedItems,
      releases: input.releases,
    });
    const status = inferOutcomeStatus({
      mission,
      releases: input.releases,
      signalCount: signals.length,
      memoryCount: input.memories.filter((m) => m.relatedMissionId === mission.id).length,
    });
    if (
      status === "observation_started" ||
      status === "early_signals" ||
      status === "validated_outcome"
    ) {
      observedOutcomes += 1;
    }
  }

  return {
    ideas: count("idea"),
    activePlanning: count("planning") + count("direction"),
    developmentMissions: count("development") + count("architecture") + count("design"),
    qaMissions: count("qa"),
    releaseReady: count("release"),
    released: input.releases.filter((r) => r.state === "production").length,
    observedOutcomes,
    advisoryNote:
      "This lifecycle view provides context across the product journey—integrated from existing workspaces.",
  };
}
