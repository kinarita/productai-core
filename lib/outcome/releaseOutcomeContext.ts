import type {
  Mission,
  Task,
  MemoryItem,
  OrganizationFeedItem,
  ReleaseItem,
  PullRequest,
} from "@/types/productai";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { buildOutcomeMissionRow } from "@/lib/outcome/outcomeAnalysis";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildReleaseChecklist } from "@/lib/release/releaseChecklist";

export interface OutcomeTimelineEvent {
  id: string;
  phase: "release" | "feedback" | "review" | "follow_up" | "reflection";
  label: string;
  detail: string;
  timestamp: string;
}

export interface ReleaseOutcomeContext {
  releaseContext: string;
  reviewContext: string;
  outcomeContext: string;
  reflectionContext: string;
  advisoryNote: string;
}

export function buildOutcomeTimeline(input: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
}): OutcomeTimelineEvent[] {
  const events: OutcomeTimelineEvent[] = [];
  const missionId = input.mission.id;

  const release = input.releases.find((r) => r.relatedMissionId === missionId);
  if (release) {
    events.push({
      id: `tl-release-${release.id}`,
      phase: "release",
      label: "Mission Release",
      detail: `v${release.version} · ${release.state} on ${release.branch}`,
      timestamp: release.deployedAt ?? "Recent",
    });
  }

  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  for (const sig of signals.filter((s) => s.type === "user_feedback" || s.type === "qa_feedback")) {
    events.push({
      id: `tl-fb-${sig.id}`,
      phase: "feedback",
      label: sig.typeLabel,
      detail: sig.message,
      timestamp: sig.timestamp,
    });
  }

  const reviewFeed = input.feedItems.filter(
    (f) => f.missionId === missionId && (f.type.includes("review") || f.type === "qa_review")
  );
  for (const item of reviewFeed.slice(0, 2)) {
    events.push({
      id: `tl-review-${item.id}`,
      phase: "review",
      label: "Review",
      detail: item.message,
      timestamp: item.timestamp,
    });
  }

  for (const sig of signals.filter((s) => s.type === "release_follow_up")) {
    events.push({
      id: `tl-follow-${sig.id}`,
      phase: "follow_up",
      label: "Follow-up",
      detail: sig.message,
      timestamp: sig.timestamp,
    });
  }

  for (const mem of input.memories.filter((m) => m.relatedMissionId === missionId).slice(0, 2)) {
    events.push({
      id: `tl-reflect-${mem.id}`,
      phase: "reflection",
      label: "Reflection",
      detail: mem.title,
      timestamp: mem.createdAt,
    });
  }

  return events;
}

export function buildReleaseOutcomeContext(input: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
}): ReleaseOutcomeContext {
  const row = buildOutcomeMissionRow(input);
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const review = buildReviewStatusSummary(missionTasks);
  const checklist = buildReleaseChecklist({
    mission: input.mission,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
  });
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  const reflections = input.memories.filter((m) => m.relatedMissionId === input.mission.id);

  const releaseContext = `${row.releaseState} · ${row.releaseDate}`;
  const reviewContext = `${review.reviewCompleted} completed · ${review.inReview} in review · checklist ${checklist.filter((c) => c.status === "complete").length}/7`;
  const outcomeContext = `${row.outcomeStatusLabel} · ${signals.length} signal(s) · ${row.outcomeNotes}`;
  const reflectionContext =
    reflections.length > 0
      ? reflections.map((m) => m.title).slice(0, 2).join("; ")
      : "Mission reflection may benefit from additional follow-up reading.";

  return {
    releaseContext,
    reviewContext,
    outcomeContext,
    reflectionContext,
    advisoryNote:
      "Release outcome context links release, review, and reflection for product-focused reading—not automatic approval.",
  };
}

export function buildMissionOutcomeContext(input: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
}) {
  const row = buildOutcomeMissionRow(input);
  const signals = buildOutcomeSignals({
    mission: input.mission,
    tasks: input.tasks,
    memories: input.memories,
    feedItems: input.feedItems,
    releases: input.releases,
  });
  const releaseOutcome = buildReleaseOutcomeContext(input);

  return {
    row,
    signals,
    releaseOutcome,
    followUpNotes: signals
      .filter((s) => s.type === "release_follow_up" || s.type === "mission_reflection")
      .map((s) => s.message)
      .slice(0, 4),
    advisoryNote:
      "Outcome context supports post-release product reading—no deploy or automatic validation.",
  };
}
