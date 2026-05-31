import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import {
  createDecisionItemFromProposal,
  inferAgentVotes,
} from "@/lib/discussion/createDecisionFromProposal";
import type { AgentVote, DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";

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

export function shouldAutoCreateDecisionCandidate(input: {
  ceoMessage: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerVote?: AgentVote;
  cooVote?: AgentVote;
  hasNewProposals: boolean;
}): boolean {
  if (input.hasNewProposals) return true;

  const ceo = input.ceoMessage;
  if (/\?|？|どうすべき|決めて|判断|should we|approve/i.test(ceo)) return true;

  const pVote = input.plannerVote ?? "neutral";
  const cVote = input.cooVote ?? "neutral";
  if (
    (pVote === "approve" && cVote === "reject") ||
    (pVote === "reject" && cVote === "approve")
  ) {
    return true;
  }

  if (/重要|論点|懸念|リスク|mvp|グラフ|ターゲット/i.test(ceo) && pVote !== cVote) return true;

  return false;
}

export function inferVotesFromDiscussionTurn(
  plannerSummary?: string,
  cooSummary?: string
): { plannerVote: AgentVote; cooVote: AgentVote } {
  const p = (plannerSummary ?? "").toLowerCase();
  const c = (cooSummary ?? "").toLowerCase();
  let plannerVote: AgentVote = "neutral";
  let cooVote: AgentVote = "neutral";
  if (/賛成|support|recommend|should|価値|価値が|add|include/i.test(p)) plannerVote = "approve";
  if (/反対|defer|懸念|risk|却下|見送/i.test(p)) plannerVote = "reject";
  if (/賛成|support|recommend|align/i.test(c)) cooVote = "approve";
  if (/反対|defer|懸念|cost|scope|遅延|却下|見送|リスク/i.test(c)) cooVote = "reject";
  return { plannerVote, cooVote };
}

export function createDecisionFromDiscussionTurn(input: {
  ceoMessage: string;
  sourceDiscussionId: string;
  plannerSummary?: string;
  cooSummary?: string;
  plannerDetail?: string;
  cooDetail?: string;
  titleHint?: string;
}): DecisionItem {
  const votes = inferVotesFromDiscussionTurn(input.plannerSummary, input.cooSummary);

  const now = new Date().toISOString();
  const title =
    input.titleHint?.trim() ||
    input.ceoMessage.trim().slice(0, 72) ||
    "Discussion decision point";

  return {
    id: decisionId(),
    title,
    rationale: input.ceoMessage.trim().slice(0, 200),
    sourceDiscussionId: input.sourceDiscussionId,
    plannerVote: votes.plannerVote,
    cooVote: votes.cooVote,
    plannerRationale: extractRationaleFromAgentText(input.plannerSummary ?? ""),
    cooRationale: extractRationaleFromAgentText(input.cooSummary ?? ""),
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
  opts: { ceoMessage: string; plannerSummary?: string; cooSummary?: string }
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
