import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import {
  lifecycleStageLabel,
  lifecycleStageIndex,
  previousLifecycleStage,
  productLifecycleStages,
} from "@/lib/lifecycle/productLifecycle";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { inferOutcomeStatus } from "@/lib/outcome/outcomeAnalysis";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";

const workflowToLifecycle: Record<string, ProductLifecycleStageId> = {
  ceo_idea: "idea",
  product_planning: "planning",
  ceo_authorization: "planning",
  mission_direction: "direction",
  architecture: "architecture",
  design: "design",
  development: "development",
  qa: "qa",
  release: "release",
  reflection: "outcome",
};

export interface MissionLifecycleView {
  missionId: string;
  missionName: string;
  currentStage: ProductLifecycleStageId;
  currentStageLabel: string;
  previousStage: ProductLifecycleStageId | null;
  previousStageLabel: string | null;
  relatedTasks: string[];
  relatedReviews: string;
  relatedRepository: string;
  relatedRelease: string;
  relatedOutcome: string;
  progressNote: string;
  updatedAt: string;
}

export function inferProductLifecycleStage(input: {
  mission: Mission;
  releases: ReleaseItem[];
  signalCount: number;
}): ProductLifecycleStageId {
  const production = input.releases.find(
    (r) => r.relatedMissionId === input.mission.id && r.state === "production"
  );
  const candidate = input.releases.find(
    (r) =>
      r.relatedMissionId === input.mission.id &&
      (r.state === "candidate" || r.state === "staging")
  );

  if (production && (input.signalCount > 0 || input.mission.lifecycle === "Release")) {
    return "outcome";
  }
  if (production || candidate || input.mission.lifecycle === "Release") {
    return "release";
  }

  const workflow = inferMissionWorkflowStage(input.mission);
  return workflowToLifecycle[workflow] ?? "direction";
}

export function buildMissionLifecycleView(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}): MissionLifecycleView {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  const missionMemories = input.memories.filter((m) => m.relatedMissionId === input.mission.id);
  const currentStage = inferProductLifecycleStage({
    mission: input.mission,
    releases: input.releases,
    signalCount: signals.length,
  });
  const prev = previousLifecycleStage(currentStage);
  const review = buildReviewStatusSummary(missionTasks);
  const repository = buildRepositoryStatusSummary({
    mission: input.mission,
    tasks: missionTasks,
    pullRequests: input.pullRequests,
  });
  const release = input.releases.find((r) => r.relatedMissionId === input.mission.id);
  const outcomeStatus = inferOutcomeStatus({
    mission: input.mission,
    releases: input.releases,
    signalCount: signals.length,
    memoryCount: missionMemories.length,
  });

  let progressNote = `This mission is currently progressing through the ${lifecycleStageLabel(currentStage).toLowerCase()} stage.`;
  if (currentStage === "outcome") {
    progressNote = "This mission has reached outcome observation—continuity reading suggested.";
  }

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentStage,
    currentStageLabel: lifecycleStageLabel(currentStage),
    previousStage: prev,
    previousStageLabel: prev ? lifecycleStageLabel(prev) : null,
    relatedTasks: missionTasks.map((t) => t.title).slice(0, 5),
    relatedReviews: `${review.inReview} in review · ${review.reviewCompleted} completed`,
    relatedRepository: repository.missionStateLabel,
    relatedRelease: release ? `${release.state} · v${release.version}` : "Not released",
    relatedOutcome: outcomeStatus.replaceAll("_", " "),
    progressNote,
    updatedAt: input.mission.updatedAt,
  };
}

export function buildLifecycleStageBoard(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}) {
  const buckets = productLifecycleStages.map((stage) => ({
    stage: stage.id,
    title: stage.title,
    missions: [] as { missionId: string; missionName: string; progress: number }[],
  }));

  for (const mission of input.missions) {
    const signals = buildOutcomeSignals({
      mission,
      tasks: input.tasks,
      memories: input.memories,
      feedItems: input.feedItems,
      releases: input.releases,
    });
    const stage = inferProductLifecycleStage({
      mission,
      releases: input.releases,
      signalCount: signals.length,
    });
    const bucket = buckets.find((b) => b.stage === stage);
    if (bucket) {
      bucket.missions.push({
        missionId: mission.id,
        missionName: mission.name,
        progress: mission.progress,
      });
    }
  }

  return buckets;
}

export function buildLifecycleJourney(input: {
  mission: Mission;
  releases: ReleaseItem[];
  signalCount: number;
}): { stage: ProductLifecycleStageId; label: string; status: "completed" | "current" | "upcoming" }[] {
  const current = inferProductLifecycleStage({
    mission: input.mission,
    releases: input.releases,
    signalCount: input.signalCount,
  });
  const currentIndex = lifecycleStageIndex(current);

  return productLifecycleStages.map((stage, index) => ({
    stage: stage.id,
    label: stage.title,
    status:
      index < currentIndex ? ("completed" as const) : index === currentIndex ? ("current" as const) : ("upcoming" as const),
  }));
}
