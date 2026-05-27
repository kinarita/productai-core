import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import type { Decision, Mission, OrganizationFeedItem } from "@/types/productai";

export function getMissionFromStore(missionId: string): Mission | undefined {
  return useMissionStore.getState().missions.find((m) => m.id === missionId);
}

export function getDecisionsForMissionId(missionId: string): Decision[] {
  const mission = getMissionFromStore(missionId);
  if (!mission) return [];
  return useOrganizationStore
    .getState()
    .decisions.filter((d) => d.relatedMissionId === missionId);
}

export function getFeedForMissionId(missionId: string): OrganizationFeedItem[] {
  return useOrganizationStore
    .getState()
    .organizationFeedItems.filter((f) => f.missionId === missionId);
}
