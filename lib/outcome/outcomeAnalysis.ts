import type {
  Mission,
  Task,
  MemoryItem,
  OrganizationFeedItem,
  ReleaseItem,
  PullRequest,
} from "@/types/productai";
import type { OutcomeStatusId } from "@/lib/outcome/outcomeWorkspace";
import { outcomeStatusLabel } from "@/lib/outcome/outcomeWorkspace";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";

export interface OutcomeMissionRow {
  missionId: string;
  missionName: string;
  releaseState: string;
  releaseDate: string;
  outcomeStatus: OutcomeStatusId;
  outcomeStatusLabel: string;
  outcomeSignalsCount: number;
  outcomeNotes: string;
  reviewContinuity: string;
  updatedAt: string;
}

export function inferOutcomeStatus(input: {
  mission: Mission;
  releases: ReleaseItem[];
  signalCount: number;
  memoryCount: number;
}): OutcomeStatusId {
  const production = input.releases.find(
    (r) => r.relatedMissionId === input.mission.id && r.state === "production"
  );
  if (input.mission.status === "completed" && !production) return "archived";
  if (!production && input.signalCount === 0) return "not_observed";
  if (production && input.signalCount >= 4 && input.memoryCount >= 1) return "validated_outcome";
  if (production && input.signalCount >= 2) return "early_signals";
  if (production || input.signalCount > 0) return "observation_started";
  return "not_observed";
}

export function buildOutcomeMissionRow(input: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
}): OutcomeMissionRow {
  const release = input.releases.find((r) => r.relatedMissionId === input.mission.id);
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  const missionMemories = input.memories.filter((m) => m.relatedMissionId === input.mission.id);
  const status = inferOutcomeStatus({
    mission: input.mission,
    releases: input.releases,
    signalCount: signals.length,
    memoryCount: missionMemories.length,
  });

  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const review = buildReviewStatusSummary(missionTasks);
  const reviewContinuity =
    review.reviewCompleted > 0
      ? `${review.reviewCompleted} review(s) completed · continuity reading suggested`
      : "Review continuity not yet established";

  let outcomeNotes = "Outcome observation not yet started.";
  if (status === "observation_started") {
    outcomeNotes = "This mission has entered outcome observation.";
  }
  if (status === "early_signals") {
    outcomeNotes = "Early outcome signals recorded for coordination reading.";
  }
  if (status === "validated_outcome") {
    outcomeNotes = "Outcome signals and reflection notes support validated outcome reading.";
  }

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    releaseState: release ? `${release.state} · v${release.version}` : "Not released",
    releaseDate: release?.deployedAt ?? (release?.state === "candidate" ? "Candidate" : "—"),
    outcomeStatus: status,
    outcomeStatusLabel: outcomeStatusLabel(status),
    outcomeSignalsCount: signals.length,
    outcomeNotes,
    reviewContinuity,
    updatedAt: input.mission.updatedAt,
  };
}

export function buildOutcomeMissionBoard(input: {
  missions: Mission[];
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
  missionId?: string | null;
  statusFilter?: OutcomeStatusId | null;
}) {
  const filtered = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;

  return filtered
    .map((mission) =>
      buildOutcomeMissionRow({
        mission,
        tasks: input.tasks,
        memories: input.memories,
        feedItems: input.feedItems,
        releases: input.releases,
        pullRequests: input.pullRequests,
      })
    )
    .filter((row) => !input.statusFilter || row.outcomeStatus === input.statusFilter)
    .sort((a, b) => b.outcomeSignalsCount - a.outcomeSignalsCount);
}
