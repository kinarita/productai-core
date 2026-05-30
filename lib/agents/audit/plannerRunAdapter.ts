import { inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
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
  const brief = output?.brief as ProductBriefSections | undefined;
  const meta = run.plannerMeta;
  const assessment = meta?.lastAssessment;

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
    pmfReadiness: meta?.pmfReadiness ?? assessment?.pmfReadiness,
    currentPmfStage:
      meta?.currentPmfStage ??
      (meta?.pmfReadiness || assessment?.pmfReadiness
        ? inferCurrentPmfStage(meta?.pmfReadiness ?? assessment!.pmfReadiness)
        : "idea_validation"),
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
  };
}
