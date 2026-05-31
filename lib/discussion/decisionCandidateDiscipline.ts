import type { AgentVote } from "@/lib/discussion/decisionGovernanceTypes";
import {
  classifyDiscussionIntent,
  shouldCreateDecisionCandidateStage2,
  shouldShowDiscussionSignal,
  type DiscussionIntent,
} from "@/lib/discussion/discussionIntent";

/** @deprecated Phase 28 alias — use classifyDiscussionIntent */
export type ConversationIntent = DiscussionIntent;

export const CANDIDATE_CONFIDENCE_THRESHOLD = 70;

/** @deprecated Use classifyDiscussionIntent */
export function classifyCeoIntent(ceoMessage: string): DiscussionIntent {
  return classifyDiscussionIntent(ceoMessage);
}

export function agentsSuggestEscalation(
  plannerSummary?: string,
  cooSummary?: string
): { planner: boolean; coo: boolean; both: boolean } {
  const escalation =
    /判断が必要|判断事項|CEOの判断|意思決定|合意が必要|決断|decision (is )?required|needs (a )?decision/i;
  const impact =
    /MVP範囲|Briefに影響|brief change|scope impact|反映すべき|判断事項だと/i;

  const planner = escalation.test(plannerSummary ?? "") || impact.test(plannerSummary ?? "");
  const coo = escalation.test(cooSummary ?? "") || impact.test(cooSummary ?? "");
  return { planner, coo, both: planner && coo };
}

/** Stage 1 — UI signal only (Phase 28.5). */
export function shouldShowDiscussionDecisionSignal(ceoMessage: string): boolean {
  return shouldShowDiscussionSignal(classifyDiscussionIntent(ceoMessage), ceoMessage);
}

export function computeCandidateConfidence(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerVote?: AgentVote;
  cooVote?: AgentVote;
  hasNewProposals: boolean;
  proposalConfidences?: number[];
}): number {
  const intent = classifyDiscussionIntent(input.ceoMessage);

  if (intent === "greeting" || intent === "smalltalk" || intent === "clarification") {
    return 0;
  }

  if (!shouldCreateDecisionCandidateStage2(input)) {
    if (shouldShowDiscussionSignal(intent, input.ceoMessage)) return 45;
    return 0;
  }

  let score = 75;
  if (intent === "decision") score = 95;
  if (intent === "proposal") score = 80;

  const escalation = agentsSuggestEscalation(input.plannerSummary, input.cooSummary);
  if (escalation.both) score = Math.max(score, 88);

  if (input.hasNewProposals) {
    const confs = input.proposalConfidences ?? [];
    const avg =
      confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 72;
    score = Math.max(score, avg);
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/** Stage 2 — Decision Candidate creation (Phase 28.5). */
export function shouldAutoCreateDecisionCandidate(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerVote?: AgentVote;
  cooVote?: AgentVote;
  hasNewProposals: boolean;
  proposalConfidences?: number[];
  plannerSuggestsDecision?: boolean;
  cooSuggestsDecision?: boolean;
}): boolean {
  if (!shouldCreateDecisionCandidateStage2(input)) return false;

  const confidence = computeCandidateConfidence(input);
  return confidence >= CANDIDATE_CONFIDENCE_THRESHOLD;
}

export function ceoTopicAbsentFromBrief(
  ceoMessage: string,
  briefText: string | undefined
): string | null {
  const topics: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /pos|POS連携|レジ連携/i, label: "POS連携" },
    { pattern: /ライブ(動画|カメラ)?|ライブカメラ/i, label: "ライブカメラ機能" },
    { pattern: /nft|ブロックチェーン/i, label: "NFT" },
  ];
  const corpus = (briefText ?? "").toLowerCase();
  for (const { pattern, label } of topics) {
    if (pattern.test(ceoMessage) && !pattern.test(corpus)) return label;
  }
  return null;
}
