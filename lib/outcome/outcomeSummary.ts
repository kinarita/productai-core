import type {
  Mission,
  Task,
  MemoryItem,
  OrganizationFeedItem,
  ReleaseItem,
  PullRequest,
} from "@/types/productai";
import type { OutcomeStatusId } from "@/lib/outcome/outcomeWorkspace";
import { buildOutcomeMissionBoard } from "@/lib/outcome/outcomeAnalysis";

export interface OutcomeOverviewSummary {
  releasedMissions: number;
  observedOutcomes: number;
  validatedOutcomes: number;
  activeFollowUps: number;
  outcomeSignals: number;
  advisoryNote: string;
}

export function buildOutcomeOverviewSummary(input: {
  missions: Mission[];
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
}): OutcomeOverviewSummary {
  const board = buildOutcomeMissionBoard(input);
  const releasedMissions = input.releases.filter(
    (r) => r.state === "production" || r.state === "candidate"
  ).length;

  const observed = board.filter(
    (r) =>
      r.outcomeStatus === "observation_started" ||
      r.outcomeStatus === "early_signals" ||
      r.outcomeStatus === "validated_outcome"
  ).length;

  const validated = board.filter((r) => r.outcomeStatus === "validated_outcome").length;
  const followUps = board.filter(
    (r) => r.outcomeStatus === "early_signals" || r.outcomeStatus === "observation_started"
  ).length;
  const signalTotal = board.reduce((sum, r) => sum + r.outcomeSignalsCount, 0);

  return {
    releasedMissions,
    observedOutcomes: observed,
    validatedOutcomes: validated,
    activeFollowUps: followUps,
    outcomeSignals: signalTotal,
    advisoryNote:
      "Code & Release overview supports post-release outcome reading—no automatic validation or deploy.",
  };
}

export function countByOutcomeStatus(
  board: ReturnType<typeof buildOutcomeMissionBoard>
): Record<OutcomeStatusId, number> {
  const counts: Record<OutcomeStatusId, number> = {
    not_observed: 0,
    observation_started: 0,
    early_signals: 0,
    validated_outcome: 0,
    archived: 0,
  };
  for (const row of board) {
    counts[row.outcomeStatus] += 1;
  }
  return counts;
}
