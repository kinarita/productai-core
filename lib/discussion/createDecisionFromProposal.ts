import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import type { AgentVote, DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import {
  executiveCommentForVote,
  inferStrongExecutiveVotes,
} from "@/lib/discussion/executivePersonaProfiles";

function decisionId(): string {
  return `dec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/** Infer Planner/COO votes from proposal (Phase 29 — strong votes, no default Neutral). */
export function inferAgentVotes(proposal: BriefChangeProposal): {
  plannerVote: AgentVote;
  cooVote: AgentVote;
} {
  const text = `${proposal.title} ${proposal.reason} ${proposal.impact}`;
  const scopeExpansion = /scope|mvp|graph|feature|機能|追加|chart|ocr/i.test(text);

  let plannerVote: AgentVote =
    proposal.confidence >= 60 ? "approve" : "hold";
  let cooVote: AgentVote = scopeExpansion ? "hold" : "approve";

  if (/defer|should have|phase 2|第2|段階/i.test(text)) {
    cooVote = "hold";
  }
  if (/cost|risk|競合|コスト|リスク|重い/i.test(text) && proposal.confidence < 70) {
    cooVote = "reject";
  }
  if (proposal.confidence >= 78 && !scopeExpansion) {
    cooVote = "approve";
  }

  return inferStrongExecutiveVotes(
    plannerVote === "approve" ? "賛成 — user value" : "保留",
    cooVote === "hold" ? "慎重 — コスト" : cooVote === "reject" ? "反対" : "賛成",
    text
  );
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
    plannerRationale:
      proposal.reason?.slice(0, 280) ||
      executiveCommentForVote("planner", votes.plannerVote, proposal.title),
    cooRationale:
      proposal.impact?.slice(0, 280) ||
      executiveCommentForVote("coo", votes.cooVote, proposal.title),
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
