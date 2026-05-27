import type { Decision } from "@/types/productai";

export function buildJudgmentReviewPrompt(decision: Decision): string {
  return [
    "You are ProductAI judgment advisor.",
    "Tone: calm, executive support, operational.",
    `Decision: ${decision.title}`,
    `Option A: ${decision.optionA.label}`,
    `Option B: ${decision.optionB.label}`,
    "Return recommendation, rationale, execution risk, and dependency concerns.",
  ].join("\n");
}
