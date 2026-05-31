/** Phase 26 — Decision governance layer (separate from free discussion). */

import type { DecisionCandidateStatus } from "@/lib/discussion/decisionCandidateStatus";

export type { DecisionCandidateStatus };

/** @deprecated Alias for DecisionCandidateStatus */
export type DecisionStatus = DecisionCandidateStatus;

export type AgentVote = "approve" | "reject" | "neutral";

export interface DecisionItem {
  id: string;
  title: string;
  rationale: string;
  sourceDiscussionId: string;
  sourceProposalId?: string;
  plannerVote: AgentVote;
  cooVote: AgentVote;
  plannerRationale?: string;
  cooRationale?: string;
  status?: DecisionCandidateStatus;
  /** @deprecated Use status — migrated via normalizeDecisionStatus */
  ceoDecision?: LegacyCeoDecisionField;
  impact?: string;
  createdAt: string;
  updatedAt: string;
}

type LegacyCeoDecisionField = "pending" | "approved" | "rejected" | "needs_discussion";

export type BriefChangeCandidateStatus = "pending_ceo" | "approved" | "applied" | "rejected";

/** CEO-approved path to Brief — not applied until commit. */
export interface BriefChangeCandidate {
  id: string;
  proposalId: string;
  decisionId: string;
  title: string;
  status: BriefChangeCandidateStatus;
  createdAt: string;
}

export interface MeetingMinutesDecisionEntry {
  title: string;
  plannerVote: AgentVote;
  cooVote: AgentVote;
  ceoVote?: DecisionCandidateStatus;
  result: DecisionCandidateStatus;
  reason: string;
  impact: string;
}

export interface MeetingMinutes {
  id: string;
  discussionTopics: string[];
  decisionsMade: MeetingMinutesDecisionEntry[];
  pendingDecisions?: string[];
  rejectedIdeas: string[];
  openQuestions: string[];
  briefChanges: string[];
  architectNotes: string[];
  generatedAt: string;
  turnCount: number;
  status: "draft" | "finalized";
}

export const DECISION_STATUS_LABELS: Record<DecisionCandidateStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  on_hold: "On Hold",
  applied_to_brief: "Applied to Brief",
};

export const AGENT_VOTE_LABELS: Record<AgentVote, string> = {
  approve: "Approve",
  reject: "Reject",
  neutral: "Neutral",
};

export function voteEmoji(vote: AgentVote): string {
  if (vote === "approve") return "👍";
  if (vote === "reject") return "👎";
  return "➖";
}
