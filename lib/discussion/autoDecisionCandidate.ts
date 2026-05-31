import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import {
  createDecisionItemFromProposal,
  inferAgentVotes,
} from "@/lib/discussion/createDecisionFromProposal";
import type { AgentVote, DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";
import { shouldAutoCreateDecisionCandidate } from "@/lib/discussion/decisionCandidateDiscipline";
import { resolveDecisionCandidateTitle } from "@/lib/discussion/discussionTopic";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";
import { classifyDiscussionIntent } from "@/lib/discussion/discussionIntent";

function decisionId(): string {
  return `dec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/** Internal mode for Planner/COO prompts — not shown in UI (Phase 26.1). */
export function inferInternalDiscussionMode(ceoMessage: string): DiscussionMode {
  if (/決め|合意|approve|採用|方向|recommend|どちら/i.test(ceoMessage)) return "decision";
  if (/疑問|リスク|challenge|懸念|本当に|stress|反対/i.test(ceoMessage)) return "challenge";
  return "explore";
}

export function extractRationaleFromAgentText(text: string): string {
  const reasonMatch = text.match(/\*\*理由:\*\*\s*([\s\S]*?)(?=\n\n\*\*質問|\*\*Question|$)/i);
  if (reasonMatch?.[1]) return reasonMatch[1].trim().slice(0, 280);
  const lines = text.split("\n").filter((l) => l.trim());
  return (lines[1] ?? lines[0] ?? text).replace(/\*\*/g, "").slice(0, 280);
}

export {
  CANDIDATE_CONFIDENCE_THRESHOLD,
  agentsSuggestEscalation,
  classifyCeoIntent,
  computeCandidateConfidence,
  shouldAutoCreateDecisionCandidate,
} from "@/lib/discussion/decisionCandidateDiscipline";

export function inferVotesFromDiscussionTurn(
  plannerSummary?: string,
  cooSummary?: string
): { plannerVote: AgentVote; cooVote: AgentVote } {
  const p = plannerSummary ?? "";
  const c = cooSummary ?? "";
  const pl = p.toLowerCase();
  const cl = c.toLowerCase();
  let plannerVote: AgentVote = "neutral";
  let cooVote: AgentVote = "neutral";
  if (/賛成|support|recommend|必要だと|価値が高|approve|👍/i.test(p)) plannerVote = "approve";
  if (/反対|却下|見送|不要/i.test(p)) plannerVote = "reject";
  if (/賛成|support|recommend|align/i.test(c)) cooVote = "approve";
  if (/反対|却下|見送/i.test(c)) cooVote = "reject";
  if (/慎重|hold|保留|コスト不明|運用コスト|様子見|プライバシー|実現性/i.test(c)) {
    cooVote = "hold";
  }
  if (/簡易版|段階|should have/i.test(pl) && cooVote === "neutral") cooVote = "hold";
  return { plannerVote, cooVote };
}

/** Phase 28.5 — votes + short reasons for Decision Candidate cards. */
export function inferDecisionVotesWithReasons(
  plannerSummary?: string,
  cooSummary?: string,
  ceoMessage?: string
): {
  plannerVote: AgentVote;
  cooVote: AgentVote;
  plannerRationale: string;
  cooRationale: string;
} {
  const votes = inferVotesFromDiscussionTurn(plannerSummary, cooSummary);
  const p = plannerSummary ?? "";
  const c = cooSummary ?? "";

  let plannerRationale = extractRationaleFromAgentText(p);
  let cooRationale = extractRationaleFromAgentText(c);

  if (!plannerRationale || plannerRationale.length < 8) {
    if (votes.plannerVote === "approve") plannerRationale = "ユーザー価値・UX の観点で前向きです。";
    else if (votes.plannerVote === "reject") plannerRationale = "MVP 焦点を守るため見送りを推奨します。";
    else plannerRationale = "追加情報があれば判断できます。";
  }
  if (!cooRationale || cooRationale.length < 8) {
    if (votes.cooVote === "hold") cooRationale = "実現コスト・運用負荷が未確定のため慎重です。";
    else if (votes.cooVote === "approve") cooRationale = "事業・実行の観点で問題ありません。";
    else if (votes.cooVote === "reject") cooRationale = "初期開発・運用コストが見合いません。";
    else cooRationale = "コストとリスクの精査が必要です。";
  }

  if (/ライブ|カメラ/i.test(ceoMessage ?? "")) {
    if (votes.plannerVote === "approve" && plannerRationale.length < 40) {
      plannerRationale = "入力負荷削減とデータ鮮度の観点でメリットがあります。";
    }
    if (votes.cooVote === "hold") {
      cooRationale = "実現コスト・運用体制が不明なため Hold です。";
    }
  }

  return { ...votes, plannerRationale, cooRationale };
}

export function createDecisionFromDiscussionTurn(input: {
  ceoMessage: string;
  sourceDiscussionId: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerDetail?: string;
  cooDetail?: string;
  titleHint?: string;
  personaMemory?: DiscussionPersonaMemory;
  discussionMessages?: DiscussionMessage[];
}): DecisionItem {
  const votes = inferDecisionVotesWithReasons(
    input.plannerSummary,
    input.cooSummary,
    input.ceoMessage
  );

  const now = new Date().toISOString();
  const title =
    input.titleHint?.trim() ||
    (classifyDiscussionIntent(input.ceoMessage) === "decision"
      ? resolveDecisionCandidateTitle(input.ceoMessage, {
          personaMemory: input.personaMemory,
          messages: input.discussionMessages,
        })
      : input.ceoMessage.trim().slice(0, 72)) ||
    "Discussion decision point";

  return {
    id: decisionId(),
    title,
    rationale: input.ceoMessage.trim().slice(0, 200),
    sourceDiscussionId: input.sourceDiscussionId,
    plannerVote: votes.plannerVote,
    cooVote: votes.cooVote,
    plannerRationale: votes.plannerRationale,
    cooRationale: votes.cooRationale,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

export function enrichDecisionFromProposal(
  item: DecisionItem,
  proposal: BriefChangeProposal
): DecisionItem {
  return {
    ...item,
    plannerRationale: proposal.reason?.slice(0, 280) || item.plannerRationale,
    cooRationale:
      proposal.impact?.slice(0, 280) ||
      item.cooRationale ||
      "Business impact and execution tradeoffs require CEO judgment.",
  };
}

export function registerAutoDecisionsFromProposals(
  existing: DecisionItem[],
  proposals: BriefChangeProposal[],
  sourceDiscussionId: string,
  opts: {
    ceoMessage: string;
    plannerSummary?: string;
    cooSummary?: string;
    plannerSuggestsDecision?: boolean;
    cooSuggestsDecision?: boolean;
  }
): { decisionItems: DecisionItem[]; proposals: BriefChangeProposal[] } {
  const decisionItems = [...existing];
  const updatedProposals = proposals.map((p) => {
    if (decisionItems.some((d) => d.sourceProposalId === p.id)) {
      return { ...p, status: "awaiting_decision" as const };
    }

    const votes = inferAgentVotes(p);
    const shouldCreate = shouldAutoCreateDecisionCandidate({
      ceoMessage: opts.ceoMessage,
      plannerSummary: opts.plannerSummary,
      cooSummary: opts.cooSummary,
      plannerVote: votes.plannerVote,
      cooVote: votes.cooVote,
      hasNewProposals: true,
      proposalConfidences: [p.confidence],
      plannerSuggestsDecision: opts.plannerSuggestsDecision,
      cooSuggestsDecision: opts.cooSuggestsDecision,
    });

    if (!shouldCreate) {
      return { ...p, status: "pending" as const };
    }

    let item = enrichDecisionFromProposal(
      createDecisionItemFromProposal(p, sourceDiscussionId),
      p
    );
    decisionItems.push(item);
    return { ...p, status: "awaiting_decision" as const };
  });
  return { decisionItems, proposals: updatedProposals };
}
