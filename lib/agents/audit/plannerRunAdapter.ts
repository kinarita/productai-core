import { getBriefAtVersion } from "@/lib/discussion/briefVersioning";
import { inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
import {
  computeAggregatePmfReadinessScore,
  inferPmfMeasurementStatus,
} from "@/lib/pmf/pmfStatus";
import {
  defaultExecutiveDecisionForReport,
  migrateLegacyReviewReport,
} from "@/lib/coo-review/cooReviewMigration";
import type { PlannerStoredRun } from "@/lib/agents/planner/plannerTypes";
import type {
  PlannerAgentRun,
  PlannerAuditRecord,
  PlannerGenerationResult,
  PlannerRunStatus,
  ProductBriefSections,
} from "@/lib/agents/planner/plannerTypes";

export function toPlannerAgentRun(run: PlannerStoredRun | undefined): PlannerAgentRun | undefined {
  if (!run) return undefined;

  const output = run.audit?.output;
  const meta = run.plannerMeta;
  const brief =
    getBriefAtVersion(meta?.briefVersions, meta?.briefVersion)?.brief ??
    (output?.brief as ProductBriefSections | undefined);
  const assessment = meta?.lastAssessment;
  const pmfReadiness = meta?.pmfReadiness ?? assessment?.pmfReadiness;
  const pmfMeasurementStatus =
    meta?.pmfMeasurementStatus ?? inferPmfMeasurementStatus();
  const pmfReadinessScore =
    meta?.pmfReadinessScore ??
    (pmfReadiness ? computeAggregatePmfReadinessScore(pmfReadiness) : undefined);
  const currentPmfStage = pmfReadiness
    ? inferCurrentPmfStage(pmfReadiness, { pmfMeasurementStatus })
    : (meta?.currentPmfStage ?? "idea_validation");

  const cooReviewReport =
    meta?.cooReviewReport ?? migrateLegacyReviewReport(meta?.ceoReviewReport);
  const executiveDecision =
    meta?.executiveDecision ?? defaultExecutiveDecisionForReport(cooReviewReport);

  return {
    missionId: run.missionId,
    status: run.status as PlannerRunStatus,
    input: run.input,
    reasoning: run.reasoning,
    analysis: run.audit?.analysis ?? output?.analysis,
    decisions: run.audit?.decisions ?? output?.decisions,
    brief,
    audit: run.audit as PlannerAuditRecord | undefined,
    errorMessage: run.errorMessage,
    clarificationRound: meta?.clarificationRound ?? 0,
    lastAssessment: assessment,
    pendingQuestions: meta?.pendingQuestions,
    clarificationHistory: meta?.clarificationHistory,
    discoveryMode: meta?.discoveryMode ?? run.input.discoveryMode,
    pmfReadiness,
    currentPmfStage,
    pmfReadinessScore,
    pmfMeasurementStatus,
    cooReviewReport,
    executiveDecision,
    validationReason: meta?.validationReason,
    validationRequestedAt: meta?.validationRequestedAt,
    ceoApprovedAt: meta?.ceoApprovedAt,
    plannerRevalidationInFlight: meta?.plannerRevalidationInFlight,
    strengths: assessment?.strengths ?? run.audit?.strengths,
    gaps: assessment?.gaps ?? run.audit?.gaps,
    nextActions: assessment?.nextActions ?? run.audit?.nextActions,
    opportunities: assessment?.opportunities,
    threats: assessment?.threats,
    opportunityBrief: meta?.opportunityBrief,
    cpfReport: meta?.cpfReport,
    painPoints: meta?.cpfPainPoints ?? assessment?.painPoints,
    burningNeeds: meta?.cpfBurningNeeds ?? assessment?.burningNeeds,
    psfReport: meta?.psfReport,
    validationAssumptions:
      meta?.psfValidationAssumptions ?? assessment?.validationAssumptions,
    validationRisks: meta?.psfValidationRisks ?? assessment?.validationRisks,
    mvpScope: meta?.psfMvpScope ?? assessment?.mvpScope,
    discussionMessages: meta?.discussionMessages,
    pendingProposals: meta?.pendingProposals,
    briefVersions: meta?.briefVersions,
    briefVersion: meta?.briefVersion,
    latestApprovedBriefVersion: meta?.latestApprovedBriefVersion,
    briefVersionAudits: meta?.briefVersionAudits,
    lastBriefApplyFeedback: meta?.lastBriefApplyFeedback,
  };
}
