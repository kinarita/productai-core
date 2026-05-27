import { branches, memories, pullRequests, releases, tasks } from "@/data/mockData";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import type { Decision, Mission, OrganizationFeedItem, RuntimeCost } from "@/types/productai";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";

export interface MissionActivityItem {
  id: string;
  source: "feed" | "decision" | "runtime" | "mission";
  timestamp: string;
  message: string;
  meta?: string;
}

export interface RuntimeSignal {
  id: string;
  message: string;
  severity: "info" | "warning" | "danger";
}

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

export function getTasksForMissionId(missionId: string) {
  return tasks.filter((t) => t.missionId === missionId);
}

export function getMemoriesForMissionId(mission: Mission) {
  return memories.filter((m) => mission.memoryInsightIds.includes(m.id));
}

export function getBranchesForMissionId(mission: Mission) {
  return branches.filter((b) => mission.relatedBranches.includes(b.name));
}

export function getPullRequestsForMissionId(mission: Mission) {
  return pullRequests.filter((pr) => mission.relatedPullRequests.includes(pr.id));
}

export function getReleaseForMissionId(missionId: string) {
  return releases.find(
    (r) => r.relatedMissionId === missionId && r.state !== "production"
  );
}

export function buildMissionRecentActivity(
  mission: Mission,
  feed: OrganizationFeedItem[],
  decisions: Decision[],
  alerts: RuntimeAlert[]
): MissionActivityItem[] {
  const items: MissionActivityItem[] = [];

  feed.slice(0, 8).forEach((f) => {
    items.push({
      id: f.id,
      source: "feed",
      timestamp: f.timestamp,
      message: f.message,
      meta: `${f.authorName} (${f.author})`,
    });
  });

  decisions
    .filter((d) => d.status !== "pending")
    .forEach((d) => {
      items.push({
        id: `decision-${d.id}`,
        source: "decision",
        timestamp: "Recent",
        message: `Decision ${d.status}: ${d.title}`,
        meta: d.missionName,
      });
    });

  alerts.slice(0, 3).forEach((a) => {
    items.push({
      id: `runtime-${a.id}`,
      source: "runtime",
      timestamp: a.timestamp,
      message: a.message,
      meta: "Runtime",
    });
  });

  items.unshift({
    id: "mission-latest",
    source: "mission",
    timestamp: mission.updatedAt,
    message: mission.recentActivity,
    meta: "Mission update",
  });

  return items.slice(0, 12);
}

export function getRuntimeSignalsForMission(
  missionId: string,
  providerHealth: { provider: string; health: RuntimeCost["health"] }[],
  alerts: RuntimeAlert[]
): RuntimeSignal[] {
  const signals: RuntimeSignal[] = providerHealth.map((p) => ({
    id: `ph-${p.provider}`,
    message:
      p.health === "healthy"
        ? `${p.provider}: operational`
        : p.health === "degraded"
          ? `${p.provider}: elevated latency`
          : `${p.provider}: unavailable`,
    severity:
      p.health === "healthy" ? "info" : p.health === "degraded" ? "warning" : "danger",
  }));

  alerts.slice(0, 2).forEach((a) => {
    signals.push({
      id: a.id,
      message: a.message,
      severity: a.severity,
    });
  });

  if (missionId === "m-2") {
    const claude = providerHealth.find((p) => p.provider.includes("Claude"));
    if (claude?.health === "degraded") {
      signals.unshift({
        id: "mission-claude",
        message: "Claude latency may affect analytics summarization tasks",
        severity: "warning",
      });
    }
  }

  return signals.slice(0, 5);
}
