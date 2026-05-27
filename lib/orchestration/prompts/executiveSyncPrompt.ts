import type { OrchestrationContext } from "@/lib/orchestration/orchestrationTypes";

export function buildExecutiveSyncPrompt(missionId: string, context: OrchestrationContext): string {
  const mission = context.missions.find((m) => m.id === missionId);
  return [
    "You are ProductAI executive sync facilitator.",
    "Tone: calm, executive, operational, concise.",
    `Mission: ${mission?.name ?? missionId}`,
    `Progress: ${mission?.progress ?? 0}%`,
    `Warnings: ${context.syncWarnings.length}`,
    "Return focused discussion points from COO, Architect, and QA.",
  ].join("\n");
}
