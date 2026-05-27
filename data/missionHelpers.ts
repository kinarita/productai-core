/**
 * Store-aware mission utilities.
 * Server: seed mock data. Client: Zustand persisted state.
 */
import {
  branches,
  decisions as seedDecisions,
  memories,
  missions as seedMissions,
  organizationFeedItems as seedFeed,
  pullRequests,
  releases,
  tasks,
} from "@/data/mockData";
import {
  buildMissionRecentActivity,
  getBranchesForMissionId,
  getMemoriesForMissionId,
  getPullRequestsForMissionId,
  getReleaseForMissionId,
  getRuntimeSignalsForMission,
  getTasksForMissionId,
  type MissionActivityItem,
  type RuntimeSignal,
} from "@/lib/mission/missionDetailData";
import {
  getDecisionsForMissionId,
  getFeedForMissionId,
  getMissionFromStore,
} from "@/lib/mission/missionDetailStore";
import type { Mission } from "@/types/productai";

export type { MissionActivityItem, RuntimeSignal };

export {
  buildMissionRecentActivity,
  getRuntimeSignalsForMission,
};

function isClient() {
  return typeof window !== "undefined";
}

export function getMissionById(missionId: string): Mission | undefined {
  if (isClient()) {
    return getMissionFromStore(missionId);
  }
  return seedMissions.find((m) => m.id === missionId);
}

export function getMissionNameById(missionId: string): string | undefined {
  return getMissionById(missionId)?.name;
}

export function getTasksForMission(mission: Mission) {
  if (isClient()) {
    return getTasksForMissionId(mission.id);
  }
  return tasks.filter((t) => t.missionId === mission.id);
}

export function getDecisionsForMission(mission: Mission) {
  if (isClient()) {
    return getDecisionsForMissionId(mission.id);
  }
  return seedDecisions.filter((d) => mission.decisionIds.includes(d.id));
}

export function getMemoriesForMission(mission: Mission) {
  return getMemoriesForMissionId(mission);
}

export function getBranchesForMission(mission: Mission) {
  return getBranchesForMissionId(mission);
}

export function getPullRequestsForMission(mission: Mission) {
  return getPullRequestsForMissionId(mission);
}

export function getActivitiesForMission(mission: Mission) {
  if (isClient()) {
    return getFeedForMissionId(mission.id);
  }
  return seedFeed.filter((f) => f.missionId === mission.id);
}

export function getReleaseForMission(mission: Mission) {
  return getReleaseForMissionId(mission.id);
}
