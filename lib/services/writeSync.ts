import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { useSyncStore } from "@/lib/store/syncStore";

export function syncWrite(
  label: string,
  localFn: () => void,
  remoteFn?: () => Promise<unknown>
) {
  try {
    localFn();
  } catch (error) {
    console.warn(`[ProductAI sync:${label}] local write failed`, error);
    return;
  }

  const mode = getPersistenceMode();
  if (!remoteFn || mode === "local") return;

  void remoteFn()
    .then(() => {
      useSyncStore.getState().setLastSuccessfulWriteAt();
      useSyncStore.getState().clearWarningsByType("write");
    })
    .catch((error) => {
      useSyncStore.getState().recordWriteFailure(label, error);
      useSyncStore.getState().addWarning({
        type: "write",
        severity: "warning",
        message: `Backend synchronization delayed for ${label}. Local execution continuity maintained.`,
      });
      console.warn(`[ProductAI sync:${label}] remote write failed`, error);
    });
}
