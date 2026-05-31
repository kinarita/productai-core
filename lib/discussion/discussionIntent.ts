/** Phase 28.5 — CEO utterance intent for natural conversation & escalation. */

import {
  isCeoBrainstormPhrase,
  isCeoDecisionDirective,
} from "@/lib/discussion/decisionDirective";

export type DiscussionIntent =
  | "greeting"
  | "smalltalk"
  | "clarification"
  | "challenge"
  | "brainstorm"
  | "proposal"
  | "decision";

export function classifyDiscussionIntent(ceoMessage: string): DiscussionIntent {
  const m = ceoMessage.trim();
  if (!m) return "smalltalk";

  if (/^(おはよう|こんにちは|こんばんは|元気|はじめまして|good morning|hello|hi)\b/i.test(m)) {
    return "greeting";
  }

  if (
    /それって何|って何[？?]?$|とは何|とは[？?]|どういう意味|意味は|what is|what does|explain\b/i.test(
      m
    )
  ) {
    return "clarification";
  }

  if (/天気|週末|雑談|休み|映画|ランチ|weather|weekend/i.test(m)) return "smalltalk";

  if (isCeoBrainstormPhrase(m)) return "brainstorm";

  if (isCeoDecisionDirective(m)) return "decision";

  if (/本当に必要|反論|懸念ある|stress|challenge|疑う|必要かな/i.test(m)) {
    return "challenge";
  }

  if (
    /対象ユーザー.*変|ターゲット.*変|成功指標.*変|kpi.*変|スコープ.*変/i.test(m)
  ) {
    return "proposal";
  }

  return "smalltalk";
}

/** Stage 1 — product decision may emerge; do not create Candidate yet. */
export function shouldShowDiscussionSignal(
  intent: DiscussionIntent,
  ceoMessage: string
): boolean {
  if (intent === "greeting" || intent === "smalltalk" || intent === "clarification") {
    return false;
  }
  if (intent === "decision") return false;

  if (intent === "proposal" || intent === "brainstorm" || intent === "challenge") {
    return true;
  }

  if (/面白い|検討|可能性|リスク|mvp|機能|ターゲット|指標/i.test(ceoMessage)) {
    return true;
  }

  return false;
}

/** Stage 2 — create Decision Candidate. */
export function shouldCreateDecisionCandidateStage2(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerSuggestsDecision?: boolean;
  cooSuggestsDecision?: boolean;
  hasNewProposals?: boolean;
}): boolean {
  const intent = classifyDiscussionIntent(input.ceoMessage);

  if (intent === "decision") return true;

  if (input.plannerSuggestsDecision && input.cooSuggestsDecision) return true;

  const escalation =
    /判断が必要|判断事項|CEOの判断|意思決定が必要|decision (is )?required/i;
  const planner = escalation.test(input.plannerSummary ?? "");
  const coo = escalation.test(input.cooSummary ?? "");
  if (planner && coo) return true;

  return false;
}
