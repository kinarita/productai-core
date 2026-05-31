import type { DiscussionTargetAudience } from "@/lib/discussion/discussionTypes";

/** Phase 27 — @mention parsing (UI not exposed yet). */
export function parseMentionsFromMessage(
  message: string
): DiscussionTargetAudience | null {
  const text = message.toLowerCase();
  if (/@all\b/.test(text)) return "all";
  if (/@coo\b/.test(text)) return "coo";
  if (/@planner\b/.test(text)) return "planner";
  return null;
}

/** Selector wins unless CEO @-mentions override. */
export function resolveDiscussionAudience(input: {
  targetAudience?: DiscussionTargetAudience;
  userMessage: string;
}): DiscussionTargetAudience {
  return parseMentionsFromMessage(input.userMessage) ?? input.targetAudience ?? "all";
}

export function audienceIncludesPlanner(audience: DiscussionTargetAudience): boolean {
  return audience === "all" || audience === "planner";
}

export function audienceIncludesCoo(audience: DiscussionTargetAudience): boolean {
  return audience === "all" || audience === "coo";
}
