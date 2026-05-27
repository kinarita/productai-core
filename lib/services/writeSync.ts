import { getPersistenceMode } from "@/lib/config/persistenceMode";

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

  void remoteFn().catch((error) => {
    console.warn(`[ProductAI sync:${label}] remote write failed`, error);
  });
}
