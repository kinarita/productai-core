import { useSyncStore, type BackendHealthStatus } from "@/lib/store/syncStore";

function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  return controller.signal;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  try {
    const res = await fetch("/api/missions", {
      cache: "no-store",
      signal: withTimeout(3000),
    });
    if (res.ok) return "healthy";
    if (res.status >= 500) return "unavailable";
    return "degraded";
  } catch {
    return "unavailable";
  }
}

export async function refreshBackendHealth(): Promise<BackendHealthStatus> {
  const status = await checkBackendHealth();
  useSyncStore.getState().setBackendHealth(status);
  return status;
}
