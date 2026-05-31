import type { AgentVote } from "@/lib/discussion/decisionGovernanceTypes";
import { AGENT_VOTE_LABELS, voteEmoji } from "@/lib/discussion/decisionGovernanceTypes";
import { extractTopicLabel } from "@/lib/discussion/discussionTopic";
import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";

export interface ExecutiveDebateContext {
  topic: string;
  plannerVote: AgentVote;
  cooVote: AgentVote;
  plannerReason: string;
  cooReason: string;
  whyDebate: string;
  debateSummary: string;
}

/** Phase 29-C — Planner and COO materially disagree. */
export function isExecutiveDebate(
  plannerVote: AgentVote,
  cooVote: AgentVote
): boolean {
  return plannerVote !== cooVote;
}

export function formatDebateVoteLine(role: "planner" | "coo", vote: AgentVote): string {
  const label = role === "planner" ? "Planner" : "COO";
  return `${label}: ${voteEmoji(vote)} ${AGENT_VOTE_LABELS[vote]}`;
}

function firstReasonSentence(text: string, fallback: string): string {
  const cleaned = text.replace(/\*\*/g, "").trim();
  const sentence = cleaned.split(/[。.\n]/).find((s) => s.trim().length > 4)?.trim();
  return (sentence ?? fallback).slice(0, 100);
}

export function inferDebateTopic(
  ceoMessage: string,
  memory?: DiscussionPersonaMemory
): string {
  const fromCeo = extractTopicLabel(ceoMessage);
  const fromMemory =
    memory?.unresolvedTopics[0] ?? memory?.ceoHypotheses[0] ?? undefined;
  const topic = fromCeo ?? fromMemory ?? ceoMessage.slice(0, 48);
  if (/mvp|入れ|追加|含め/i.test(ceoMessage)) {
    return `${topic}をMVPへ追加するか`;
  }
  return `${topic}について`;
}

export function explainWhyDebate(
  plannerVote: AgentVote,
  cooVote: AgentVote
): string {
  if (plannerVote === "approve" && (cooVote === "hold" || cooVote === "reject")) {
    return "価値と実現性の評価が分かれているため";
  }
  if (plannerVote === "hold" && cooVote === "reject") {
    return "MVP 範囲と実行リスクの許容度が分かれているため";
  }
  if (plannerVote === "approve" && cooVote === "approve") {
    return "方向は一致していますが、優先順位の整理が必要なため";
  }
  return "役員の信念（PMF vs 実行可能性）が分かれているため";
}

export function buildDebateSummary(input: {
  plannerReason: string;
  cooReason: string;
}): string {
  return [
    "Debate Summary",
    `Planner は ${input.plannerReason} を理由に${/保留|hold|段階/i.test(input.plannerReason) ? "保留寄り" : "賛成"}。`,
    `COO は ${input.cooReason} を理由に${/保留|hold|慎重|不明|検証/i.test(input.cooReason) ? "保留" : "判断"}。`,
    "CEO判断待ち。",
  ].join("\n");
}

export function buildExecutiveDebateContext(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerVote: AgentVote;
  cooVote: AgentVote;
  plannerRationale?: string;
  cooRationale?: string;
  memory?: DiscussionPersonaMemory;
}): ExecutiveDebateContext {
  const topic = inferDebateTopic(input.ceoMessage, input.memory);
  const plannerReason = firstReasonSentence(
    input.plannerRationale ?? input.plannerSummary ?? "",
    "ユーザー価値・PMF 向上の可能性"
  );
  const cooReason = firstReasonSentence(
    input.cooRationale ?? input.cooSummary ?? "",
    "実装コスト・検証データが未確定"
  );
  const whyDebate = explainWhyDebate(input.plannerVote, input.cooVote);
  const debateSummary = buildDebateSummary({ plannerReason, cooReason });

  return {
    topic,
    plannerVote: input.plannerVote,
    cooVote: input.cooVote,
    plannerReason,
    cooReason,
    whyDebate,
    debateSummary,
  };
}

export function plannerBeliefFromReason(reason: string): string {
  if (/入力|負荷|音声|ocr/i.test(reason)) {
    return "入力負荷削減は PMF 向上につながる";
  }
  return "ユーザー価値・体験改善は PMF 学習に資する";
}

export function cooBeliefFromReason(reason: string): string {
  if (/コスト|工数|不明|検証|データ/i.test(reason)) {
    return "未検証の実装は MVP を遅らせる";
  }
  return "実行可能性と測定可能性が先";
}
