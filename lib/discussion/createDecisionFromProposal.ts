import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import type { AgentVote, DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";

function decisionId(): string {
  return `dec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/** Infer Planner/COO votes from proposal confidence and keywords (Phase 26). */
export function inferAgentVotes(proposal: BriefChangeProposal): {
  plannerVote: AgentVote;
  cooVote: AgentVote;
} {
  const text = `${proposal.title} ${proposal.reason} ${proposal.impact}`.toLowerCase();
  const plannerVote: AgentVote =
    proposal.confidence >= 72 ? "approve" : proposal.confidence >= 55 ? "neutral" : "reject";

  let cooVote: AgentVote = "neutral";
  if (/scope|mvp|graph|feature|入力|habit|validation/i.test(text)) {
    cooVote = proposal.confidence >= 65 ? "neutral" : "reject";
  }
  if (/market|revenue|competitor|cost|risk|競合|収益/i.test(text)) {
    cooVote = proposal.confidence < 60 ? "reject" : "neutral";
  }
  if (/defer|should have|phase 2|第2/i.test(text)) {
    cooVote = "approve";
    if (plannerVote === "approve") cooVote = "reject";
  }

  return { plannerVote, cooVote };
}

export function createDecisionItemFromProposal(
  proposal: BriefChangeProposal,
  sourceDiscussionId: string
): DecisionItem {
  const now = new Date().toISOString();
  const votes = inferAgentVotes(proposal);
  return {
    id: decisionId(),
    title: proposal.title,
    rationale: proposal.reason ?? proposal.description,
    sourceDiscussionId,
    sourceProposalId: proposal.id,
    plannerVote: votes.plannerVote,
    cooVote: votes.cooVote,
    status: "pending",
    impact: proposal.impact,
    plannerRationale: proposal.reason?.slice(0, 280),
    cooRationale: proposal.impact?.slice(0, 280),
    createdAt: now,
    updatedAt: now,
  };
}

export function createDecisionItemFromCeoMessage(input: {
  messageId: string;
  message: string;
  title?: string;
}): DecisionItem {
  const now = new Date().toISOString();
  const title =
    input.title?.trim() ||
    input.message.trim().slice(0, 80) ||
    "Executive decision topic";
  return {
    id: decisionId(),
    title,
    rationale: input.message.trim(),
    sourceDiscussionId: input.messageId,
    plannerVote: "neutral",
    cooVote: "neutral",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}
