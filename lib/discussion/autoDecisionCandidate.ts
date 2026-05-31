import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import {
  createDecisionItemFromProposal,
  inferAgentVotes,
} from "@/lib/discussion/createDecisionFromProposal";
import type { AgentVote, DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import { classifyDiscussionIntent } from "@/lib/discussion/discussionIntent";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";
import { shouldAutoCreateDecisionCandidate } from "@/lib/discussion/decisionCandidateDiscipline";
import { resolveDecisionCandidateTitle } from "@/lib/discussion/discussionTopic";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";
import {
  executiveCommentForVote,
  inferStrongExecutiveVotes,
  personaSelfCheckCoo,
  personaSelfCheckPlanner,
} from "@/lib/discussion/executivePersonaProfiles";

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
  cooSummary?: string,
  ceoMessage?: string
): { plannerVote: AgentVote; cooVote: AgentVote } {
  return inferStrongExecutiveVotes(plannerSummary, cooSummary, ceoMessage);
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
  const p = personaSelfCheckPlanner(plannerSummary ?? "");
  const c = personaSelfCheckCoo(cooSummary ?? "");
  const votes = inferStrongExecutiveVotes(p, c, ceoMessage);

  let plannerRationale = extractRationaleFromAgentText(p);
  let cooRationale = extractRationaleFromAgentText(c);

  const topic = ceoMessage?.slice(0, 40);

  if (!plannerRationale || plannerRationale.length < 8) {
    plannerRationale = executiveCommentForVote("planner", votes.plannerVote, ceoMessage);
  }
  if (!cooRationale || cooRationale.length < 8) {
    cooRationale = executiveCommentForVote("coo", votes.cooVote, ceoMessage);
  }

  if (/ライブ|ocr|OCR/i.test(ceoMessage ?? "")) {
    if (votes.plannerVote === "approve") {
      plannerRationale = "入力負荷を大幅に削減できる可能性があります。";
    }
    if (votes.cooVote === "hold") {
      cooRationale = "OCR精度と開発工数が不明です。検証してからでも遅くありません。";
    }
  }

  if (/音声|voice input|voice/i.test(ceoMessage ?? "")) {
    if (votes.plannerVote === "approve") {
      plannerRationale =
        "ユーザーが買い物中に入力不要で使える体験は、PMFに近づく可能性があります。";
    }
    if (votes.cooVote === "hold" || votes.cooVote === "reject") {
      cooRationale = "OCR・音声認識精度が不明です。まず検証データが必要です。";
    }
  }

  if (/グラフ|chart/i.test(ceoMessage ?? "")) {
    if (votes.plannerVote === "approve") {
      plannerRationale = "ユーザー価値・リテンションの観点で有効です。";
    }
    if (votes.cooVote === "hold") {
      cooRationale = "MVPには重いかもしれません。開発工数調査が必要です。";
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
