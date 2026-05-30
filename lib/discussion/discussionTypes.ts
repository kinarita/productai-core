import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type {
  BriefChangeSummary,
  BriefVersionDiff,
} from "@/lib/brief-diff/briefDiffTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";

export type DiscussionParticipant = "ceo" | "planner" | "coo";

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
  status: "pending" | "applied" | "dismissed";
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
