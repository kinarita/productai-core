import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";

function activityId(): string {
  return `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function nowLabel(): string {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ceoStartedDiscussionActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO started discussion",
    timestamp: nowLabel(),
  };
}

/** @deprecated use plannerRespondedToDiscussionActivity */
export function plannerRespondedActivity(missionId: string): ProjectActivityItem {
  return plannerRespondedToDiscussionActivity(missionId);
}

export function plannerRespondedToDiscussionActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Planner shared a concise take in discussion",
    timestamp: nowLabel(),
  };
}

/** @deprecated use cooRespondedToDiscussionActivity */
export function cooRespondedActivity(missionId: string): ProjectActivityItem {
  return cooRespondedToDiscussionActivity(missionId);
}

export function cooRespondedToDiscussionActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO Review",
    message: "COO shared a business perspective in discussion",
    timestamp: nowLabel(),
  };
}

/** @deprecated use suggestedChangeProposedActivity */
export function plannerSuggestedChangeActivity(missionId: string, title: string): ProjectActivityItem {
  return suggestedChangeProposedActivity(missionId, title);
}

export function suggestedChangeProposedActivity(
  missionId: string,
  title: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: `Suggested change proposed: ${title}`,
    timestamp: nowLabel(),
  };
}

/** @deprecated use suggestedChangeAppliedActivity */
export function ceoAppliedChangeActivity(missionId: string, _version: number): ProjectActivityItem {
  return suggestedChangeAppliedActivity(missionId, _version);
}

export function suggestedChangeAppliedActivity(
  missionId: string,
  version: number
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: `Suggested change applied (Brief v${version})`,
    timestamp: nowLabel(),
  };
}

export function briefUpdatedVersionActivity(missionId: string, version: number): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: `Brief updated to v${version} (CEO applied discussion change)`,
    timestamp: nowLabel(),
  };
}
