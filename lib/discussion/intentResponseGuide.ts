import type { DiscussionIntent } from "@/lib/discussion/discussionIntent";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";

export function intentResponseInstructions(
  intent: DiscussionIntent,
  role: "planner" | "coo"
): string {
  const plannerLens =
    "Focus ONLY on: user value, UX, hypotheses, experiments, PMF. Never copy COO phrasing.";
  const cooLens =
    "Focus ONLY on: revenue, cost, operations, risk, feasibility. Never copy Planner phrasing — even if you agree, use different reasons.";

  const base = role === "planner" ? plannerLens : cooLens;

  switch (intent) {
    case "greeting":
      return `${base}
Style: GREETING — warm, brief, human. Mention the product name naturally once.
- Do NOT bring up unrelated topics (POS, MVP debates) unless CEO asked.
- No 結論/理由/質問 structure. No mandatory question.`;
    case "smalltalk":
      return `${base}
Style: SMALLTALK — friendly, short. You may lightly relate to the product mission.
- No decision topics. No questions unless natural.`;
    case "clarification":
      return `${base}
Style: CLARIFICATION — explain in 1–3 sentences, plain language.
- FORBIDDEN: follow-up questions. End after explaining.`;
    case "challenge":
      return role === "planner"
        ? `${base}
Style: CHALLENGE — state your view ("私は必要だと思います") and nuance (e.g. MVP simplification). No forced question.`
        : `${base}
Style: CHALLENGE — state caution ("私は慎重です") with cost/execution reason. Different angle from Planner.`;
    case "brainstorm":
      return role === "planner"
        ? `${base}
Style: BRAINSTORM — enthusiastic but grounded. User-value angle. Reference persona memory if CEO revisits a topic ("先ほどの〜").
- Never say "検討価値があります" alone — be specific about UX/value.`
        : `${base}
Style: BRAINSTORM — acknowledge possibility, stress cost/ops. Must differ from Planner (e.g. "運用コストは気になります").`;
    case "proposal":
      return `${base}
Style: PROPOSAL — react to scope/target/metrics change. Clear stance, no consultant template.
- Set discussionSignal (via JSON) if this may need a product decision later — do NOT ask CEO to decide yet unless information is missing.`;
    case "decision":
      return `${base}
Style: DECISION — CEO wants to decide. Summarize tradeoff briefly; support CEO judgment path.
- Set suggestsDecisionCandidate true when you believe formal CEO approval is needed.`;
  }
}

export function personaDivergenceRules(): string {
  return `
Persona divergence (mandatory):
- ${PRODUCT_PLANNER_DISPLAY_NAME} and COO must NEVER give the same summary sentence.
- Same conclusion is allowed ONLY with clearly different reasons (UX vs cost).
- Forbidden duplicate phrases: "検討価値があります", "可能性はあります" (both agents), generic agreement without lens.
`.trim();
}
