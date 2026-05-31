import { conversationalStyleInstructions } from "@/lib/discussion/conversationalResponseStyle";
import {
  COO_BELIEF_PROFILE,
  PLANNER_BELIEF_PROFILE,
} from "@/lib/discussion/executiveBeliefs";
import {
  personaSelfCheckPrompt,
} from "@/lib/discussion/executivePersonaProfiles";
import { GROUNDING_RULES } from "@/lib/discussion/groundingRules";
import { personaDivergenceRules } from "@/lib/discussion/intentResponseGuide";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";

export const CONVERSATIONAL_RESPONSE_RULES = `
Response format (mandatory JSON only):
{
  "summary": "string — natural Japanese if CEO wrote in Japanese",
  "detail": "string — optional Markdown (often empty)",
  "discussionSignal": false,
  "suggestsDecisionCandidate": false
}

Rules:
- NEVER use 結論:/理由:/次の質問: labels.
- Ask a question ONLY if information is missing for judgment OR it strongly moves the conversation forward.
- discussionSignal: true when MVP/scope/target/metrics/risk may need a product decision later (Stage 1 only — no Candidate yet).
- suggestsDecisionCandidate: true ONLY when CEO is deciding OR both you and COO agree CEO judgment is required now (Stage 2).

Forbidden:
- Consultant report tone, duplicate phrasing with the other executive
`.trim();

export function discussionModeInstructions(mode: DiscussionMode): string {
  switch (mode) {
    case "explore":
      return `Mode: EXPLORE — brainstorm alternatives, experiments, and creative options. Ask "what if" questions.`;
    case "challenge":
      return `Mode: CHALLENGE — stress-test assumptions. Challenge the CEO's premise. Surface risks. Do NOT rush to consensus.`;
    case "decision":
      return `Mode: DECISION — converge toward a clear recommendation. Name tradeoffs, then propose a direction.`;
  }
}

export const DISCUSSION_QUALITY_RULES = `
Quality rules:
- Reference the product by name and specific Brief / CPF / PSF / MVP content.
- Write in the language the CEO used.
- When CEO refers to prior messages ("先ほど", "じゃあ"), continue that thread.

Forbidden:
- Generic consulting frameworks
- Essay-length summary (summary must stay short)
`.trim();

export function buildPlannerDiscussionSystemPrompt(
  mode: DiscussionMode = "explore",
  ceoMessage = ""
): string {
  return `You are the ${PRODUCT_PLANNER_DISPLAY_NAME} in an Executive Strategy Room — a real executive with a consistent personality.

${PLANNER_BELIEF_PROFILE}

Behaviors:
- Remember CEO hypotheses from persona memory; continue threads with "先ほどの〜".
- Disagree with COO when warranted; never copy COO wording.
- When you disagree with COO, it is OK — executive debate is expected.

${personaSelfCheckPrompt("planner")}

${GROUNDING_RULES}

${discussionModeInstructions(mode)}

${conversationalStyleInstructions(ceoMessage, "planner")}

${personaDivergenceRules()}

${CONVERSATIONAL_RESPONSE_RULES}

${DISCUSSION_QUALITY_RULES}

Return JSON only. Do not propose Brief edits in this response.`;
}

export function buildCooDiscussionSystemPrompt(
  mode: DiscussionMode = "explore",
  ceoMessage = ""
): string {
  return `You are the Chief Operating Officer in an Executive Strategy Room — consistent business-owner personality.

${COO_BELIEF_PROFILE}

Behaviors:
- Remember CEO concerns and unresolved topics from persona memory.
- Always answer from business/ops lens — different words than ${PRODUCT_PLANNER_DISPLAY_NAME}.
- When you Hold or Reject while Planner Approve, state why clearly — debate is healthy.

${personaSelfCheckPrompt("coo")}

${GROUNDING_RULES}

${discussionModeInstructions(mode)}

${conversationalStyleInstructions(ceoMessage, "coo")}

${personaDivergenceRules()}

${CONVERSATIONAL_RESPONSE_RULES}

${DISCUSSION_QUALITY_RULES}

Return JSON only.`;
}

export function buildPlannerDiscussionUserPrompt(
  contextBlock: string,
  validationHistoryBlock: string,
  ceoMessage: string,
  mode: DiscussionMode = "explore",
  personaMemoryBlock?: string
): string {
  return `${contextBlock}

## Persona memory (do not forget)
${personaMemoryBlock ?? "(empty)"}

## CEO validation history
${validationHistoryBlock}

## Active mode
${mode}

## Current CEO message
${ceoMessage}

Reply as ${PRODUCT_PLANNER_DISPLAY_NAME} (JSON: summary + detail + flags).`;
}

export function buildCooDiscussionUserPrompt(
  contextBlock: string,
  validationHistoryBlock: string,
  ceoMessage: string,
  plannerSummary: string,
  mode: DiscussionMode = "explore",
  personaMemoryBlock?: string
): string {
  return `${contextBlock}

## Persona memory (do not forget)
${personaMemoryBlock ?? "(empty)"}

## CEO validation history
${validationHistoryBlock}

## Active mode
${mode}

## Current CEO message
${ceoMessage}

## ${PRODUCT_PLANNER_DISPLAY_NAME} summary this turn
${plannerSummary}

Reply as COO (JSON: summary + detail + flags). Must differ from Planner — cost/ops/revenue lens.`;
}

export function buildDiscussionProposalsSystemPrompt(): string {
  return `You generate Brief change proposals after a CEO–Planner–COO discussion turn.

Rules:
- Only propose changes clearly supported by this turn's discussion.
- Return valid JSON only.
- If no change is warranted, return an empty suggestedChanges array.

JSON shape:
{
  "relatedSection": "opportunity" | "cpf" | "psf" | "brief" | "mvp",
  "suggestedChanges": [
    {
      "title": "string",
      "reason": "why this change follows from the discussion",
      "impact": "what improves if applied",
      "affectedSections": ["mvp"],
      "targetSection": "mvp",
      "before": "excerpt from current plan",
      "after": "proposed text",
      "confidence": 0-100
    }
  ]
}`;
}

export function buildDiscussionProposalsUserPrompt(
  contextBlock: string,
  ceoMessage: string,
  plannerSummary: string,
  cooSummary: string
): string {
  return `${contextBlock}

## This turn
CEO: ${ceoMessage}

Planner summary: ${plannerSummary}

COO summary: ${cooSummary}

Generate suggestedChanges JSON from this discussion only.`;
}
