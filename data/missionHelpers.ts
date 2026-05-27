import {
  branches,
  decisions,
  memories,
  missions,
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

export function getMissionById(missionId: string): Mission | undefined {
  return missions.find((m) => m.id === missionId);
}

export function getMissionNameById(missionId: string): string | undefined {
  return getMissionById(missionId)?.name;
}

export function getTasksForMission(mission: Mission): Task[] {
  return tasks.filter((t) => mission.taskIds.includes(t.id));
}

export function getDecisionsForMission(mission: Mission): Decision[] {
  return decisions.filter((d) => mission.decisionIds.includes(d.id));
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
  return organizationFeedItems.filter((f) => mission.activityIds.includes(f.id));
}

export function getReleaseForMission(mission: Mission): ReleaseItem | undefined {
  return releases.find(
    (r) => r.relatedMissionId === mission.id && r.state !== "production"
  );
}
