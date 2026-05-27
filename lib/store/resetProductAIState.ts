import { PERSIST_KEYS } from "@/lib/store/initialState";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useUiStore } from "@/lib/store/uiStore";

export function resetAllProductAIState() {
  PERSIST_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  useMissionStore.getState().resetToInitial();
  useOrganizationStore.getState().resetToInitial();
  useRuntimeStore.getState().resetToInitial();
  useTaskStore.getState().resetToInitial();
  useUiStore.getState().resetToInitial();

  if (typeof window !== "undefined") {
    window.location.reload();
  }
}
