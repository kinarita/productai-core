import {
  classifyDiscussionIntent,
  type DiscussionIntent,
} from "@/lib/discussion/discussionIntent";
import {
  intentResponseInstructions,
  personaDivergenceRules,
} from "@/lib/discussion/intentResponseGuide";

/** @deprecated Phase 28 alias */
export type ConversationalStyle = "small_question" | "discussion" | "deep_discussion";

export function inferConversationalStyle(ceoMessage: string): ConversationalStyle {
  const intent = classifyDiscussionIntent(ceoMessage);
  if (intent === "clarification") return "small_question";
  if (intent === "challenge") return "deep_discussion";
  return "discussion";
}

export function inferDiscussionIntent(ceoMessage: string): DiscussionIntent {
  return classifyDiscussionIntent(ceoMessage);
}

export function conversationalStyleInstructions(
  ceoMessage: string,
  role: "planner" | "coo" = "planner"
): string {
  const intent = classifyDiscussionIntent(ceoMessage);
  return `${intentResponseInstructions(intent, role)}\n\n${personaDivergenceRules()}`;
}

/** @deprecated Use conversationalStyleInstructions(ceoMessage, role) */
export function legacyConversationalStyleInstructions(style: ConversationalStyle): string {
  if (style === "small_question") {
    return "Style: CLARIFICATION — short answer, no mandatory question.";
  }
  if (style === "deep_discussion") {
    return "Style: DEEP DISCUSSION — longer detail allowed; no forced 結論/理由/質問.";
  }
  return "Style: DISCUSSION — natural lines; questions only when they move the thread.";
}
