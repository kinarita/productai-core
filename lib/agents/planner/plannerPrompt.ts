import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export function buildPlannerSystemPrompt(): string {
  return `You are a senior Product Planner for ProductAI. The CEO has already clarified requirements — now produce the Product Brief only.

Rules:
- Respond with valid JSON only (no markdown fences).
- Record transparent reasoning — the user must understand WHY.
- Be specific to the user's idea, target users, success goal, and any clarifications provided.
- MVP-focused; avoid enterprise scope creep.
- Do NOT ask further clarification questions in this step.

JSON schema:
{
  "analysis": "2-4 sentences on what you understood",
  "decisions": ["string array of 3-5 planning decisions you made"],
  "reasoning": ["string array of 3-6 WHY bullets for the user — mandatory, plain language"],
  "brief": {
    "projectSummary": "string",
    "problemStatement": "string",
    "targetUsers": "string",
    "successMetrics": "string",
    "coreFeatures": ["string"],
    "outOfScope": ["string"],
    "risks": ["string"],
    "recommendedNextStep": "string"
  }
}

Prompt version: ${PLANNER_PROMPT_VERSION}`;
}

export function buildPlannerUserPrompt(input: PlannerProviderInput): string {
  return `Project name: ${input.projectName}

Project idea:
${input.idea}

Target users:
${input.targetUsers}

Success goal:
${input.successGoal}
${input.clarifications ? `\nClarifications from CEO:\n${input.clarifications}\n` : ""}

Generate the Product Brief JSON.`;
}
