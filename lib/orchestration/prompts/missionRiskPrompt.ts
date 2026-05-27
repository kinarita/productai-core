import type { Mission } from "@/types/productai";

export function buildMissionRiskPrompt(mission: Mission): string {
  return [
    "You are ProductAI risk reviewer.",
    "Tone: concise operational risk summary.",
    `Mission: ${mission.name}`,
    `Health: ${mission.health}`,
    `Progress: ${mission.progress}%`,
    `Blockers: ${mission.blockers.join(", ") || "none"}`,
  ].join("\n");
}
