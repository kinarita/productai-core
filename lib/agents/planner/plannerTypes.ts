import type { AgentAuditRecord, AgentRun } from "@/lib/agents/audit/agentAuditTypes";
import type {
  PlannerClarificationAssessment,
  PlannerQuestion,
} from "@/lib/agents/planner/plannerClarification";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PmfReadiness, PmfStage } from "@/lib/pmf/pmfJourney";
import type { PmfMeasurementStatus } from "@/lib/pmf/pmfStatus";
import type { CooReviewReport, ExecutiveDecisionStatus } from "@/lib/coo-review/cooReviewTypes";
import type {
  BriefApplyFeedback,
  BriefVersionAuditRecord,
} from "@/lib/brief-diff/briefDiffTypes";
import type {
  BriefChangeProposal,
  BriefVersionRecord,
  DiscussionMessage,
} from "@/lib/discussion/discussionTypes";
import type {
  BriefChangeCandidate,
  DecisionItem,
  MeetingMinutes,
} from "@/lib/discussion/decisionGovernanceTypes";
import type {
  ArchitectHandoffPreview,
  DiscussionMode,
  ExecutiveDecisionRecord,
  StrategySignal,
  StrategySummary,
} from "@/lib/discussion/strategyRoomTypes";
import type { DiscoveryMode, ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

export const PLANNER_PROMPT_VERSION = "planner-v6";

import type { AgentRunStatus } from "@/lib/agents/audit/agentAuditTypes";

export type PlannerRunStatus = AgentRunStatus;

export interface ProductBriefSections {
  projectSummary: string;
  problemStatement: string;
  targetUsers: string;
  successMetrics: string;
  coreFeatures: string[];
  outOfScope: string[];
  risks: string[];
  recommendedNextStep: string;
}

export interface PlannerGenerationResult {
  analysis: string;
  decisions: string[];
  reasoning: string[];
  brief: ProductBriefSections;
}

export type PlannerAuditRecord = AgentAuditRecord<
  ProjectCreationInput,
  PlannerGenerationResult
>;

/** Planner-facing view of a generic AgentRun (Phase 15). */
export interface PlannerAgentRun {
  missionId: string;
  status: PlannerRunStatus;
  input: ProjectCreationInput;
  analysis?: string;
  decisions?: string[];
  reasoning: string[];
  brief?: ProductBriefSections;
  audit?: PlannerAuditRecord;
  errorMessage?: string;
  clarificationRound?: number;
  lastAssessment?: PlannerClarificationAssessment;
  pendingQuestions?: PlannerQuestion[];
  clarificationHistory?: PlannerRunMeta["clarificationHistory"];
  discoveryMode?: DiscoveryMode;
  pmfReadiness?: PmfReadiness;
  currentPmfStage?: PmfStage;
  /** Pre-launch readiness aggregate — NOT achieved PMF (Phase 21A). */
  pmfReadinessScore?: number;
  pmfMeasurementStatus?: PmfMeasurementStatus;
  cooReviewReport?: CooReviewReport;
  /** @deprecated legacy storage key */
  ceoReviewReport?: CooReviewReport;
  executiveDecision?: ExecutiveDecisionStatus;
  validationReason?: string;
  validationRequestedAt?: string;
  ceoApprovedAt?: string;
  plannerRevalidationInFlight?: boolean;
  strengths?: string[];
  gaps?: string[];
  nextActions?: string[];
  opportunities?: string[];
  threats?: string[];
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  painPoints?: string[];
  burningNeeds?: string[];
  psfReport?: ProblemSolutionFitReport;
  validationAssumptions?: string[];
  validationRisks?: string[];
  mvpScope?: string[];
  /** Phase 22 — Discovery Discussion */
  discussionMessages?: DiscussionMessage[];
  /** Phase 28.5 — executive room persona memory */
  discussionPersonaMemory?: import("@/lib/discussion/discussionTypes").DiscussionPersonaMemory;
  pendingProposals?: BriefChangeProposal[];
  briefVersions?: BriefVersionRecord[];
  briefVersion?: number;
  latestApprovedBriefVersion?: number;
  briefVersionAudits?: BriefVersionAuditRecord[];
  lastBriefApplyFeedback?: BriefApplyFeedback;
  /** Phase 25 — Executive Strategy Room */
  discussionMode?: DiscussionMode;
  strategySignals?: StrategySignal[];
  executiveDecisions?: ExecutiveDecisionRecord[];
  strategySummary?: StrategySummary;
  architectHandoffPreview?: ArchitectHandoffPreview;
  decisionItems?: DecisionItem[];
  briefChangeCandidates?: BriefChangeCandidate[];
  meetingMinutes?: MeetingMinutes;
}

export type PlannerAgentRunRecord = PlannerStoredRun;

export interface PlannerProviderInput extends ProjectCreationInput {
  projectName: string;
  missionId?: string;
  clarificationRound?: number;
  /** Phase 17 — questions already asked (quick/guided caps). */
  questionsAskedSoFar?: number;
}

export interface PlannerAssessResult {
  analysis: string;
  decisions: string[];
  reasoning: string[];
  assessment: PlannerClarificationAssessment;
}

/** Stored on planner AgentRun (Phase 16). */
export interface PlannerRunMeta {
  discoveryMode: DiscoveryMode;
  clarificationRound: number;
  clarificationHistory: Array<{
    round: number;
    questions: PlannerQuestion[];
    answers: Record<string, string>;
  }>;
  lastAssessment?: PlannerClarificationAssessment;
  pendingQuestions?: PlannerQuestion[];
  pmfReadiness?: PmfReadiness;
  currentPmfStage?: PmfStage;
  /** Pre-launch readiness aggregate — NOT achieved PMF (Phase 21A). */
  pmfReadinessScore?: number;
  pmfMeasurementStatus?: PmfMeasurementStatus;
  cooReviewReport?: CooReviewReport;
  /** @deprecated legacy storage key */
  ceoReviewReport?: CooReviewReport;
  executiveDecision?: ExecutiveDecisionStatus;
  validationReason?: string;
  validationRequestedAt?: string;
  ceoApprovedAt?: string;
  cooReviewHistory?: CooReviewReport[];
  plannerRevalidationInFlight?: boolean;
  validationRequests?: Array<{ reason: string; requestedAt: string }>;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  cpfPainPoints?: string[];
  cpfBurningNeeds?: string[];
  psfReport?: ProblemSolutionFitReport;
  psfValidationAssumptions?: string[];
  psfValidationRisks?: string[];
  psfMvpScope?: string[];
  discussionMessages?: DiscussionMessage[];
  /** Phase 28.5 — executive room persona memory */
  discussionPersonaMemory?: import("@/lib/discussion/discussionTypes").DiscussionPersonaMemory;
  pendingProposals?: BriefChangeProposal[];
  briefVersions?: BriefVersionRecord[];
  briefVersion?: number;
  latestApprovedBriefVersion?: number;
  briefVersionAudits?: BriefVersionAuditRecord[];
  lastBriefApplyFeedback?: BriefApplyFeedback;
  discussionMode?: DiscussionMode;
  strategySignals?: StrategySignal[];
  executiveDecisions?: ExecutiveDecisionRecord[];
  strategySummary?: StrategySummary;
  architectHandoffPreview?: ArchitectHandoffPreview;
  decisionItems?: DecisionItem[];
  briefChangeCandidates?: BriefChangeCandidate[];
  meetingMinutes?: MeetingMinutes;
}

export type PlannerStoredRun = AgentRun<ProjectCreationInput, PlannerGenerationResult> & {
  plannerMeta?: PlannerRunMeta;
};
