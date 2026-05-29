import type { Mission, Task, MemoryItem, OrganizationFeedItem, ReleaseItem } from "@/types/productai";
import type { OutcomeSignalTypeId } from "@/lib/outcome/outcomeWorkspace";
import { outcomeSignalLabel } from "@/lib/outcome/outcomeWorkspace";

export interface OutcomeSignal {
  id: string;
  missionId: string;
  type: OutcomeSignalTypeId;
  typeLabel: string;
  message: string;
  source: string;
  timestamp: string;
}

export function buildOutcomeSignals(input: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
}): OutcomeSignal[] {
  const signals: OutcomeSignal[] = [];
  const missionId = input.mission.id;

  const qaTasks = input.tasks.filter((t) => t.missionId === missionId && t.assignedTo === "QA");
  for (const task of qaTasks.filter((t) => t.status === "completed")) {
    signals.push({
      id: `sig-qa-${task.id}`,
      missionId,
      type: "qa_feedback",
      typeLabel: outcomeSignalLabel("qa_feedback"),
      message: `QA completed: ${task.title}`,
      source: "task",
      timestamp: task.updatedAt ?? task.eta,
    });
  }

  for (const mem of input.memories.filter((m) => m.relatedMissionId === missionId)) {
    const type: OutcomeSignalTypeId =
      mem.category === "learning" || mem.category === "pattern"
        ? "mission_reflection"
        : mem.category === "incident"
          ? "release_follow_up"
          : "internal_review";
    signals.push({
      id: `sig-mem-${mem.id}`,
      missionId,
      type,
      typeLabel: outcomeSignalLabel(type),
      message: mem.summary,
      source: "memory",
      timestamp: mem.createdAt,
    });
  }

  const outcomeFeed = input.feedItems.filter(
    (f) =>
      f.missionId === missionId &&
      (f.type.startsWith("outcome_") ||
        f.type === "release_ready" ||
        f.type === "qa_review" ||
        f.type === "decision_attention_reviewed")
  );
  for (const item of outcomeFeed.slice(0, 6)) {
    let type: OutcomeSignalTypeId = "internal_review";
    if (item.type.includes("outcome")) type = "release_follow_up";
    if (item.author === "CEO" || item.type.includes("executive")) type = "executive_review";
    if (item.type === "qa_review") type = "qa_feedback";
    signals.push({
      id: `sig-feed-${item.id}`,
      missionId,
      type,
      typeLabel: outcomeSignalLabel(type),
      message: item.message,
      source: "feed",
      timestamp: item.timestamp,
    });
  }

  const release = input.releases.find((r) => r.relatedMissionId === missionId);
  if (release?.state === "production") {
    signals.push({
      id: `sig-release-${release.id}`,
      missionId,
      type: "release_follow_up",
      typeLabel: outcomeSignalLabel("release_follow_up"),
      message: `Production release v${release.version} — outcome observation may follow.`,
      source: "release",
      timestamp: release.deployedAt ?? "Recent",
    });
  }

  if (input.mission.recentActivity && release?.state === "production") {
    signals.push({
      id: `sig-user-${missionId}`,
      missionId,
      type: "user_feedback",
      typeLabel: outcomeSignalLabel("user_feedback"),
      message: "Additional feedback may improve outcome visibility.",
      source: "mission",
      timestamp: input.mission.updatedAt,
    });
  }

  return signals.slice(0, 10);
}
