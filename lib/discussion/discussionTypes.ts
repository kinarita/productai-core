import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { AgentVote } from "@/lib/discussion/decisionGovernanceTypes";
import type {
  BriefChangeSummary,
  BriefVersionDiff,
} from "@/lib/brief-diff/briefDiffTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";

export type DiscussionParticipant = "ceo" | "planner" | "coo";

/** Phase 27 — who should respond to this CEO turn. */
export type DiscussionTargetAudience = "all" | "planner" | "coo";

export type DiscussionRelatedSection = "opportunity" | "cpf" | "psf" | "brief" | "mvp";

export interface DiscussionMessage {
  id: string;
  missionId: string;
  participant: DiscussionParticipant;
  /** Short summary shown by default (Phase 24.5) */
  message: string;
  summary?: string;
  /** Expandable detailed analysis (Markdown) */
  detail?: string;
  createdAt: string;
  relatedSection?: DiscussionRelatedSection;
  /** CEO turn only — Phase 27 directed discussion */
  targetAudience?: DiscussionTargetAudience;
  /** Phase 28 — Stage 2: formal Decision Candidate suggested */
  suggestsDecisionCandidate?: boolean;
  /** Phase 28.5 — Stage 1: product decision may emerge (no Candidate yet) */
  discussionDecisionSignal?: boolean;
  /** Phase 29 — executive debate this turn */
  executiveDebate?: boolean;
  /** Phase 29 — agent stance this turn */
  agentVote?: AgentVote;
  /** Phase 29 — paired vote when executiveDebate (COO bubble shows Planner stance) */
  debatePartnerVote?: AgentVote;
  /** Phase 29.5 — debate clarity */
  debateTopic?: string;
  debatePlannerReason?: string;
  debateCooReason?: string;
  debateWhy?: string;
  debateSummary?: string;
  /** Phase 29.6 — debate closed after CEO decision */
  debateResolved?: boolean;
  debateResolutionStatus?: import("@/lib/discussion/decisionCandidateStatus").DecisionCandidateStatus;
  /** Phase 29.6 — link to governing Decision Candidate */
  debateDecisionId?: string;
}

export interface BeliefConflictRecord {
  topic: string;
  plannerBelief: string;
  cooBelief: string;
  ceoDecision?: string;
}

/** Phase 28.5 — cross-turn CEO & topic memory for Planner/COO */
export interface DiscussionPersonaMemory {
  ceoHypotheses: string[];
  ceoConcerns: string[];
  ceoValues: string[];
  unresolvedTopics: string[];
  adoptedTopics: string[];
  /** Phase 29.5 — template phrase tracking */
  usedPlannerTemplates?: string[];
  usedCooTemplates?: string[];
  beliefConflicts?: BeliefConflictRecord[];
}

export interface BriefChangeProposal {
  id: string;
  title: string;
  /** @deprecated use reason — kept for backward compatibility */
  description: string;
  reason: string;
  impact: string;
  affectedSections: DiscussionRelatedSection[];
  targetSection: DiscussionRelatedSection;
  before: string;
  after: string;
  confidence: number;
  /** Phase 26: awaiting_decision → brief_candidate → applied */
  status: "pending" | "awaiting_decision" | "brief_candidate" | "applied" | "dismissed";
  proposedAt: string;
  messageId?: string;
}

export interface BriefVersionRecord {
  version: number;
  label: string;
  brief: ProductBriefSections;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  psfMvpScope?: string[];
  createdAt: string;
  source: "initial" | "discussion_apply" | "validation_apply";
  proposalId?: string;
  previousVersionId?: number;
  changeSummary?: BriefChangeSummary;
  diff?: BriefVersionDiff;
  reason?: string;
  impact?: string;
  confidence?: number;
  appliedBy?: "ceo";
}

export const DISCUSSION_PROMPT_VERSION = "strategic-discussion-v2";

export const EXAMPLE_DISCUSSION_PROMPTS = [
  "Should graphs be part of MVP?",
  "What are competitors doing?",
  "Is the target audience too broad?",
  "What could cause this product to fail?",
  "What would increase PMF confidence?",
] as const;
