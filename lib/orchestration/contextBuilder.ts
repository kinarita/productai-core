import type { OrchestrationContext } from "@/lib/orchestration/orchestrationTypes";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useTaskStore } from "@/lib/store/taskStore";

export function buildOrchestrationContext(): OrchestrationContext {
  const missionState = useMissionStore.getState();
  const taskState = useTaskStore.getState();
  const orgState = useOrganizationStore.getState();
  const runtimeState = useRuntimeStore.getState();
  const syncState = useSyncStore.getState();

  return {
    missions: missionState.missions,
    tasks: taskState.tasks,
    decisions: orgState.decisions,
    feedItems: orgState.organizationFeedItems,
    syncWarnings: syncState.syncWarnings.map((w) => w.message),
    runtimeAlerts: runtimeState.alerts.map((a) => a.message),
  };
}
