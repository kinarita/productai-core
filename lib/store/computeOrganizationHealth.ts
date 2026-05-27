import type { Mission } from "@/types/productai";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";

export function computeOrganizationHealth(
  missions: Mission[],
  runtimeAlerts: RuntimeAlert[]
) {
  if (missions.length === 0) {
    return { score: 0, label: "Unknown" };
  }

  const healthPoints = missions.reduce((sum, m) => {
    if (m.health === "stable") return sum + 25;
    if (m.health === "delayed") return sum + 18;
    if (m.health === "risky") return sum + 10;
    return sum + 5;
  }, 0);

  const runtimePenalty = runtimeAlerts.some((a) => a.severity === "danger")
    ? 12
    : runtimeAlerts.some((a) => a.severity === "warning")
      ? 6
      : 0;

  const score = Math.max(0, Math.min(100, healthPoints - runtimePenalty));
  const label =
    score >= 85 ? "Healthy" : score >= 65 ? "Stable" : score >= 45 ? "Attention" : "At risk";

  return { score, label };
}
