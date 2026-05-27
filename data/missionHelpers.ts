import {
  branches,
  decisions as mockDecisions,
  memories,
  missions as mockMissions,
  organizationFeedItems,
  pullRequests,
  releases,
  tasks,
} from "@/data/mockData";
import type {
  Branch,
  Decision,
  MemoryItem,
  Mission,
  OrganizationFeedItem,
  PullRequest,
  ReleaseItem,
  Task,
} from "@/types/productai";

function getMissionsSource(): Mission[] {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMissionStore } = require("@/lib/store/missionStore") as typeof import("@/lib/store/missionStore");
    return useMissionStore.getState().missions;
  }
  return mockMissions;
}

function getDecisionsSource(): Decision[] {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useOrganizationStore } = require("@/lib/store/organizationStore") as typeof import("@/lib/store/organizationStore");
    return useOrganizationStore.getState().decisions;
  }
  return mockDecisions;
}

function getFeedSource(): OrganizationFeedItem[] {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useOrganizationStore } = require("@/lib/store/organizationStore") as typeof import("@/lib/store/organizationStore");
    return useOrganizationStore.getState().organizationFeedItems;
  }
  return organizationFeedItems;
}

export function getMissionById(missionId: string): Mission | undefined {
  return getMissionsSource().find((m) => m.id === missionId);
}

export function getTasksForMission(mission: Mission): Task[] {
  return tasks.filter((t) => mission.taskIds.includes(t.id));
}

export function getDecisionsForMission(mission: Mission): Decision[] {
  return getDecisionsSource().filter((d) => mission.decisionIds.includes(d.id));
}

export function getMemoriesForMission(mission: Mission): MemoryItem[] {
  return memories.filter((m) => mission.memoryInsightIds.includes(m.id));
}

export function getBranchesForMission(mission: Mission): Branch[] {
  return branches.filter((b) => mission.relatedBranches.includes(b.name));
}

export function getPullRequestsForMission(mission: Mission): PullRequest[] {
  return pullRequests.filter((pr) => mission.relatedPullRequests.includes(pr.id));
}

export function getActivitiesForMission(mission: Mission): OrganizationFeedItem[] {
  return getFeedSource().filter((f) => mission.activityIds.includes(f.id));
}

export function getReleaseForMission(mission: Mission): ReleaseItem | undefined {
  return releases.find(
    (r) => r.relatedMissionId === mission.id && r.state !== "production"
  );
}

export function getMissionNameById(missionId: string): string | undefined {
  return getMissionById(missionId)?.name;
}
