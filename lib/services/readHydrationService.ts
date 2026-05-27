"use client";

import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { fetchFeed } from "@/lib/services/feedService";
import { fetchJudgments } from "@/lib/services/judgmentService";
import { mapFeedRecordToFeedItem, mapJudgmentRecordToDecision, mapMissionRecordToMission, mapTaskRecordToTask } from "@/lib/services/mappers";
import { fetchMissionsFromApi } from "@/lib/services/missionService";
import { fetchTasksFromApi } from "@/lib/services/taskService";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useTaskStore } from "@/lib/store/taskStore";

export async function hydrateMissions() {
  try {
    const records = await fetchMissionsFromApi();
    const current = useMissionStore.getState().missions;
    const mapped = records.map((record) =>
      mapMissionRecordToMission(record, current.find((m) => m.id === record.id))
    );
    useMissionStore.getState().mergeMissionsFromRemote(mapped);
  } catch (error) {
    useSyncStore.getState().recordReadFailure("missions-hydration", error);
    console.warn("[ProductAI hydrate] missions fetch failed", error);
  }
}

export async function hydrateTasks() {
  try {
    const records = await fetchTasksFromApi();
    const current = useTaskStore.getState().tasks;
    const mapped = records.map((record) =>
      mapTaskRecordToTask(record, current.find((t) => t.id === record.id))
    );
    useTaskStore.getState().mergeTasksFromRemote(mapped);
  } catch (error) {
    useSyncStore.getState().recordReadFailure("tasks-hydration", error);
    console.warn("[ProductAI hydrate] tasks fetch failed", error);
  }
}

export async function hydrateFeed() {
  try {
    const records = await fetchFeed();
    const current = useOrganizationStore.getState().organizationFeedItems;
    const mapped = records.map((record) =>
      mapFeedRecordToFeedItem(record, current.find((f) => f.id === record.id))
    );
    useOrganizationStore.getState().mergeFeedFromRemote(mapped);
  } catch (error) {
    useSyncStore.getState().recordReadFailure("feed-hydration", error);
    console.warn("[ProductAI hydrate] feed fetch failed", error);
  }
}

export async function hydrateJudgments() {
  try {
    const records = await fetchJudgments();
    const current = useOrganizationStore.getState().decisions;
    const mapped = records.map((record) =>
      mapJudgmentRecordToDecision(record, current.find((d) => d.id === record.id))
    );
    useOrganizationStore.getState().mergeDecisionsFromRemote(mapped);
  } catch (error) {
    useSyncStore.getState().recordReadFailure("judgments-hydration", error);
    console.warn("[ProductAI hydrate] judgments fetch failed", error);
  }
}

export async function hydrateProductAIState() {
  const mode = getPersistenceMode();
  if (mode === "local") return;

  const sync = useSyncStore.getState();
  const readFailureCountBefore = sync.readFailures.length;
  sync.setHydrationStatus("hydrating");
  try {
    await Promise.all([hydrateMissions(), hydrateTasks(), hydrateFeed(), hydrateJudgments()]);
    const readFailureCountAfter = useSyncStore.getState().readFailures.length;
    if (readFailureCountAfter > readFailureCountBefore) {
      useSyncStore.getState().setHydrationStatus("failed", "Some hydration reads failed");
    } else {
      useSyncStore.getState().setHydrationStatus("success");
    }
    useSyncStore.getState().setLastHydratedAt(
      new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  } catch (error) {
    useSyncStore.getState().setHydrationStatus(
      "failed",
      error instanceof Error ? error.message : "Hydration failed"
    );
    useSyncStore.getState().recordReadFailure("global-hydration", error);
    console.warn("[ProductAI hydrate] global hydration failed", error);
  }
}
