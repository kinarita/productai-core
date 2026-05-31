"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  agentRunKey,
  createAuditId,
  type AgentAuditRecord,
  type AgentId,
  type AgentRun,
} from "@/lib/agents/audit/agentAuditTypes";
import {
  getAgentAuditTrail,
  getLatestAgentRun,
  getMissionAuditTrail,
} from "@/lib/agents/audit/agentAuditSelectors";
import { toPlannerAgentRun } from "@/lib/agents/audit/plannerRunAdapter";
import { formatProductBriefMarkdown } from "@/lib/agents/planner/formatProductBrief";
import { plannerPromptHashAsync } from "@/lib/agents/planner/plannerPromptHash";
import {
  countQuestionsAskedForRun,
  MAX_CLARIFICATION_ROUNDS,
} from "@/lib/agents/planner/plannerClarification";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import {
  computePmfReadinessFromSignals,
  inferCurrentPmfStage,
} from "@/lib/pmf/pmfJourney";
import type { PmfReadiness, PmfStage } from "@/lib/pmf/pmfJourney";
import {
  computeAggregatePmfReadinessScore,
  inferPmfMeasurementStatus,
} from "@/lib/pmf/pmfStatus";
import type { CooReviewReport, ExecutiveDecisionStatus } from "@/lib/coo-review/cooReviewTypes";
import {
  migrateLegacyReviewReport,
  defaultExecutiveDecisionForReport,
} from "@/lib/coo-review/cooReviewMigration";
import {
  pipelineStageAfterCooReview,
  pipelineStageAfterExecutiveDecision,
} from "@/lib/coo-review/projectPipelineStage";
import {
  cooReviewCompletedActivity,
  cooRecommendationActivity,
  cooReviewStartedActivity,
  ceoApprovalRequestedActivity,
  organizationFeedMessageForCooReviewComplete,
} from "@/lib/coo-review/cooReviewActivity";
import {
  humanCeoDecisionAudit,
  validationRequestedAudit,
  buildExecutiveAuditRecord,
} from "@/lib/coo-review/executiveAudit";
import {
  plannerReceivedValidationRequestActivity,
  plannerUpdatedValidationAnalysisActivity,
  plannerRegeneratedRecommendationInputsActivity,
  cooReviewRerunActivity,
} from "@/lib/coo-review/plannerRevalidationActivity";
import {
  ceoApprovalCompletedTimelineActivity,
  ceoApprovedArchitectureActivity,
  ceoPlacedOnHoldActivity,
  ceoRequestedValidationActivity,
} from "@/lib/coo-review/ceoApprovalActivity";
import { buildChangeSummary } from "@/lib/brief-diff/buildChangeSummary";
import { buildBriefDiffAuditRecord } from "@/lib/brief-diff/briefDiffAudit";
import type { BriefApplyFeedback, BriefVersionAuditRecord } from "@/lib/brief-diff/briefDiffTypes";
import { compareBriefVersions } from "@/lib/brief-diff/computeBriefDiff";
import {
  briefDiffGeneratedActivity,
  briefVersionCreatedActivity,
  plannerAppliedChangeActivity,
} from "@/lib/discussion/briefDiffActivity";
import { appendBriefVersion, seedInitialBriefVersion } from "@/lib/discussion/briefVersioning";
import { applyBriefChangeProposal } from "@/lib/discussion/applyBriefChangeProposal";
import {
  briefUpdatedVersionActivity,
  suggestedChangeAppliedActivity,
  cooRespondedToDiscussionActivity,
  plannerRespondedToDiscussionActivity,
  suggestedChangeProposedActivity,
} from "@/lib/discussion/discussionActivity";
import { buildArchitectHandoffPreview } from "@/lib/discussion/buildArchitectHandoffPreview";
import { buildDiscussionAuditRecord } from "@/lib/discussion/discussionAudit";
import { detectStrategySignals } from "@/lib/discussion/detectStrategySignals";
import { createDecisionItemFromCeoMessage } from "@/lib/discussion/createDecisionFromProposal";
import {
  createDecisionFromDiscussionTurn,
  inferDecisionVotesWithReasons,
  inferInternalDiscussionMode,
  inferVotesFromDiscussionTurn,
  registerAutoDecisionsFromProposals,
  shouldAutoCreateDecisionCandidate,
} from "@/lib/discussion/autoDecisionCandidate";
import { shouldShowDiscussionDecisionSignal } from "@/lib/discussion/decisionCandidateDiscipline";
import { classifyDiscussionIntent } from "@/lib/discussion/discussionIntent";
import {
  updatePersonaMemory,
} from "@/lib/discussion/personaMemory";
import {
  appendBeliefConflictToMemory,
} from "@/lib/discussion/buildBeliefConflicts";
import {
  buildExecutiveDebateContext,
  cooBeliefFromReason,
  isExecutiveDebate,
  plannerBeliefFromReason,
} from "@/lib/discussion/executiveDebate";
import {
  linkDebatesToDecision,
  resolveDebatesForDecision,
} from "@/lib/discussion/resolveExecutiveDebate";
import { recordTemplateUsage } from "@/lib/discussion/templatePhraseGuard";
import {
  personaSelfCheckCoo,
  personaSelfCheckPlanner,
} from "@/lib/discussion/executivePersonaProfiles";
import {
  audienceIncludesCoo,
  audienceIncludesPlanner,
  resolveDiscussionAudience,
} from "@/lib/discussion/resolveDiscussionAudience";
import { generateMeetingMinutes } from "@/lib/discussion/generateMeetingMinutes";
import { buildDecisionGovernanceAuditRecord } from "@/lib/discussion/decisionGovernanceAudit";
import {
  briefChangeCandidateCreatedActivity,
  decisionApprovedActivity,
  decisionProposedActivity,
  decisionRejectedActivity,
  meetingMinutesGeneratedActivity,
} from "@/lib/discussion/decisionGovernanceActivity";
import type {
  BriefChangeCandidate,
  DecisionCandidateStatus,
  DecisionItem,
} from "@/lib/discussion/decisionGovernanceTypes";
import {
  countPendingDecisionCandidates,
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import {
  cooRaisedBusinessConcernActivity,
  executiveDiscussionStartedActivity,
  plannerChallengedAssumptionActivity,
} from "@/lib/discussion/strategyRoomActivity";
import { buildStrategyRoomAuditRecord } from "@/lib/discussion/strategyRoomAudit";
import type {
  BriefChangeProposal,
  DiscussionMessage,
  DiscussionTargetAudience,
} from "@/lib/discussion/discussionTypes";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";
import type {
  PlannerAgentRun,
  PlannerGenerationResult,
  PlannerRunMeta,
  PlannerRunStatus,
  PlannerStoredRun,
  ProductBriefSections,
} from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";
import type { ProjectActivityItem, ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";

const LEGACY_PLANNER_STORAGE_KEY = "productai-planner-agent";
const MAX_AUDIT_TRAIL = 500;

const plannerGenerationInFlight = new Set<string>();

function activityId(): string {
  return `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function projectNameFromIdea(idea: string): string {
  const firstLine = idea.split("\n")[0]?.trim() ?? idea.trim();
  if (firstLine.length <= 48) return firstLine;
  return `${firstLine.slice(0, 45)}…`;
}

function plannerStorageKey(missionId: string): string {
  return agentRunKey(missionId, "product_planner");
}

function getStoredPlannerRun(
  get: AgentRunsGet,
  missionId: string
): PlannerStoredRun | undefined {
  return get().runs[plannerStorageKey(missionId)] as PlannerStoredRun | undefined;
}

function resolvePmfStageFields(pmfReadiness: PmfReadiness) {
  const pmfMeasurementStatus = inferPmfMeasurementStatus();
  const pmfReadinessScore = computeAggregatePmfReadinessScore(pmfReadiness);
  const currentPmfStage = inferCurrentPmfStage(pmfReadiness, { pmfMeasurementStatus });
  return { pmfReadinessScore, pmfMeasurementStatus, currentPmfStage };
}

function mergePlannerMeta(
  base: PlannerRunMeta | undefined,
  patch: Partial<PlannerRunMeta>
): PlannerRunMeta {
  const pmfReadiness = patch.pmfReadiness ?? base?.pmfReadiness;
  const pmfFields = pmfReadiness ? resolvePmfStageFields(pmfReadiness) : undefined;

  return {
    discoveryMode: patch.discoveryMode ?? base?.discoveryMode ?? "quick",
    clarificationRound: patch.clarificationRound ?? base?.clarificationRound ?? 0,
    clarificationHistory: patch.clarificationHistory ?? base?.clarificationHistory ?? [],
    lastAssessment: patch.lastAssessment ?? base?.lastAssessment,
    pendingQuestions:
      "pendingQuestions" in patch ? patch.pendingQuestions : base?.pendingQuestions,
    pmfReadiness,
    currentPmfStage:
      patch.currentPmfStage ?? pmfFields?.currentPmfStage ?? base?.currentPmfStage,
    pmfReadinessScore:
      patch.pmfReadinessScore ?? pmfFields?.pmfReadinessScore ?? base?.pmfReadinessScore,
    pmfMeasurementStatus:
      patch.pmfMeasurementStatus ??
      pmfFields?.pmfMeasurementStatus ??
      base?.pmfMeasurementStatus,
    opportunityBrief: patch.opportunityBrief ?? base?.opportunityBrief,
    cpfReport: patch.cpfReport ?? base?.cpfReport,
    cpfPainPoints: patch.cpfPainPoints ?? base?.cpfPainPoints,
    cpfBurningNeeds: patch.cpfBurningNeeds ?? base?.cpfBurningNeeds,
    psfReport: patch.psfReport ?? base?.psfReport,
    psfValidationAssumptions:
      patch.psfValidationAssumptions ?? base?.psfValidationAssumptions,
    psfValidationRisks: patch.psfValidationRisks ?? base?.psfValidationRisks,
    psfMvpScope: patch.psfMvpScope ?? base?.psfMvpScope,
    cooReviewReport:
      patch.cooReviewReport ??
      migrateLegacyReviewReport(patch.ceoReviewReport) ??
      migrateLegacyReviewReport(base?.cooReviewReport ?? base?.ceoReviewReport),
    executiveDecision:
      patch.executiveDecision ??
      base?.executiveDecision ??
      defaultExecutiveDecisionForReport(
        patch.cooReviewReport ??
          migrateLegacyReviewReport(patch.ceoReviewReport) ??
          migrateLegacyReviewReport(base?.cooReviewReport ?? base?.ceoReviewReport)
      ),
    validationReason: patch.validationReason ?? base?.validationReason,
    validationRequestedAt: patch.validationRequestedAt ?? base?.validationRequestedAt,
    ceoApprovedAt: patch.ceoApprovedAt ?? base?.ceoApprovedAt,
    cooReviewHistory: patch.cooReviewHistory ?? base?.cooReviewHistory,
    plannerRevalidationInFlight:
      patch.plannerRevalidationInFlight ?? base?.plannerRevalidationInFlight,
    validationRequests: patch.validationRequests ?? base?.validationRequests,
    discussionMessages: patch.discussionMessages ?? base?.discussionMessages,
    discussionPersonaMemory:
      patch.discussionPersonaMemory ?? base?.discussionPersonaMemory,
    pendingProposals: patch.pendingProposals ?? base?.pendingProposals,
    briefVersions: patch.briefVersions ?? base?.briefVersions,
    briefVersion: patch.briefVersion ?? base?.briefVersion,
    latestApprovedBriefVersion:
      patch.latestApprovedBriefVersion ?? base?.latestApprovedBriefVersion,
    briefVersionAudits: patch.briefVersionAudits ?? base?.briefVersionAudits,
    lastBriefApplyFeedback: patch.lastBriefApplyFeedback ?? base?.lastBriefApplyFeedback,
    discussionMode: patch.discussionMode ?? base?.discussionMode,
    strategySignals: patch.strategySignals ?? base?.strategySignals,
    executiveDecisions: patch.executiveDecisions ?? base?.executiveDecisions,
    strategySummary: patch.strategySummary ?? base?.strategySummary,
    architectHandoffPreview: patch.architectHandoffPreview ?? base?.architectHandoffPreview,
    decisionItems: patch.decisionItems ?? base?.decisionItems,
    briefChangeCandidates: patch.briefChangeCandidates ?? base?.briefChangeCandidates,
    meetingMinutes: patch.meetingMinutes ?? base?.meetingMinutes,
  };
}

/** Persist pipeline progress so HMR / reload can resume without losing opportunity/cpf/psf. */
function persistPlannerRun(
  set: AgentRunsSet,
  key: string,
  patch: Partial<PlannerStoredRun> & { plannerMeta?: Partial<PlannerRunMeta> }
) {
  set((state) => {
    const current = state.runs[key] as PlannerStoredRun | undefined;
    if (!current) return state;
    const { plannerMeta: metaPatch, ...runPatch } = patch;
    return {
      runs: {
        ...state.runs,
        [key]: {
          ...current,
          ...runPatch,
          plannerMeta: metaPatch ? mergePlannerMeta(current.plannerMeta, metaPatch) : current.plannerMeta,
        },
      },
    };
  });
}

function pipelineIncomplete(run: PlannerStoredRun | undefined): boolean {
  if (!run?.plannerMeta?.lastAssessment) return false;
  const meta = run.plannerMeta;
  return !meta.opportunityBrief || !meta.cpfReport || !meta.psfReport || !run.audit?.output?.brief;
}

function canResumePlannerPipeline(run: PlannerStoredRun | undefined): boolean {
  if (!run) return false;
  if (run.status === "awaiting_clarification") return false;
  if (run.status === "completed" && run.audit?.output?.brief) return false;
  return pipelineIncomplete(run);
}

function failPlannerRunPreservingMeta(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  message: string,
  audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>
) {
  const key = plannerStorageKey(missionId);
  const latest = getStoredPlannerRun(get, missionId);
  if (!latest) return;
  if (audit) get().appendAudit(audit);
  set((state) => ({
    runs: {
      ...state.runs,
      [key]: {
        ...latest,
        status: "failed",
        errorMessage: message,
        audit: audit ?? latest.audit,
      },
    },
  }));
}

type AgentRunsGet = () => AgentRunsState;
type AgentRunsSet = (
  partial:
    | Partial<AgentRunsState>
    | ((state: AgentRunsState) => Partial<AgentRunsState> | AgentRunsState)
) => void;

async function ensureOpportunityDiscovery(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  opportunityBrief: OpportunityBrief;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  opportunityAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
}> {
  const existing = ctx.run.plannerMeta?.opportunityBrief;
  if (existing) {
    const pmfReadiness =
      ctx.run.plannerMeta?.pmfReadiness ??
      computePmfReadinessFromSignals({
        completenessScore: ctx.run.plannerMeta?.lastAssessment?.completenessScore ?? 60,
        missingAreas: [],
        strengths: [],
        gaps: [],
        hasBrief: false,
        hasOpportunityBrief: true,
        discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
      });
    return {
      opportunityBrief: existing,
      pmfReadiness,
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? inferCurrentPmfStage(pmfReadiness),
      opportunityAudit: {
        id: createAuditId(),
        missionId: ctx.missionId,
        agentId: "product_planner",
        timestamp: new Date().toISOString(),
        providerId: "cached",
        model: "cached",
        promptVersion: `${PLANNER_PROMPT_VERSION}-opportunity`,
        input: ctx.providerInput,
        reasoning: [],
        status: "success",
      },
    };
  }

  get().appendPlannerActivity(ctx.missionId, "Planner started opportunity discovery");

  const response = await fetch("/api/agents/planner/opportunity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
    }),
  });

  const data = (await response.json()) as {
    opportunityBrief?: OpportunityBrief;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.opportunityBrief) {
    throw new Error(data.error ?? "Opportunity discovery failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivity(ctx.missionId, "Opportunity discovery completed");

  return {
    opportunityBrief: data.opportunityBrief,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? inferCurrentPmfStage(data.pmfReadiness!),
    opportunityAudit: data.audit!,
  };
}

async function ensureCustomerProblemFit(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  cpfReport: CustomerProblemFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  painPoints: string[];
  burningNeeds: string[];
}> {
  const existing = ctx.run.plannerMeta?.cpfReport;
  if (existing) {
    return {
      cpfReport: existing,
      pmfReadiness:
        ctx.run.plannerMeta?.pmfReadiness ??
        computePmfReadinessFromSignals({
          completenessScore: 60,
          missingAreas: [],
          strengths: [],
          gaps: [],
          hasBrief: false,
          hasOpportunityBrief: !!ctx.run.plannerMeta?.opportunityBrief,
          hasCpfReport: true,
          discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
        }),
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? "cpf",
      painPoints: ctx.run.plannerMeta?.cpfPainPoints ?? [],
      burningNeeds: ctx.run.plannerMeta?.cpfBurningNeeds ?? [],
    };
  }

  get().appendPlannerActivities(ctx.missionId, [
    "Planner identified customer persona",
    "Planner identified customer pain points",
  ]);

  const response = await fetch("/api/agents/planner/cpf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
      opportunityBrief: ctx.run.plannerMeta?.opportunityBrief,
    }),
  });

  const data = (await response.json()) as {
    cpfReport?: CustomerProblemFitReport;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    painPoints?: string[];
    burningNeeds?: string[];
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.cpfReport) {
    throw new Error(data.error ?? "CPF analysis failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivities(ctx.missionId, [
    "Planner evaluated burning need",
    "Planner completed CPF analysis",
  ]);

  return {
    cpfReport: data.cpfReport,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? "cpf",
    painPoints: data.painPoints ?? [],
    burningNeeds: data.burningNeeds ?? [],
  };
}

async function ensureProblemSolutionFit(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
  }
): Promise<{
  psfReport: ProblemSolutionFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  validationAssumptions: string[];
  validationRisks: string[];
  mvpScope: string[];
}> {
  const existing = ctx.run.plannerMeta?.psfReport;
  if (existing) {
    return {
      psfReport: existing,
      pmfReadiness:
        ctx.run.plannerMeta?.pmfReadiness ??
        computePmfReadinessFromSignals({
          completenessScore: 60,
          missingAreas: [],
          strengths: [],
          gaps: [],
          hasBrief: false,
          hasOpportunityBrief: !!ctx.run.plannerMeta?.opportunityBrief,
          hasCpfReport: !!ctx.run.plannerMeta?.cpfReport,
          hasPsfReport: true,
          discoveryMode: ctx.providerInput.discoveryMode ?? "quick",
        }),
      currentPmfStage: ctx.run.plannerMeta?.currentPmfStage ?? "psf",
      validationAssumptions: ctx.run.plannerMeta?.psfValidationAssumptions ?? [],
      validationRisks: ctx.run.plannerMeta?.psfValidationRisks ?? [],
      mvpScope: ctx.run.plannerMeta?.psfMvpScope ?? [],
    };
  }

  get().appendPlannerActivity(ctx.missionId, "Planner generated solution hypothesis");

  const response = await fetch("/api/agents/planner/psf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      assessment: ctx.run.plannerMeta?.lastAssessment,
      opportunityBrief: ctx.run.plannerMeta?.opportunityBrief,
      cpfReport: ctx.run.plannerMeta?.cpfReport,
    }),
  });

  const data = (await response.json()) as {
    psfReport?: ProblemSolutionFitReport;
    pmfReadiness?: PmfReadiness;
    currentPmfStage?: PmfStage;
    validationAssumptions?: string[];
    validationRisks?: string[];
    mvpScope?: string[];
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.psfReport) {
    throw new Error(data.error ?? "PSF analysis failed");
  }

  if (data.audit) get().appendAudit(data.audit);
  get().appendPlannerActivities(ctx.missionId, [
    "Planner identified validation risks",
    "Planner proposed MVP scope",
    "Planner completed PSF analysis",
  ]);

  return {
    psfReport: data.psfReport,
    pmfReadiness: data.pmfReadiness!,
    currentPmfStage: data.currentPmfStage ?? "psf",
    validationAssumptions: data.validationAssumptions ?? [],
    validationRisks: data.validationRisks ?? [],
    mvpScope: data.mvpScope ?? [],
  };
}

async function ensureCooReview(
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    run: PlannerStoredRun;
    brief: ProductBriefSections;
    briefAudit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    forceRerun?: boolean;
  }
): Promise<{ report: CooReviewReport; cooReviewHistory: CooReviewReport[] }> {
  const meta = ctx.run.plannerMeta;
  const priorHistory = meta?.cooReviewHistory ?? [];
  const existing =
    meta?.cooReviewReport ?? migrateLegacyReviewReport(meta?.ceoReviewReport);
  if (existing && !ctx.forceRerun) {
    return { report: existing, cooReviewHistory: priorHistory };
  }
  const history = existing && ctx.forceRerun ? [...priorHistory, existing] : priorHistory;

  if (!ctx.forceRerun) {
    useProjectCreationStore.setState((state) => ({
      activities: [cooReviewStartedActivity(ctx.missionId), ...state.activities].slice(0, 120),
    }));
  } else {
    useProjectCreationStore.setState((state) => ({
      activities: [cooReviewRerunActivity(ctx.missionId), ...state.activities].slice(0, 120),
    }));
  }

  const response = await fetch("/api/agents/planner/coo-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...ctx.providerInput,
      opportunityBrief: meta?.opportunityBrief,
      cpfReport: meta?.cpfReport,
      psfReport: meta?.psfReport,
      brief: ctx.brief,
      assessment: meta?.lastAssessment,
      auditSummary: ctx.briefAudit?.analysis,
      discoveryInsights: {
        strengths: meta?.lastAssessment?.strengths,
        gaps: meta?.lastAssessment?.gaps,
        nextActions: meta?.lastAssessment?.nextActions,
        painPoints: meta?.cpfPainPoints,
        validationRisks: meta?.psfValidationRisks,
        validationAssumptions: meta?.psfValidationAssumptions,
        mvpScope: meta?.psfMvpScope,
      },
    }),
  });

  const data = (await response.json()) as {
    cooReviewReport?: CooReviewReport;
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
    error?: string;
  };

  if (!response.ok || !data.cooReviewReport) {
    throw new Error(data.error ?? "COO review failed");
  }

  if (data.audit) get().appendAudit(data.audit);

  if (ctx.forceRerun) {
    get().appendAudit(
      buildExecutiveAuditRecord({
        missionId: ctx.missionId,
        eventType: "coo_review_rerun",
        summary: `COO review rerun after Planner re-validation (recommendation: ${data.cooReviewReport!.recommendation}).`,
        reasoning: [
          "WHY: Prior COO recommendation archived in cooReviewHistory.",
          `WHY: New overall score ${data.cooReviewReport!.overallScore}/100.`,
        ],
        runInput: ctx.providerInput,
      })
    );
  }

  useProjectCreationStore.setState((state) => ({
    activities: [
      cooReviewCompletedActivity(ctx.missionId),
      cooRecommendationActivity(ctx.missionId, data.cooReviewReport!.recommendation),
      ceoApprovalRequestedActivity(ctx.missionId),
      ...state.activities,
    ].slice(0, 120),
  }));

  return { report: data.cooReviewReport, cooReviewHistory: history };
}

function applyCooReviewToMission(missionId: string, report: CooReviewReport) {
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            cooReviewReport: report,
            executiveDecision: "awaiting_ceo_approval" as const,
            projectPipelineStage: pipelineStageAfterCooReview(),
            plannerRevalidationInFlight: false,
            summary: `COO review complete — Discovery Discussion open for ${m.name}.`,
            recentActivity: "COO review completed — Discovery Discussion ready",
            progress: Math.max(m.progress, 30),
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

async function runPlannerRevalidationForMission(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  validationReason: string
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const brief = run?.audit?.output?.brief as ProductBriefSections | undefined;
  const meta = run?.plannerMeta;
  if (!run || !brief || !meta || !validationReason.trim()) return;

  const projectName = projectNameFromIdea(run.input.idea);
  const providerInput = {
    ...run.input,
    projectName,
    missionId,
    clarificationRound: meta.clarificationRound ?? 0,
  };

  const validationRequests = [
    ...(meta.validationRequests ?? []),
    { reason: validationReason, requestedAt: new Date().toISOString() },
  ];

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(meta, {
      plannerRevalidationInFlight: true,
      validationRequests,
    }),
  });

  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            plannerRevalidationInFlight: true,
            summary: `Needs validation — Planner is reviewing CEO request for ${m.name}.`,
            recentActivity: "CEO requested more validation",
            updatedAt: "Just now",
          }
        : m
    ),
  }));

  get().appendAudit(
    buildExecutiveAuditRecord({
      missionId,
      eventType: "planner_revalidation_started",
      summary: "Planner re-validation started after CEO validation request.",
      reasoning: [`WHY: ${validationReason}`],
      runInput: run.input,
    })
  );

  useProjectCreationStore.setState((state) => ({
    activities: [
      plannerReceivedValidationRequestActivity(missionId),
      ...state.activities,
    ].slice(0, 120),
  }));

  try {
    const response = await fetch("/api/agents/planner/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...providerInput,
        assessment: meta.lastAssessment,
        opportunityBrief: meta.opportunityBrief,
        cpfReport: meta.cpfReport,
        psfReport: meta.psfReport,
        brief,
        validationReason,
      }),
    });

    const data = (await response.json()) as {
      opportunityBrief?: OpportunityBrief;
      cpfReport?: CustomerProblemFitReport;
      psfReport?: ProblemSolutionFitReport;
      brief?: ProductBriefSections;
      assessment?: PlannerRunMeta["lastAssessment"];
      pmfReadiness?: PmfReadiness;
      currentPmfStage?: PmfStage;
      validationAssumptions?: string[];
      validationRisks?: string[];
      mvpScope?: string[];
      audits?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>[];
      error?: string;
    };

    if (!response.ok || !data.brief || !data.opportunityBrief || !data.cpfReport || !data.psfReport) {
      throw new Error(data.error ?? "Planner revalidation failed");
    }

    for (const audit of data.audits ?? []) {
      get().appendAudit(audit);
    }

    useProjectCreationStore.setState((state) => ({
      activities: [
        plannerUpdatedValidationAnalysisActivity(missionId),
        plannerRegeneratedRecommendationInputsActivity(missionId),
        ...state.activities,
      ].slice(0, 120),
    }));

    const updatedOutput: PlannerGenerationResult = {
      ...(run.audit?.output as PlannerGenerationResult),
      brief: data.brief,
      analysis: `Planner re-validated after CEO request: ${validationReason.slice(0, 160)}`,
    };

    const latestRun = getStoredPlannerRun(get, missionId)!;
    persistPlannerRun(set, key, {
      audit: run.audit
        ? { ...run.audit, output: updatedOutput, status: "success" }
        : run.audit,
      plannerMeta: mergePlannerMeta(latestRun.plannerMeta, {
        lastAssessment: data.assessment ?? meta.lastAssessment,
        opportunityBrief: data.opportunityBrief,
        cpfReport: data.cpfReport,
        cpfPainPoints: data.cpfReport.painPoints.map((p) => p.text),
        cpfBurningNeeds: meta.cpfBurningNeeds,
        psfReport: data.psfReport,
        psfValidationAssumptions: data.validationAssumptions,
        psfValidationRisks: data.validationRisks,
        psfMvpScope: data.mvpScope,
        pmfReadiness: data.pmfReadiness,
        currentPmfStage: data.currentPmfStage,
        plannerRevalidationInFlight: true,
      }),
    });

    applyBriefToMission(missionId, projectName, data.brief);

    const runAfterBrief = getStoredPlannerRun(get, missionId)!;
    const { report: cooReviewReport, cooReviewHistory } = await ensureCooReview(get, {
      missionId,
      providerInput,
      run: runAfterBrief,
      brief: data.brief,
      briefAudit: runAfterBrief.audit as AgentAuditRecord<
        ProjectCreationInput,
        PlannerGenerationResult
      >,
      forceRerun: true,
    });

    persistPlannerRun(set, key, {
      plannerMeta: mergePlannerMeta(getStoredPlannerRun(get, missionId)!.plannerMeta, {
        cooReviewReport,
        cooReviewHistory,
        executiveDecision: "awaiting_ceo_approval",
        plannerRevalidationInFlight: false,
      }),
    });

    get().appendAudit(
      buildExecutiveAuditRecord({
        missionId,
        eventType: "planner_revalidation_completed",
        summary: "Planner re-validation completed; discovery artifacts updated.",
        reasoning: [`WHY: Addressed CEO validation — ${validationReason}`],
        runInput: run.input,
      })
    );

    applyCooReviewToMission(missionId, cooReviewReport);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner revalidation failed";
    get().appendPlannerActivity(missionId, message);
    persistPlannerRun(set, key, {
      plannerMeta: mergePlannerMeta(getStoredPlannerRun(get, missionId)?.plannerMeta, {
        plannerRevalidationInFlight: false,
      }),
    });
    useMissionStore.setState((state) => ({
      missions: state.missions.map((m) =>
        m.id === missionId ? { ...m, plannerRevalidationInFlight: false } : m
      ),
    }));
  }
}

function discussionMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function executiveDecisionId(): string {
  return `dec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function briefCandidateId(): string {
  return `bcc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function refreshArchitectHandoffForRun(
  run: PlannerStoredRun,
  projectName: string
): PlannerRunMeta["architectHandoffPreview"] {
  const meta = run.plannerMeta;
  const brief = run.audit?.output?.brief as ProductBriefSections | undefined;
  if (!meta || !brief) return undefined;
  return buildArchitectHandoffPreview({
    projectName,
    brief,
    briefVersion: meta.briefVersion,
    decisionItems: meta.decisionItems ?? [],
    strategySignals: meta.strategySignals ?? [],
    meetingMinutes: meta.meetingMinutes,
    appliedProposals: meta.pendingProposals ?? [],
    briefChangeCandidates: meta.briefChangeCandidates ?? [],
    discussionMessages: meta.discussionMessages ?? [],
  });
}

function setDiscussionModeOnMission(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  mode: DiscussionMode
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  if (!run?.plannerMeta) return;
  const projectName = projectNameFromIdea(run.input.idea);
  const nextMeta = mergePlannerMeta(run.plannerMeta, { discussionMode: mode });
  const handoff = refreshArchitectHandoffForRun(
    { ...run, plannerMeta: nextMeta },
    projectName
  );
  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
  });
  get().appendAudit(
    buildStrategyRoomAuditRecord({
      missionId,
      eventType: "discussion_mode_set",
      summary: `Discussion mode set to ${mode}`,
      reasoning: [`WHY: CEO selected ${mode} mode for Executive Strategy Room.`],
      discussionMode: mode,
      runInput: run.input,
    })
  );
}

function createDecisionFromMessageOnMission(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  input: { messageId: string; message: string; title?: string }
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const item = createDecisionItemFromCeoMessage(input);
  const decisionItems = [...(meta.decisionItems ?? []), item];
  const nextMeta = mergePlannerMeta(meta, { decisionItems });
  const projectName = projectNameFromIdea(run.input.idea);
  const handoff = refreshArchitectHandoffForRun(
    { ...run, plannerMeta: nextMeta },
    projectName
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
  });

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: "decision_created",
      summary: `Decision created: ${item.title}`,
      reasoning: [`WHY: ${item.rationale.slice(0, 120)}`],
      decisionItems,
      runInput: run.input,
    })
  );

  useProjectCreationStore.setState((state) => ({
    activities: [decisionProposedActivity(missionId, item.title), ...state.activities].slice(
      0,
      120
    ),
  }));
}

function setCeoDecisionOnItem(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  decisionId: string,
  status: DecisionCandidateStatus
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const now = new Date().toISOString();
  const prior = meta.decisionItems?.find((d) => d.id === decisionId);
  if (!prior) return;

  let decisionItems = (meta.decisionItems ?? []).map((d) =>
    d.id === decisionId ? { ...d, status, ceoDecision: undefined, updatedAt: now } : d
  );
  const item = decisionItems.find((d) => d.id === decisionId)!;

  let pendingProposals = meta.pendingProposals ?? [];
  if (status === "rejected" && item.sourceProposalId) {
    pendingProposals = pendingProposals.map((p) =>
      p.id === item.sourceProposalId ? { ...p, status: "dismissed" as const } : p
    );
  }

  const discussionMessages = resolveDebatesForDecision(
    meta.discussionMessages ?? [],
    item,
    status
  );

  let nextMeta = mergePlannerMeta(meta, {
    decisionItems,
    pendingProposals,
    discussionMessages,
  });
  const projectName = projectNameFromIdea(run.input.idea);
  let handoff = refreshArchitectHandoffForRun({ ...run, plannerMeta: nextMeta }, projectName);

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
  });

  const auditEvent: import("@/lib/discussion/decisionGovernanceAudit").DecisionGovernanceAuditEventType =
    status === "approved"
      ? "decision_approved"
      : status === "rejected"
        ? "decision_rejected"
        : status === "on_hold"
          ? "decision_on_hold"
          : "decision_needs_discussion";

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: auditEvent,
      summary: `CEO ${status} on decision: ${item.title}`,
      reasoning: [`WHY: Governance decision on ${item.title}`],
      decisionItems,
      runInput: run.input,
    })
  );

  const activity =
    status === "approved"
      ? decisionApprovedActivity(missionId, item.title)
      : status === "rejected"
        ? decisionRejectedActivity(missionId, item.title)
        : decisionProposedActivity(missionId, `${item.title} (${status})`);

  useProjectCreationStore.setState((state) => ({
    activities: [activity, ...state.activities].slice(0, 120),
  }));

  if (status === "approved" && item.sourceProposalId) {
    applyApprovedDecisionToBrief(set, get, missionId, decisionId);
    const latest = getStoredPlannerRun(get, missionId);
    if (!latest?.plannerMeta) return;
    decisionItems = (latest.plannerMeta.decisionItems ?? []).map((d) =>
      d.id === decisionId
        ? { ...d, status: "applied_to_brief" as const, updatedAt: now }
        : d
    );
    nextMeta = mergePlannerMeta(latest.plannerMeta, { decisionItems });
    handoff = refreshArchitectHandoffForRun({ ...latest, plannerMeta: nextMeta }, projectName);
    persistPlannerRun(set, key, {
      plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
    });
    get().appendAudit(
      buildDecisionGovernanceAuditRecord({
        missionId,
        eventType: "decision_auto_applied_to_brief",
        summary: `Brief updated from approved decision: ${item.title}`,
        reasoning: [`WHY: CEO 採用 — automatic Brief vNext from proposal ${item.sourceProposalId}`],
        decisionItems,
        runInput: run.input,
      })
    );
  }
}

function applyApprovedDecisionToBrief(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  decisionId: string
) {
  proposeBriefChangeCandidate(set, get, missionId, decisionId);
  const run = getStoredPlannerRun(get, missionId);
  const candidate = run?.plannerMeta?.briefChangeCandidates?.find(
    (c) => c.decisionId === decisionId && c.status === "approved"
  );
  if (candidate) {
    commitBriefChangeCandidate(set, get, missionId, candidate.id);
  }
}

function generateMeetingMinutesForMission(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  trigger: "open" | "refresh" | "manual" = "manual"
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const projectName = projectNameFromIdea(run.input.idea);
  const openFromSignals = (meta.strategySignals ?? [])
    .filter((s) => s.kind === "scope_risk" || s.kind === "business_risk")
    .map((s) => s.title);

  const minutes = generateMeetingMinutes({
    projectName,
    messages: meta.discussionMessages ?? [],
    decisionItems: meta.decisionItems ?? [],
    briefChangeCandidates: meta.briefChangeCandidates ?? [],
    appliedProposals: meta.pendingProposals ?? [],
    openQuestionSignals: openFromSignals,
    briefVersion: meta.briefVersion,
    discussionPersonaMemory: meta.discussionPersonaMemory,
  });

  const nextMeta = mergePlannerMeta(meta, { meetingMinutes: minutes });
  const handoff = refreshArchitectHandoffForRun({ ...run, plannerMeta: nextMeta }, projectName);

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
  });

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: trigger === "open" ? "meeting_minutes_opened" : "meeting_minutes_generated",
      summary:
        trigger === "open"
          ? "Meeting minutes opened and regenerated."
          : "Meeting minutes generated.",
      reasoning: minutes.architectNotes.map((n) => `WHY: ${n}`),
      meetingMinutes: minutes,
      architectHandoffPreview: handoff,
      runInput: run.input,
    })
  );

  if (trigger !== "open") {
    useProjectCreationStore.setState((state) => ({
      activities: [meetingMinutesGeneratedActivity(missionId), ...state.activities].slice(0, 120),
    }));
  }
}

function recordArchitectHandoffOpened(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string
) {
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const pending = countPendingDecisionCandidates(meta.decisionItems ?? []);
  if (pending <= 0) return;

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: "architect_handoff_blocked_pending_decisions",
      summary: `${pending} pending decision(s) block final architect handoff.`,
      reasoning: [
        `WHY: ${pending} pending decision(s) must be resolved (採用 / 保留 / 却下) before final handoff.`,
      ],
      decisionItems: meta.decisionItems,
      architectHandoffPreview: meta.architectHandoffPreview,
      runInput: run.input,
    })
  );
}

function finalizeMeetingMinutes(set: AgentRunsSet, get: AgentRunsGet, missionId: string) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const minutes = run?.plannerMeta?.meetingMinutes;
  if (!run?.plannerMeta || !minutes) return;
  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(run.plannerMeta, {
      meetingMinutes: { ...minutes, status: "finalized" },
    }),
  });
}

function proposeBriefChangeCandidate(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  decisionId: string
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const decision = meta.decisionItems?.find((d) => {
    if (d.id !== decisionId) return false;
    const s = normalizeDecisionStatus(d);
    return s === "approved" || s === "applied_to_brief";
  });
  if (!decision?.sourceProposalId) return;

  const proposal = meta.pendingProposals?.find((p) => p.id === decision.sourceProposalId);
  if (!proposal || proposal.status === "applied" || proposal.status === "dismissed") return;

  const existing = meta.briefChangeCandidates ?? [];
  if (existing.some((c) => c.decisionId === decisionId && c.status !== "rejected")) return;

  const candidate: BriefChangeCandidate = {
    id: briefCandidateId(),
    proposalId: proposal.id,
    decisionId,
    title: proposal.title,
    status: "approved",
    createdAt: new Date().toISOString(),
  };

  const pendingProposals = (meta.pendingProposals ?? []).map((p) =>
    p.id === proposal.id ? { ...p, status: "brief_candidate" as const } : p
  );

  const nextMeta = mergePlannerMeta(meta, {
    briefChangeCandidates: [...existing, candidate],
    pendingProposals,
  });
  const projectName = projectNameFromIdea(run.input.idea);
  const handoff = refreshArchitectHandoffForRun(
    { ...run, plannerMeta: nextMeta },
    projectName
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(nextMeta, { architectHandoffPreview: handoff }),
  });

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: "brief_change_candidate_created",
      summary: `Brief change candidate: ${candidate.title}`,
      reasoning: [`WHY: Decision approved — Brief update queued for commit.`],
      decisionItems: meta.decisionItems,
      runInput: run.input,
    })
  );

  useProjectCreationStore.setState((state) => ({
    activities: [
      briefChangeCandidateCreatedActivity(missionId, candidate.title),
      ...state.activities,
    ].slice(0, 120),
  }));
}

function commitBriefChangeCandidate(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  candidateId: string
) {
  const run = getStoredPlannerRun(get, missionId);
  const candidate = run?.plannerMeta?.briefChangeCandidates?.find(
    (c) => c.id === candidateId && c.status === "approved"
  );
  if (!candidate) return;

  applyDiscoveryBriefProposal(set, get, missionId, candidate.proposalId);

  const key = plannerStorageKey(missionId);
  const latest = getStoredPlannerRun(get, missionId);
  if (!latest?.plannerMeta) return;

  const briefChangeCandidates = (latest.plannerMeta.briefChangeCandidates ?? []).map((c) =>
    c.id === candidateId ? { ...c, status: "applied" as const } : c
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(latest.plannerMeta, { briefChangeCandidates }),
  });

  get().appendAudit(
    buildDecisionGovernanceAuditRecord({
      missionId,
      eventType: "brief_change_committed",
      summary: `Brief change committed: ${candidate.title}`,
      reasoning: [`WHY: Approved governance path — Brief version updated.`],
      runInput: latest.input,
    })
  );
}

async function sendDiscoveryDiscussionMessage(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  userMessage: string,
  targetAudienceInput: DiscussionTargetAudience = "all"
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  const brief = run?.audit?.output?.brief as ProductBriefSections | undefined;
  if (!run || !meta || !brief) return;

  const cooReview =
    meta.cooReviewReport ?? migrateLegacyReviewReport(meta.ceoReviewReport);
  const discussionMode = inferInternalDiscussionMode(userMessage);
  const targetAudience = resolveDiscussionAudience({
    targetAudience: targetAudienceInput,
    userMessage,
  });
  const wantPlanner = audienceIncludesPlanner(targetAudience);
  const wantCoo = audienceIncludesCoo(targetAudience);
  const priorMessages = meta.discussionMessages ?? [];
  const isFirst = !priorMessages.length;
  const ceoMsg: DiscussionMessage = {
    id: discussionMessageId(),
    missionId,
    participant: "ceo",
    message: userMessage.trim(),
    createdAt: new Date().toISOString(),
    targetAudience,
  };

  const activities: ProjectActivityItem[] = [];
  if (isFirst) {
    activities.push(executiveDiscussionStartedActivity(missionId));
    get().appendAudit(
      buildStrategyRoomAuditRecord({
        missionId,
        eventType: "executive_discussion_started",
        summary: "Executive Strategy Room discussion started.",
        reasoning: ["WHY: CEO opened multi-turn strategy session."],
        discussionMode,
        runInput: run.input,
      })
    );
  }
  let decisionItems = [...(meta.decisionItems ?? [])];

  const newSignals = detectStrategySignals({
    ceoMessage: userMessage,
    existing: meta.strategySignals,
    sourceMessageId: ceoMsg.id,
  });
  const strategySignals = [...(meta.strategySignals ?? []), ...newSignals];
  if (newSignals.length) {
    get().appendAudit(
      buildStrategyRoomAuditRecord({
        missionId,
        eventType: "strategy_signal_detected",
        summary: `Strategy signals: ${newSignals.map((s) => s.title).join(", ")}`,
        reasoning: newSignals.map((s) => `WHY: ${s.description}`),
        strategySignals,
        discussionMode,
        runInput: run.input,
      })
    );
  }

  const personaMemory = updatePersonaMemory(
    meta.discussionPersonaMemory,
    userMessage,
    decisionItems
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(meta, {
      discussionMessages: [...priorMessages, ceoMsg],
      decisionItems,
      strategySignals,
      discussionMode,
      discussionPersonaMemory: personaMemory,
    }),
  });

  get().appendAudit(
    buildDiscussionAuditRecord({
      missionId,
      eventType: "discussion_message",
      summary: `CEO discussion message: ${userMessage.slice(0, 120)}`,
      reasoning: ["WHY: Discovery Discussion — no automatic brief mutation."],
      runInput: run.input,
    })
  );

  const projectName = projectNameFromIdea(run.input.idea);
  const mission = useMissionStore.getState().missions.find((m) => m.id === missionId);
  const response = await fetch("/api/discussion/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      missionId,
      projectName,
      userMessage,
      idea: run.input.idea,
      targetUsers: run.input.targetUsers,
      successGoal: run.input.successGoal,
      missionSummary: mission?.summary,
      brief,
      briefVersion: meta.briefVersion,
      opportunityBrief: meta.opportunityBrief,
      cpfReport: meta.cpfReport,
      psfReport: meta.psfReport,
      psfMvpScope: meta.psfMvpScope,
      cooReview,
      validationRequests: meta.validationRequests,
      discussionMessages: [...priorMessages, ceoMsg],
      discussionMode,
      targetAudience,
      briefVersions: meta.briefVersions,
      pendingProposals: meta.pendingProposals,
      decisionItems: meta.decisionItems,
      discussionPersonaMemory: personaMemory,
    }),
  });

  const data = (await response.json()) as {
    targetAudience?: DiscussionTargetAudience;
    plannerResponse?: string;
    plannerSummary?: string;
    plannerDetail?: string;
    cooResponse?: string;
    cooSummary?: string;
    cooDetail?: string;
    suggestedChanges?: BriefChangeProposal[];
    relatedSection?: DiscussionMessage["relatedSection"];
    plannerChallenged?: boolean;
    cooRaisedConcern?: boolean;
    plannerSuggestsDecision?: boolean;
    cooSuggestsDecision?: boolean;
    discussionSignal?: boolean;
    error?: string;
  };

  const plannerText = (data.plannerSummary ?? data.plannerResponse ?? "").trim();
  const cooText = (data.cooSummary ?? data.cooResponse ?? "").trim();
  if (!response.ok) {
    throw new Error(data.error ?? "Discussion response failed");
  }
  if (wantPlanner && !plannerText) {
    throw new Error("Product Planner did not respond");
  }
  if (wantCoo && !cooText) {
    throw new Error("COO did not respond");
  }

  const ceoDecisionIntent = classifyDiscussionIntent(userMessage) === "decision";
  const stage2Candidate =
    ceoDecisionIntent ||
    (data.plannerSuggestsDecision === true && data.cooSuggestsDecision === true);
  const stage1Signal =
    !stage2Candidate &&
    (data.discussionSignal === true ||
      shouldShowDiscussionDecisionSignal(userMessage));

  const turnVoteDetails = inferDecisionVotesWithReasons(
    data.plannerSummary,
    data.cooSummary,
    userMessage
  );
  const turnVotes = {
    plannerVote: turnVoteDetails.plannerVote,
    cooVote: turnVoteDetails.cooVote,
  };
  const executiveDebate =
    wantPlanner &&
    wantCoo &&
    isExecutiveDebate(turnVotes.plannerVote, turnVotes.cooVote);

  const debateCtx = executiveDebate
    ? buildExecutiveDebateContext({
        ceoMessage: userMessage,
        plannerSummary: data.plannerSummary,
        cooSummary: data.cooSummary,
        plannerVote: turnVotes.plannerVote,
        cooVote: turnVotes.cooVote,
        plannerRationale: turnVoteDetails.plannerRationale,
        cooRationale: turnVoteDetails.cooRationale,
        memory: personaMemory,
      })
    : undefined;

  const plannerTextChecked = personaSelfCheckPlanner(
    plannerText,
    false,
    personaMemory
  );
  const cooTextChecked = personaSelfCheckCoo(cooText, personaMemory);

  let memoryAfterTemplates = recordTemplateUsage(
    personaMemory,
    plannerTextChecked,
    cooTextChecked
  );
  if (debateCtx) {
    memoryAfterTemplates = {
      ...memoryAfterTemplates,
      beliefConflicts: appendBeliefConflictToMemory(
        memoryAfterTemplates.beliefConflicts,
        {
          topic: debateCtx.topic,
          plannerBelief: plannerBeliefFromReason(debateCtx.plannerReason),
          cooBelief: cooBeliefFromReason(debateCtx.cooReason),
        }
      ),
    };
  }

  const debateFields = debateCtx
    ? {
        debateTopic: debateCtx.topic,
        debatePlannerReason: debateCtx.plannerReason,
        debateCooReason: debateCtx.cooReason,
        debateWhy: debateCtx.whyDebate,
        debateSummary: debateCtx.debateSummary,
      }
    : {};

  const newMessages: DiscussionMessage[] = [];
  if (wantPlanner && plannerText) {
    activities.push(plannerRespondedToDiscussionActivity(missionId));
    newMessages.push({
      id: discussionMessageId(),
      missionId,
      participant: "planner",
      message: plannerTextChecked,
      summary: plannerTextChecked,
      detail: data.plannerDetail,
      createdAt: new Date().toISOString(),
      relatedSection: data.relatedSection,
      discussionDecisionSignal: stage1Signal,
      suggestsDecisionCandidate: stage2Candidate,
      executiveDebate,
      agentVote: turnVotes.plannerVote,
      debatePartnerVote: executiveDebate ? turnVotes.cooVote : undefined,
      ...debateFields,
    });
  }
  if (wantCoo && cooText) {
    activities.push(cooRespondedToDiscussionActivity(missionId));
    newMessages.push({
      id: discussionMessageId(),
      missionId,
      participant: "coo",
      message: cooTextChecked,
      summary: cooTextChecked,
      detail: debateCtx?.debateSummary ?? data.cooDetail,
      createdAt: new Date().toISOString(),
      relatedSection: data.relatedSection,
      discussionDecisionSignal: stage1Signal,
      suggestsDecisionCandidate: stage2Candidate,
      executiveDebate,
      agentVote: turnVotes.cooVote,
      debatePartnerVote: executiveDebate ? turnVotes.plannerVote : undefined,
      ...debateFields,
    });
  }

  const postSignals = detectStrategySignals({
    ceoMessage: userMessage,
    plannerSummary: data.plannerSummary,
    cooSummary: data.cooSummary,
    existing: strategySignals,
  });
  const allSignals = [...strategySignals, ...postSignals];

  if (data.plannerChallenged) {
    activities.push(plannerChallengedAssumptionActivity(missionId));
  }
  if (data.cooRaisedConcern) {
    activities.push(cooRaisedBusinessConcernActivity(missionId));
  }

  const latest = getStoredPlannerRun(get, missionId)!;
  const newProposals = data.suggestedChanges ?? [];
  const priorPending = (latest.plannerMeta?.pendingProposals ?? []).filter(
    (p) => p.status === "pending" || p.status === "awaiting_decision" || p.status === "brief_candidate"
  );
  const pending = [...priorPending, ...newProposals];
  const registered = registerAutoDecisionsFromProposals(
    decisionItems,
    newProposals,
    ceoMsg.id,
    {
      ceoMessage: userMessage,
      plannerSummary: data.plannerSummary,
      cooSummary: data.cooSummary,
      plannerSuggestsDecision: data.plannerSuggestsDecision,
      cooSuggestsDecision: data.cooSuggestsDecision,
    }
  );
  decisionItems = registered.decisionItems;
  const priorCount = decisionItems.length;

  if (newProposals.length === 0) {
    const turnVotes = inferVotesFromDiscussionTurn(
      data.plannerSummary,
      data.cooSummary,
      userMessage
    );
    if (
      shouldAutoCreateDecisionCandidate({
        ceoMessage: userMessage,
        plannerSummary: data.plannerSummary,
        cooSummary: data.cooSummary,
        plannerVote: turnVotes.plannerVote,
        cooVote: turnVotes.cooVote,
        hasNewProposals: false,
        plannerSuggestsDecision: data.plannerSuggestsDecision,
        cooSuggestsDecision: data.cooSuggestsDecision,
      })
    ) {
      const turnDecision = createDecisionFromDiscussionTurn({
        ceoMessage: userMessage,
        sourceDiscussionId: ceoMsg.id,
        plannerSummary: data.plannerSummary,
        cooSummary: data.cooSummary,
        plannerDetail: data.plannerDetail,
        cooDetail: data.cooDetail,
        personaMemory,
        discussionMessages: [
          ...(priorMessages ?? []),
          ceoMsg,
          ...newMessages,
        ],
      });
      decisionItems = [...decisionItems, turnDecision];
    }
  }

  const pendingWithStatus = [...priorPending, ...registered.proposals];

  let linkedNewMessages = newMessages;
  const newDecisions = decisionItems.slice(priorCount);
  for (const dec of newDecisions) {
    if (!executiveDebate) continue;
    linkedNewMessages = linkDebatesToDecision(
      linkedNewMessages,
      linkedNewMessages.filter((m) => m.executiveDebate).map((m) => m.id),
      dec.id
    );
  }

  const updatedMemory = updatePersonaMemory(
    {
      ...(latest.plannerMeta?.discussionPersonaMemory ?? personaMemory),
      ...memoryAfterTemplates,
    },
    userMessage,
    decisionItems
  );

  const mergedMeta = mergePlannerMeta(latest.plannerMeta, {
    discussionMode,
    discussionMessages: [
      ...(latest.plannerMeta?.discussionMessages ?? []),
      ...linkedNewMessages,
    ],
    pendingProposals: pendingWithStatus,
    strategySignals: allSignals,
    decisionItems,
    discussionPersonaMemory: updatedMemory,
  });
  const handoff = refreshArchitectHandoffForRun(
    { ...latest, plannerMeta: mergedMeta },
    projectName
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(mergedMeta, { architectHandoffPreview: handoff }),
  });

  get().appendAudit(
    buildDiscussionAuditRecord({
      missionId,
      eventType: "discussion_response",
      summary: `Executive discussion response (audience: ${data.targetAudience ?? targetAudience}).`,
      reasoning: [
        ...(plannerText ? [`WHY: Planner — ${plannerText.slice(0, 80)}`] : []),
        ...(cooText ? [`WHY: COO — ${cooText.slice(0, 80)}`] : []),
      ],
      runInput: run.input,
    })
  );

  if (decisionItems.length > priorCount) {
    get().appendAudit(
      buildDecisionGovernanceAuditRecord({
        missionId,
        eventType: "decision_created",
        summary: `Decision candidate(s) auto-created (${decisionItems.length - priorCount}).`,
        reasoning: [
          ...(plannerText ? [`WHY: Planner — ${plannerText.slice(0, 80)}`] : []),
          ...(cooText ? [`WHY: COO — ${cooText.slice(0, 80)}`] : []),
        ],
        decisionItems,
        architectHandoffPreview: handoff,
        runInput: run.input,
      })
    );
  }

  for (const proposal of newProposals) {
    get().appendAudit(
      buildDiscussionAuditRecord({
        missionId,
        eventType: "change_proposed",
        summary: `Change proposed: ${proposal.title}`,
        reasoning: [`WHY: ${proposal.description}`],
        runInput: run.input,
        decisions: [proposal.id],
      })
    );
    activities.push(suggestedChangeProposedActivity(missionId, proposal.title));
    activities.push(decisionProposedActivity(missionId, proposal.title));
  }

  useProjectCreationStore.setState((state) => ({
    activities: [...activities, ...state.activities].slice(0, 120),
  }));

  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            projectPipelineStage: pipelineStageAfterCooReview(),
            recentActivity: "Executive Strategy Room in progress",
            updatedAt: "Just now",
          }
        : m
    ),
  }));

}

function applyDiscoveryBriefProposal(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  proposalId: string
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  const brief = run?.audit?.output?.brief as ProductBriefSections | undefined;
  if (!run || !meta || !brief) return;

  const proposal = meta.pendingProposals?.find(
    (p) => p.id === proposalId && p.status === "brief_candidate"
  );
  if (!proposal) return;

  const applied = applyBriefChangeProposal(proposal, {
    brief,
    opportunityBrief: meta.opportunityBrief,
    cpfReport: meta.cpfReport,
    psfReport: meta.psfReport,
    psfMvpScope: meta.psfMvpScope,
  });

  const currentVersion = meta.briefVersion ?? 1;
  const versions = meta.briefVersions ?? [];
  const seeded = versions.length
    ? versions
    : seedInitialBriefVersion({
        brief,
        opportunityBrief: meta.opportunityBrief,
        cpfReport: meta.cpfReport,
        psfReport: meta.psfReport,
        psfMvpScope: meta.psfMvpScope,
      }).briefVersions;
  const prevRecord = seeded.find((v) => v.version === currentVersion) ?? seeded[seeded.length - 1]!;
  const prevBrief = prevRecord.brief;
  const prevMvp = prevRecord.psfMvpScope ?? meta.psfMvpScope;

  const diff = compareBriefVersions(
    currentVersion,
    currentVersion + 1,
    prevBrief,
    applied.brief,
    prevMvp,
    applied.psfMvpScope
  );
  const changeSummary = buildChangeSummary(diff, proposal);
  const nextVersion = currentVersion + 1;

  const { briefVersion, briefVersions } = appendBriefVersion({
    currentVersion,
    versions: seeded,
    brief: applied.brief,
    label: proposal.title.slice(0, 48) || applied.versionLabel,
    opportunityBrief: applied.opportunityBrief,
    cpfReport: applied.cpfReport,
    psfReport: applied.psfReport,
    psfMvpScope: applied.psfMvpScope,
    proposalId,
    previousVersionId: currentVersion,
    changeSummary,
    diff,
    reason: proposal.reason,
    impact: proposal.impact,
    confidence: proposal.confidence,
    appliedBy: "ceo",
  });

  const versionAudit: BriefVersionAuditRecord = {
    versionId: nextVersion,
    previousVersionId: currentVersion,
    changeSummary,
    diff,
    reason: proposal.reason,
    impact: proposal.impact,
    confidence: proposal.confidence,
    sourceDiscussionId: proposalId,
    appliedBy: "ceo",
    timestamp: new Date().toISOString(),
  };

  const applyFeedback: BriefApplyFeedback = {
    missionId,
    version: briefVersion,
    previousVersion: currentVersion,
    summary: changeSummary,
    proposalTitle: proposal.title,
    proposalId,
    diff,
    createdAt: versionAudit.timestamp,
  };

  const updatedOutput: PlannerGenerationResult = {
    ...(run.audit?.output as PlannerGenerationResult),
    brief: applied.brief,
    analysis: `Brief v${briefVersion} — ${applied.versionLabel}`,
  };

  const updatedProposals = (meta.pendingProposals ?? []).map((p) =>
    p.id === proposalId ? { ...p, status: "applied" as const } : p
  );

  const projectName = projectNameFromIdea(run.input.idea);
  const mergedMeta = mergePlannerMeta(meta, {
    opportunityBrief: applied.opportunityBrief,
    cpfReport: applied.cpfReport,
    psfReport: applied.psfReport,
    psfMvpScope: applied.psfMvpScope,
    briefVersion,
    briefVersions,
    pendingProposals: updatedProposals,
    briefVersionAudits: [...(meta.briefVersionAudits ?? []), versionAudit],
    lastBriefApplyFeedback: applyFeedback,
  });
  const handoff = refreshArchitectHandoffForRun(
    {
      ...run,
      audit: run.audit ? { ...run.audit, output: updatedOutput } : run.audit,
      plannerMeta: mergedMeta,
    },
    projectName
  );

  persistPlannerRun(set, key, {
    audit: run.audit ? { ...run.audit, output: updatedOutput } : run.audit,
    plannerMeta: mergePlannerMeta(mergedMeta, { architectHandoffPreview: handoff }),
  });

  applyBriefToMission(missionId, projectName, applied.brief);

  if (handoff) {
    get().appendAudit(
      buildStrategyRoomAuditRecord({
        missionId,
        eventType: "architect_handoff_preview",
        summary: "Architect handoff preview updated after Brief apply.",
        reasoning: [`WHY: Brief v${briefVersion} — ${proposal.title}`],
        architectHandoffPreview: handoff,
        runInput: run.input,
      })
    );
  }

  get().appendAudit(
    buildBriefDiffAuditRecord({
      missionId,
      eventType: "change_applied_with_review",
      audit: versionAudit,
      runInput: run.input,
    })
  );
  get().appendAudit(
    buildBriefDiffAuditRecord({
      missionId,
      eventType: "brief_diff_generated",
      audit: versionAudit,
      runInput: run.input,
    })
  );
  get().appendAudit(
    buildBriefDiffAuditRecord({
      missionId,
      eventType: "brief_version_created",
      audit: versionAudit,
      runInput: run.input,
    })
  );

  useProjectCreationStore.setState((state) => ({
    activities: [
      plannerAppliedChangeActivity(missionId, proposal.title, briefVersion),
      briefVersionCreatedActivity(missionId, briefVersion, proposal.title),
      briefDiffGeneratedActivity(missionId, currentVersion, briefVersion),
      suggestedChangeAppliedActivity(missionId, briefVersion),
      ...state.activities,
    ].slice(0, 120),
  }));

  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            briefVersion,
            recentActivity: `Brief v${briefVersion} created — ${proposal.title}`,
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

function dismissDiscoveryBriefProposal(
  set: AgentRunsSet,
  get: AgentRunsGet,
  missionId: string,
  proposalId: string
) {
  const key = plannerStorageKey(missionId);
  const run = getStoredPlannerRun(get, missionId);
  const meta = run?.plannerMeta;
  if (!run || !meta) return;

  const updatedProposals = (meta.pendingProposals ?? []).map((p) =>
    p.id === proposalId ? { ...p, status: "dismissed" as const } : p
  );

  persistPlannerRun(set, key, {
    plannerMeta: mergePlannerMeta(meta, { pendingProposals: updatedProposals }),
  });
}

function applyExecutiveDecisionToMission(
  missionId: string,
  decision: ExecutiveDecisionStatus,
  options?: { validationReason?: string; latestApprovedBriefVersion?: number }
) {
  const now = new Date().toISOString();
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            executiveDecision: decision,
            projectPipelineStage: pipelineStageAfterExecutiveDecision(decision),
            status: decision === "hold" ? ("on_hold" as const) : decision === "approved" ? ("active" as const) : m.status,
            validationReason: options?.validationReason ?? m.validationReason,
            validationRequestedAt:
              decision === "needs_validation" ? now : m.validationRequestedAt,
            ceoApprovedAt: decision === "approved" ? now : m.ceoApprovedAt,
            latestApprovedBriefVersion:
              options?.latestApprovedBriefVersion ?? m.latestApprovedBriefVersion,
            summary:
              decision === "approved"
                ? `CEO approved architecture — ${m.name} ready for Architect Agent.`
                : decision === "needs_validation"
                  ? `CEO requested more validation for ${m.name}.`
                  : decision === "hold"
                    ? `CEO placed ${m.name} on hold.`
                    : m.summary,
            recentActivity:
              decision === "approved"
                ? "CEO approved architecture phase"
                : decision === "needs_validation"
                  ? "CEO requested more validation"
                  : decision === "hold"
                    ? "CEO placed project on hold"
                    : m.recentActivity,
            progress:
              decision === "approved"
                ? Math.max(m.progress, 32)
                : decision === "hold"
                  ? Math.min(m.progress, 25)
                  : m.progress,
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

async function completePlannerBrief(
  set: AgentRunsSet,
  get: AgentRunsGet,
  ctx: {
    missionId: string;
    key: string;
    run: PlannerStoredRun;
    providerInput: ProjectCreationInput & {
      projectName: string;
      missionId: string;
      clarificationRound?: number;
    };
    projectName: string;
    output?: PlannerGenerationResult;
    audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
  }
) {
  const loadRun = () => getStoredPlannerRun(get, ctx.missionId) ?? ctx.run;

  let output = ctx.output;
  let audit = ctx.audit;

  if (!loadRun().plannerMeta?.opportunityBrief) {
    get().setPlannerStatus(ctx.missionId, "working");
    const discovery = await ensureOpportunityDiscovery(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: loadRun(),
    });
    applyPmfToMission(
      ctx.missionId,
      discovery.pmfReadiness,
      discovery.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    const base = loadRun();
    persistPlannerRun(set, ctx.key, {
      status: "working",
      plannerMeta: {
        discoveryMode: base.plannerMeta?.discoveryMode ?? base.input.discoveryMode ?? "quick",
        clarificationRound: base.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: base.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: base.plannerMeta?.lastAssessment,
        opportunityBrief: discovery.opportunityBrief,
        pmfReadiness: discovery.pmfReadiness,
        currentPmfStage: discovery.currentPmfStage,
      },
    });
  }

  if (!loadRun().plannerMeta?.cpfReport) {
    get().setPlannerStatus(ctx.missionId, "working");
    const cpf = await ensureCustomerProblemFit(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: loadRun(),
    });
    applyPmfToMission(
      ctx.missionId,
      cpf.pmfReadiness,
      cpf.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    const base = loadRun();
    persistPlannerRun(set, ctx.key, {
      status: "working",
      plannerMeta: {
        discoveryMode: base.plannerMeta?.discoveryMode ?? base.input.discoveryMode ?? "quick",
        clarificationRound: base.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: base.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: base.plannerMeta?.lastAssessment,
        opportunityBrief: base.plannerMeta?.opportunityBrief,
        cpfReport: cpf.cpfReport,
        cpfPainPoints: cpf.painPoints,
        cpfBurningNeeds: cpf.burningNeeds,
        pmfReadiness: cpf.pmfReadiness,
        currentPmfStage: cpf.currentPmfStage,
      },
    });
  }

  if (!loadRun().plannerMeta?.psfReport) {
    get().setPlannerStatus(ctx.missionId, "working");
    const psf = await ensureProblemSolutionFit(get, {
      missionId: ctx.missionId,
      providerInput: ctx.providerInput,
      run: loadRun(),
    });
    applyPmfToMission(
      ctx.missionId,
      psf.pmfReadiness,
      psf.currentPmfStage,
      ctx.providerInput.discoveryMode ?? "quick"
    );
    const base = loadRun();
    persistPlannerRun(set, ctx.key, {
      status: "working",
      plannerMeta: {
        discoveryMode: base.plannerMeta?.discoveryMode ?? base.input.discoveryMode ?? "quick",
        clarificationRound: base.plannerMeta?.clarificationRound ?? 0,
        clarificationHistory: base.plannerMeta?.clarificationHistory ?? [],
        lastAssessment: base.plannerMeta?.lastAssessment,
        opportunityBrief: base.plannerMeta?.opportunityBrief,
        cpfReport: base.plannerMeta?.cpfReport,
        cpfPainPoints: base.plannerMeta?.cpfPainPoints,
        cpfBurningNeeds: base.plannerMeta?.cpfBurningNeeds,
        psfReport: psf.psfReport,
        psfValidationAssumptions: psf.validationAssumptions,
        psfValidationRisks: psf.validationRisks,
        psfMvpScope: psf.mvpScope,
        pmfReadiness: psf.pmfReadiness,
        currentPmfStage: psf.currentPmfStage,
      },
    });
  }

  if (!output) {
    get().setPlannerStatus(ctx.missionId, "working");
    const response = await fetch("/api/agents/planner/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx.providerInput),
    });
    const data = (await response.json()) as {
      output?: PlannerGenerationResult;
      audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
      error?: string;
    };
    if (!response.ok || !data.output) {
      throw new Error(data.error ?? "Unable to generate Product Brief");
    }
    output = data.output;
    audit = data.audit;
  }

  const successAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = audit
    ? { ...audit, status: "success", output }
    : {
        id: createAuditId(),
        missionId: ctx.missionId,
        agentId: "product_planner",
        timestamp: new Date().toISOString(),
        providerId: "unknown",
        model: "unknown",
        promptVersion: PLANNER_PROMPT_VERSION,
        input: ctx.run.input,
        analysis: output.analysis,
        decisions: output.decisions,
        reasoning: output.reasoning,
        output,
        status: "success",
        clarificationRound: ctx.providerInput.clarificationRound,
      };

  get().appendAudit(successAudit);

  const finalRun = loadRun();
  const priorMeta = finalRun.plannerMeta;
  const briefPmf = computePmfReadinessFromSignals({
    completenessScore: priorMeta?.lastAssessment?.completenessScore ?? 75,
    missingAreas: priorMeta?.lastAssessment?.missingAreas ?? [],
    strengths: priorMeta?.lastAssessment?.strengths ?? [],
    gaps: priorMeta?.lastAssessment?.gaps ?? [],
    hasBrief: true,
    hasOpportunityBrief: true,
    hasCpfReport: true,
    hasPsfReport: true,
    discoveryMode: priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
  });
  if (priorMeta?.cpfReport) {
    briefPmf.cpf = Math.max(briefPmf.cpf, priorMeta.cpfReport.cpfScore);
  }
  if (priorMeta?.psfReport) {
    briefPmf.psf = Math.max(briefPmf.psf, priorMeta.psfReport.psfScore);
  }

  const { report: cooReviewReport, cooReviewHistory } = await ensureCooReview(get, {
    missionId: ctx.missionId,
    providerInput: ctx.providerInput,
    run: finalRun,
    brief: output.brief,
    briefAudit: successAudit,
  });

  const briefVersioning = seedInitialBriefVersion({
    brief: output.brief,
    opportunityBrief: priorMeta?.opportunityBrief,
    cpfReport: priorMeta?.cpfReport,
    psfReport: priorMeta?.psfReport,
    psfMvpScope: priorMeta?.psfMvpScope,
  });

  persistPlannerRun(set, ctx.key, {
    status: "completed",
    input: ctx.providerInput,
    reasoning: output.reasoning,
    audit: successAudit,
    errorMessage: undefined,
    plannerMeta: {
      discoveryMode: priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick",
      clarificationRound: priorMeta?.clarificationRound ?? 0,
      clarificationHistory: priorMeta?.clarificationHistory ?? [],
      pendingQuestions: undefined,
      lastAssessment: priorMeta?.lastAssessment,
      opportunityBrief: priorMeta?.opportunityBrief,
      cpfReport: priorMeta?.cpfReport,
      cpfPainPoints: priorMeta?.cpfPainPoints,
      cpfBurningNeeds: priorMeta?.cpfBurningNeeds,
      psfReport: priorMeta?.psfReport,
      psfValidationAssumptions: priorMeta?.psfValidationAssumptions,
      psfValidationRisks: priorMeta?.psfValidationRisks,
      psfMvpScope: priorMeta?.psfMvpScope,
      pmfReadiness: briefPmf,
      currentPmfStage: inferCurrentPmfStage(briefPmf),
      cooReviewReport,
      cooReviewHistory,
      executiveDecision: "awaiting_ceo_approval" as const,
      ...briefVersioning,
    },
  });

  queueMicrotask(() => {
    applyPmfToMission(
      ctx.missionId,
      briefPmf,
      inferCurrentPmfStage(briefPmf),
      priorMeta?.discoveryMode ?? ctx.run.input.discoveryMode ?? "quick"
    );
    applyCooReviewToMission(ctx.missionId, cooReviewReport);
    useMissionStore.setState((state) => ({
      missions: state.missions.map((m) =>
        m.id === ctx.missionId ? { ...m, briefVersion: briefVersioning.briefVersion } : m
      ),
    }));
  });

  queueMicrotask(() => {
    applyBriefToMission(ctx.missionId, ctx.projectName, output.brief);

    useProjectCreationStore.setState((state) => ({
      projects: state.projects.map((p) =>
        p.missionId === ctx.missionId
          ? { ...p, plannerStatus: "planning_started", productBriefGenerated: true }
          : p
      ),
    }));

    const mission = useMissionStore.getState().missions.find((m) => m.id === ctx.missionId);
    if (mission) {
      const feedCopy = organizationFeedMessageForCooReviewComplete(
        mission.name,
        cooReviewReport.recommendation
      );
      useOrganizationStore.getState().addFeedItemWithSync({
        type: "coordination",
        author: "COO",
        authorName: "Nova",
        missionId: ctx.missionId,
        missionName: mission.name,
        message: feedCopy.message,
        status: "active",
        requiresCeoApproval: feedCopy.requiresCeoApproval,
      });
    }
  });
}

function applyPmfToMission(
  missionId: string,
  pmfReadiness: PmfReadiness,
  currentPmfStage: PmfStage,
  discoveryMode: ProjectCreationInput["discoveryMode"]
) {
  const { pmfReadinessScore, pmfMeasurementStatus } = resolvePmfStageFields(pmfReadiness);
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            discoveryMode,
            pmfReadiness,
            currentPmfStage,
            pmfReadinessScore,
            pmfMeasurementStatus,
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

function applyBriefToMission(missionId: string, projectName: string, brief: ProductBriefSections) {
  const markdown = formatProductBriefMarkdown(projectName, brief);
  useMissionStore.setState((state) => ({
    missions: state.missions.map((m) =>
      m.id === missionId
        ? {
            ...m,
            requirementsSummary: markdown,
            summary: `Planning complete — Product Brief ready for ${projectName}.`,
            recentActivity: "Product Planner generated Product Brief",
            progress: Math.max(m.progress, 28),
            updatedAt: "Just now",
          }
        : m
    ),
  }));
}

interface AgentRunsState {
  runs: Record<string, AgentRun>;
  auditTrail: AgentAuditRecord[];

  getMissionAuditTrail: (missionId: string) => AgentAuditRecord[];
  getAgentAuditTrail: (missionId: string, agentId: AgentId) => AgentAuditRecord[];
  getLatestAgentRun: (missionId: string, agentId: AgentId) => AgentRun | undefined;

  appendAudit: (record: AgentAuditRecord) => void;
  mergeLegacyPlannerRuns: (legacyRuns: Record<string, unknown>) => void;

  getPlannerRun: (missionId: string) => PlannerAgentRun | undefined;
  initPlannerRun: (missionId: string, input: ProjectCreationInput) => void;
  setPlannerStatus: (missionId: string, status: PlannerRunStatus, errorMessage?: string) => void;
  appendPlannerActivity: (missionId: string, message: string) => void;
  appendPlannerActivities: (missionId: string, messages: string[]) => void;
  generatePlannerForMission: (missionId: string) => Promise<void>;
  /** Resume opportunity → cpf → psf → brief after reload or interrupted pipeline. */
  resumePlannerPipeline: (missionId: string) => Promise<void>;
  /** Backfill COO Review for completed briefs created before Phase 21.5. */
  ensureCooReviewForMission: (missionId: string) => Promise<void>;
  submitExecutiveDecision: (
    missionId: string,
    action: "approve" | "needs_validation" | "hold",
    validationReason?: string
  ) => Promise<void>;
  submitPlannerClarification: (
    missionId: string,
    answers: Record<string, string>
  ) => Promise<void>;
  retryPlannerGeneration: (missionId: string) => Promise<void>;
  sendDiscoveryDiscussionMessage: (
    missionId: string,
    userMessage: string,
    targetAudience?: DiscussionTargetAudience
  ) => Promise<void>;
  setDiscussionMode: (missionId: string, mode: DiscussionMode) => void;
  createDecisionFromMessage: (
    missionId: string,
    input: { messageId: string; message: string; title?: string }
  ) => void;
  setCeoDecisionOnItem: (
    missionId: string,
    decisionId: string,
    status: DecisionCandidateStatus
  ) => void;
  proposeBriefChangeFromDecision: (missionId: string, decisionId: string) => void;
  applyApprovedDecisionToBrief: (missionId: string, decisionId: string) => void;
  commitBriefChangeCandidate: (missionId: string, candidateId: string) => void;
  generateMeetingMinutes: (
    missionId: string,
    trigger?: "open" | "refresh" | "manual"
  ) => void;
  recordArchitectHandoffOpened: (missionId: string) => void;
  finalizeMeetingMinutes: (missionId: string) => void;
  applyDiscoveryBriefProposal: (missionId: string, proposalId: string) => void;
  dismissDiscoveryBriefProposal: (missionId: string, proposalId: string) => void;
  clearBriefApplyFeedback: (missionId: string) => void;
}

function isLegacyPlannerRun(value: unknown): value is {
  missionId?: string;
  status: PlannerRunStatus;
  input: ProjectCreationInput;
  reasoning: string[];
  analysis?: string;
  decisions?: string[];
  brief?: ProductBriefSections;
  audit?: AgentAuditRecord;
  errorMessage?: string;
} {
  return (
    !!value &&
    typeof value === "object" &&
    "input" in value &&
    "status" in value &&
    !("agentId" in value)
  );
}

export const useAgentRunsStore = create<AgentRunsState>()(
  persist(
    (set, get) => ({
      runs: {},
      auditTrail: [],

      getMissionAuditTrail: (missionId) => getMissionAuditTrail(get().auditTrail, missionId),

      getAgentAuditTrail: (missionId, agentId) =>
        getAgentAuditTrail(get().auditTrail, missionId, agentId),

      getLatestAgentRun: (missionId, agentId) =>
        getLatestAgentRun(get().runs, missionId, agentId),

      appendAudit: (record) =>
        set((state) => ({
          auditTrail: [...state.auditTrail, record].slice(-MAX_AUDIT_TRAIL),
        })),

      mergeLegacyPlannerRuns: (legacyRuns) => {
        if (!legacyRuns || typeof legacyRuns !== "object") return;

        const nextRuns = { ...get().runs };
        const auditsToAppend: AgentAuditRecord[] = [];

        for (const [key, raw] of Object.entries(legacyRuns)) {
          if (!isLegacyPlannerRun(raw)) continue;
          const missionId = raw.missionId ?? key;
          const runKey = agentRunKey(missionId, "product_planner");
          if (nextRuns[runKey]) continue;

          const audit = raw.audit
            ? {
                ...raw.audit,
                id: raw.audit.id ?? createAuditId(),
                missionId: raw.audit.missionId ?? missionId,
                agentId: "product_planner" as const,
                status: raw.audit.status ?? ("success" as const),
              }
            : undefined;

          nextRuns[runKey] = {
            missionId,
            agentId: "product_planner",
            status: raw.status,
            input: raw.input,
            reasoning: raw.reasoning ?? [],
            audit,
            errorMessage: raw.errorMessage,
          };

          if (audit) auditsToAppend.push(audit);
        }

        if (
          Object.keys(nextRuns).length === Object.keys(get().runs).length &&
          auditsToAppend.length === 0
        ) {
          return;
        }

        set((state) => ({
          runs: { ...state.runs, ...nextRuns },
          auditTrail: [...state.auditTrail, ...auditsToAppend].slice(-MAX_AUDIT_TRAIL),
        }));
      },

      getPlannerRun: (missionId) => {
        const run = get().runs[agentRunKey(missionId, "product_planner")] as
          | PlannerStoredRun
          | undefined;
        return toPlannerAgentRun(run);
      },

      initPlannerRun: (missionId, input) => {
        const key = agentRunKey(missionId, "product_planner");
        set((state) => ({
          runs: {
            ...state.runs,
            [key]: {
              missionId,
              agentId: "product_planner",
              status: "idle",
              input,
              reasoning: [],
              plannerMeta: {
                discoveryMode: input.discoveryMode ?? "quick",
                clarificationRound: 0,
                clarificationHistory: [],
              },
            },
          },
        }));
      },

      setPlannerStatus: (missionId, status, errorMessage) =>
        set((state) => {
          const key = agentRunKey(missionId, "product_planner");
          const run = state.runs[key];
          if (!run) return state;
          return {
            runs: {
              ...state.runs,
              [key]: { ...run, status, errorMessage },
            },
          };
        }),

      appendPlannerActivity: (missionId, message) => {
        get().appendPlannerActivities(missionId, [message]);
      },

      appendPlannerActivities: (missionId, messages) => {
        if (messages.length === 0) return;
        const items: ProjectActivityItem[] = messages.map((message) => ({
          id: activityId(),
          missionId,
          workerEmoji: "🧠",
          workerName: "Product Planner",
          message,
          timestamp: nowLabel(),
        }));
        useProjectCreationStore.setState((state) => ({
          activities: [...items, ...state.activities].slice(0, 120),
        }));
      },

      generatePlannerForMission: async (missionId) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key] as PlannerStoredRun | undefined;
        if (
          !run ||
          run.status === "assessing" ||
          run.status === "working" ||
          run.status === "completed" ||
          run.status === "awaiting_clarification"
        ) {
          return;
        }
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        const round = run.plannerMeta?.clarificationRound ?? 0;

        const providerInput = {
          ...run.input,
          projectName,
          missionId,
          clarificationRound: round,
          questionsAskedSoFar: countQuestionsAskedForRun(run),
        };

        get().setPlannerStatus(missionId, "assessing");
        get().appendPlannerActivity(missionId, "Discovery started");
        get().appendPlannerActivity(missionId, "Planner assessing requirements");

        try {
          const assessRes = await fetch("/api/agents/planner/assess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(providerInput),
          });
          const assessData = (await assessRes.json()) as {
            assessment?: PlannerRunMeta["lastAssessment"];
            analysis?: string;
            decisions?: string[];
            reasoning?: string[];
            audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
            error?: string;
          };

          if (!assessRes.ok || !assessData.assessment) {
            throw new Error(assessData.error ?? "Planner assessment failed");
          }

          const assessAudit = assessData.audit ?? {
            id: createAuditId(),
            missionId,
            agentId: "product_planner" as const,
            timestamp: new Date().toISOString(),
            providerId: "unknown",
            model: "unknown",
            promptVersion: `${PLANNER_PROMPT_VERSION}-assess`,
            input: run.input,
            reasoning: assessData.reasoning ?? [],
            status: "success" as const,
            clarificationRound: round,
          };
          get().appendAudit(assessAudit);
          get().appendPlannerActivity(missionId, "PMF assessment completed");
          if (assessData.assessment.gaps.length > 0) {
            get().appendPlannerActivity(missionId, "Planner identified gaps");
          }

          const pmfReadiness = assessData.assessment.pmfReadiness;
          const pmfStage = inferCurrentPmfStage(pmfReadiness);
          applyPmfToMission(
            missionId,
            pmfReadiness,
            pmfStage,
            run.input.discoveryMode ?? "quick"
          );
          get().appendPlannerActivity(missionId, "Planner updated PMF readiness");

          const meta: PlannerRunMeta = {
            discoveryMode: run.input.discoveryMode ?? "quick",
            clarificationRound: round,
            clarificationHistory: run.plannerMeta?.clarificationHistory ?? [],
            lastAssessment: assessData.assessment,
            pendingQuestions: assessData.assessment.needsClarification
              ? assessData.assessment.questions
              : undefined,
            pmfReadiness,
            currentPmfStage: pmfStage,
          };

          if (
            assessData.assessment.needsClarification &&
            assessData.assessment.questions.length > 0 &&
            round < MAX_CLARIFICATION_ROUNDS
          ) {
            set((state) => ({
              runs: {
                ...state.runs,
                [key]: {
                  ...run,
                  status: "awaiting_clarification",
                  reasoning: assessData.reasoning ?? run.reasoning,
                  audit: assessAudit,
                  plannerMeta: meta,
                  errorMessage: undefined,
                },
              },
            }));
            get().appendPlannerActivity(missionId, "Planner requested clarification");
            return;
          }

          get().appendPlannerActivity(missionId, "Planner resumed analysis");
          await completePlannerBrief(set, get, {
            missionId,
            key,
            run: {
              ...run,
              input: run.input,
              plannerMeta: meta,
              reasoning: assessData.reasoning ?? run.reasoning,
            },
            providerInput,
            projectName,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Planner assessment failed";
          const promptHash = await plannerPromptHashAsync(providerInput);
          const failureAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = {
            id: createAuditId(),
            missionId,
            agentId: "product_planner",
            timestamp: new Date().toISOString(),
            providerId: "unknown",
            model: "unknown",
            promptVersion: PLANNER_PROMPT_VERSION,
            promptHash,
            input: run.input,
            reasoning: run.reasoning,
            status: "failed",
            errorMessage: message,
            clarificationRound: round,
          };
          failPlannerRunPreservingMeta(set, get, missionId, message, failureAudit);
          get().appendPlannerActivity(missionId, "Planning failed — retry available");
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      resumePlannerPipeline: async (missionId) => {
        if (plannerGenerationInFlight.has(missionId)) return;
        const key = plannerStorageKey(missionId);
        const run = getStoredPlannerRun(get, missionId);
        if (!canResumePlannerPipeline(run)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run!.input.idea);
        const round = run!.plannerMeta?.clarificationRound ?? 0;
        const providerInput = {
          ...run!.input,
          projectName,
          missionId,
          clarificationRound: round,
          questionsAskedSoFar: countQuestionsAskedForRun(run!),
        };

        get().setPlannerStatus(missionId, "working", undefined);
        get().appendPlannerActivity(missionId, "Planner resumed pipeline");

        try {
          await completePlannerBrief(set, get, {
            missionId,
            key,
            run: getStoredPlannerRun(get, missionId)!,
            providerInput,
            projectName,
          });
          get().appendPlannerActivities(missionId, [
            "Planner generated Product Brief",
            "Planning completed",
          ]);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Planner pipeline failed";
          failPlannerRunPreservingMeta(set, get, missionId, message);
          get().appendPlannerActivity(missionId, "Planning failed — retry available");
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      submitPlannerClarification: async (missionId, answers) => {
        const key = agentRunKey(missionId, "product_planner");
        const run = get().runs[key] as PlannerStoredRun | undefined;
        if (!run || run.status !== "awaiting_clarification") return;
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        const round = run.plannerMeta?.clarificationRound ?? 0;
        const questions = run.plannerMeta?.pendingQuestions ?? [];

        get().setPlannerStatus(missionId, "assessing");
        get().appendPlannerActivity(missionId, "User answered clarification");

        const history = [
          ...(run.plannerMeta?.clarificationHistory ?? []),
          { round: round + 1, questions, answers },
        ];

        try {
          const response = await fetch("/api/agents/planner/clarify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              missionId,
              idea: run.input.idea,
              targetUsers: run.input.targetUsers,
              successGoal: run.input.successGoal,
              projectName,
              discoveryMode: run.plannerMeta?.discoveryMode ?? "quick",
              clarificationRound: round,
              answers,
              history: run.plannerMeta?.clarificationHistory ?? [],
              questionsAskedSoFar: countQuestionsAskedForRun(run),
            }),
          });

          const data = (await response.json()) as {
            phase?: "clarification" | "brief";
            mergedInput?: ProjectCreationInput;
            assessment?: PlannerRunMeta["lastAssessment"];
            reasoning?: string[];
            output?: PlannerGenerationResult;
            audit?: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>;
            error?: string;
          };

          if (!response.ok || data.error) {
            throw new Error(data.error ?? "Clarification failed");
          }

          if (data.audit) get().appendAudit(data.audit);

          const mergedInput = data.mergedInput ?? run.input;
          const nextRound = round + 1;

          if (data.phase === "clarification" && data.assessment) {
            const nextAssessment = data.assessment;
            const pmfReadiness = nextAssessment.pmfReadiness;
            const pmfStage = inferCurrentPmfStage(pmfReadiness);
            set((state) => ({
              runs: {
                ...state.runs,
                [key]: {
                  ...run,
                  status: "awaiting_clarification",
                  input: mergedInput,
                  reasoning: data.reasoning ?? run.reasoning,
                  plannerMeta: {
                    discoveryMode: run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick",
                    clarificationRound: nextRound,
                    clarificationHistory: history,
                    lastAssessment: nextAssessment,
                    pendingQuestions: nextAssessment.questions,
                    pmfReadiness,
                    currentPmfStage: pmfStage,
                  },
                },
              },
            }));
            const activityMessages = ["Planner requested clarification", "Planner updated PMF readiness"];
            if (nextAssessment.gaps.length > 0) {
              activityMessages.push("Planner identified gaps");
            }
            queueMicrotask(() => {
              applyPmfToMission(
                missionId,
                pmfReadiness,
                pmfStage,
                run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick"
              );
              get().appendPlannerActivities(missionId, activityMessages);
            });
            return;
          }

          if (data.phase === "brief" && data.output) {
            const briefAssessment = data.assessment;
            const briefPmf = briefAssessment?.pmfReadiness;
            const briefStage = briefPmf ? inferCurrentPmfStage(briefPmf) : undefined;
            const discoveryMode =
              run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick";
            await completePlannerBrief(set, get, {
              missionId,
              key,
              run: {
                ...run,
                input: mergedInput,
                plannerMeta: {
                  discoveryMode: run.plannerMeta?.discoveryMode ?? run.input.discoveryMode ?? "quick",
                  clarificationRound: nextRound,
                  clarificationHistory: history,
                  lastAssessment: briefAssessment,
                  pmfReadiness: briefPmf ?? run.plannerMeta?.pmfReadiness,
                  currentPmfStage: briefStage ?? run.plannerMeta?.currentPmfStage,
                },
              },
              providerInput: {
                ...mergedInput,
                projectName,
                missionId,
                clarificationRound: nextRound,
              },
              projectName,
              output: data.output,
              audit: data.audit,
            });
            queueMicrotask(() => {
              if (briefPmf && briefStage) {
                applyPmfToMission(missionId, briefPmf, briefStage, discoveryMode);
              }
              get().appendPlannerActivities(missionId, [
                "Planner resumed analysis",
                "Planner updated PMF readiness",
                "Planner generated Product Brief",
                "Planning completed",
              ]);
            });
            return;
          }

          throw new Error("Unexpected clarification response");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Clarification failed";
          failPlannerRunPreservingMeta(set, get, missionId, message);
          get().appendPlannerActivity(missionId, "Planning failed — retry available");
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      retryPlannerGeneration: async (missionId) => {
        const key = plannerStorageKey(missionId);
        const run = getStoredPlannerRun(get, missionId);
        if (!run) return;

        if (canResumePlannerPipeline(run)) {
          await get().resumePlannerPipeline(missionId);
          return;
        }

        set((state) => ({
          runs: {
            ...state.runs,
            [key]: { ...run, status: "idle", errorMessage: undefined },
          },
        }));
        await get().generatePlannerForMission(missionId);
      },

      sendDiscoveryDiscussionMessage: async (missionId, userMessage, targetAudience) => {
        await sendDiscoveryDiscussionMessage(
          set,
          get,
          missionId,
          userMessage,
          targetAudience
        );
      },

      setDiscussionMode: (missionId, mode) => {
        setDiscussionModeOnMission(set, get, missionId, mode);
      },

      createDecisionFromMessage: (missionId, input) => {
        createDecisionFromMessageOnMission(set, get, missionId, input);
      },

      setCeoDecisionOnItem: (missionId, decisionId, status) => {
        setCeoDecisionOnItem(set, get, missionId, decisionId, status);
      },

      proposeBriefChangeFromDecision: (missionId, decisionId) => {
        proposeBriefChangeCandidate(set, get, missionId, decisionId);
      },

      applyApprovedDecisionToBrief: (missionId, decisionId) => {
        applyApprovedDecisionToBrief(set, get, missionId, decisionId);
      },

      commitBriefChangeCandidate: (missionId, candidateId) => {
        commitBriefChangeCandidate(set, get, missionId, candidateId);
      },

      generateMeetingMinutes: (missionId, trigger) => {
        generateMeetingMinutesForMission(set, get, missionId, trigger);
      },

      recordArchitectHandoffOpened: (missionId) => {
        recordArchitectHandoffOpened(set, get, missionId);
      },

      finalizeMeetingMinutes: (missionId) => {
        finalizeMeetingMinutes(set, get, missionId);
      },

      applyDiscoveryBriefProposal: (missionId, proposalId) => {
        applyDiscoveryBriefProposal(set, get, missionId, proposalId);
      },

      dismissDiscoveryBriefProposal: (missionId, proposalId) => {
        dismissDiscoveryBriefProposal(set, get, missionId, proposalId);
      },

      clearBriefApplyFeedback: (missionId) => {
        const key = plannerStorageKey(missionId);
        const run = getStoredPlannerRun(get, missionId);
        if (!run?.plannerMeta) return;
        persistPlannerRun(set, key, {
          plannerMeta: mergePlannerMeta(run.plannerMeta, { lastBriefApplyFeedback: undefined }),
        });
      },

      ensureCooReviewForMission: async (missionId) => {
        const key = plannerStorageKey(missionId);
        const run = getStoredPlannerRun(get, missionId);
        const brief = run?.audit?.output?.brief as ProductBriefSections | undefined;
        const hasReview =
          run?.plannerMeta?.cooReviewReport ??
          migrateLegacyReviewReport(run?.plannerMeta?.ceoReviewReport);
        if (!run || !brief || hasReview) return;
        if (plannerGenerationInFlight.has(missionId)) return;

        plannerGenerationInFlight.add(missionId);
        const projectName = projectNameFromIdea(run.input.idea);
        const round = run.plannerMeta?.clarificationRound ?? 0;

        try {
          const { report: cooReviewReport, cooReviewHistory } = await ensureCooReview(get, {
            missionId,
            providerInput: {
              ...run.input,
              projectName,
              missionId,
              clarificationRound: round,
            },
            run,
            brief,
            briefAudit: run.audit as AgentAuditRecord<
              ProjectCreationInput,
              PlannerGenerationResult
            >,
          });

          persistPlannerRun(set, key, {
            plannerMeta: mergePlannerMeta(run.plannerMeta, {
              cooReviewReport,
              cooReviewHistory,
              executiveDecision: "awaiting_ceo_approval",
            }),
          });

          applyCooReviewToMission(missionId, cooReviewReport);

          const mission = useMissionStore.getState().missions.find((m) => m.id === missionId);
          if (mission) {
            const feedCopy = organizationFeedMessageForCooReviewComplete(
              mission.name,
              cooReviewReport.recommendation
            );
            useOrganizationStore.getState().addFeedItemWithSync({
              type: "coordination",
              author: "COO",
              authorName: "Nova",
              missionId,
              missionName: mission.name,
              message: feedCopy.message,
              status: "active",
              requiresCeoApproval: feedCopy.requiresCeoApproval,
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "COO review failed";
          get().appendPlannerActivity(missionId, message);
        } finally {
          plannerGenerationInFlight.delete(missionId);
        }
      },

      submitExecutiveDecision: async (missionId, action, validationReason) => {
        const key = plannerStorageKey(missionId);
        const run = getStoredPlannerRun(get, missionId);
        if (!run?.plannerMeta?.cooReviewReport && !run?.plannerMeta?.ceoReviewReport) return;

        const decision: ExecutiveDecisionStatus =
          action === "approve"
            ? "approved"
            : action === "needs_validation"
              ? "needs_validation"
              : "hold";

        const activities = [
          decision === "approved"
            ? ceoApprovedArchitectureActivity(missionId)
            : decision === "needs_validation"
              ? ceoRequestedValidationActivity(missionId)
              : ceoPlacedOnHoldActivity(missionId),
          ...(decision === "approved" ? [ceoApprovalCompletedTimelineActivity(missionId)] : []),
        ];

        useProjectCreationStore.setState((state) => ({
          activities: [...activities, ...state.activities].slice(0, 120),
        }));

        const approvedBriefVersion =
          decision === "approved"
            ? (run.plannerMeta?.briefVersion ?? 1)
            : undefined;

        persistPlannerRun(set, key, {
          plannerMeta: mergePlannerMeta(run.plannerMeta, {
            executiveDecision: decision,
            validationReason:
              decision === "needs_validation" ? validationReason : undefined,
            validationRequestedAt:
              decision === "needs_validation" ? new Date().toISOString() : undefined,
            ceoApprovedAt: decision === "approved" ? new Date().toISOString() : undefined,
            latestApprovedBriefVersion: approvedBriefVersion,
          }),
        });

        applyExecutiveDecisionToMission(missionId, decision, {
          validationReason,
          latestApprovedBriefVersion: approvedBriefVersion,
        });

        get().appendAudit(humanCeoDecisionAudit(missionId, decision, validationReason));

        if (decision === "needs_validation" && validationReason?.trim()) {
          get().appendAudit(validationRequestedAudit(missionId, validationReason));
        }

        const mission = useMissionStore.getState().missions.find((m) => m.id === missionId);
        if (mission) {
          const message =
            decision === "approved"
              ? `CEO approved architecture for "${mission.name}" — Architect phase unlocked.`
              : decision === "needs_validation"
                ? `CEO requested additional validation for "${mission.name}".`
                : `CEO placed "${mission.name}" on hold.`;
          useOrganizationStore.getState().addFeedItemWithSync({
            type: "coordination",
            author: "CEO",
            authorName: "Executive",
            missionId,
            missionName: mission.name,
            message,
            status: "active",
            requiresCeoApproval: decision === "needs_validation",
          });
        }

        if (decision === "needs_validation") {
          void runPlannerRevalidationForMission(set, get, missionId, validationReason ?? "");
        }
      },
    }),
    {
      name: "productai-agent-runs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        runs: state.runs,
        auditTrail: state.auditTrail,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined" || !state) return;
        try {
          const raw = localStorage.getItem(LEGACY_PLANNER_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as { state?: { runs?: Record<string, unknown> } };
          state.mergeLegacyPlannerRuns(parsed.state?.runs ?? {});
          localStorage.removeItem(LEGACY_PLANNER_STORAGE_KEY);
        } catch {
          /* ignore corrupt legacy storage */
        }
      },
    }
  )
);
