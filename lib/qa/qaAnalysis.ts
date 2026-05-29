import type { Mission, PullRequest, ReleaseItem, Task } from "@/types/productai";
import {
  buildDeveloperMissionContext,
  buildDeveloperEligibleMissionIds,
} from "@/lib/developer/developerAnalysis";
import { qaWorkspaceAdvisoryNote, testPlanIdFromMission } from "@/lib/qa/qaWorkspace";
import type { QaReviewStateId } from "@/lib/qa/qaWorkspace";
import type { TestPlanRecord } from "@/lib/qa/testPlan";
import { buildTestPlanRecord } from "@/lib/qa/testPlan";
import type { ValidationChecklistView } from "@/lib/qa/validationChecklist";
import { buildValidationChecklist } from "@/lib/qa/validationChecklist";
import type { AcceptanceCriterionRow } from "@/lib/qa/acceptanceCriteria";
import { buildAcceptanceCriteria } from "@/lib/qa/acceptanceCriteria";
import type { QualityRiskReviewView } from "@/lib/qa/qualityRiskReview";
import { buildQualityRiskReview } from "@/lib/qa/qualityRiskReview";
import type { ReleaseValidationView } from "@/lib/qa/releaseValidation";
import { buildReleaseValidation } from "@/lib/qa/releaseValidation";
import type { QaReadinessContext } from "@/lib/qa/qaReadiness";
import { buildQaReadinessContext } from "@/lib/qa/qaReadiness";
import { developerWorkspaceHref } from "@/lib/developer/developerWorkspace";

export interface DevelopmentIntakeView {
  missionId: string;
  missionName: string;
  implementationSummary: string;
  frontendScope: string;
  backendScope: string;
  databaseScope: string;
  aiScope: string;
  technicalRisks: string[];
}

export interface QaMissionRow {
  missionId: string;
  missionName: string;
  testPlanId: string;
  qaReadiness: string;
  reviewState: QaReviewStateId;
  updatedAt: string;
}

export interface QaOverviewSummary {
  testPlans: number;
  qaReviews: number;
  validationRisks: number;
  releaseReviewCandidates: number;
  advisoryNote: string;
}

export interface QaHandoffContextItem {
  missionId: string;
  missionName: string;
  implementationPlanTitle: string;
  technicalRiskCount: number;
  qaReadiness: string;
  qaHref: string;
}

export interface QaMissionContext {
  mission: Mission;
  intake: DevelopmentIntakeView;
  testPlan: TestPlanRecord;
  checklist: ValidationChecklistView;
  acceptance: AcceptanceCriterionRow[];
  riskReview: QualityRiskReviewView;
  releaseValidation: ReleaseValidationView;
  readiness: QaReadinessContext;
  upstreamLinks: {
    developerHref: string;
    implementationPlanReviewHref: string;
    testPlanReviewHref: string;
  };
}

function buildDevelopmentIntake(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): DevelopmentIntakeView | null {
  const devCtx = buildDeveloperMissionContext(input);
  if (!devCtx) return null;
  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    implementationSummary: devCtx.implementationPlan.implementationSummary,
    frontendScope: devCtx.implementationPlan.frontendScope,
    backendScope: devCtx.implementationPlan.backendScope,
    databaseScope: devCtx.implementationPlan.databaseScope,
    aiScope: devCtx.implementationPlan.aiScope,
    technicalRisks: [
      ...devCtx.technicalRisks.technicalRisks,
      ...devCtx.technicalRisks.openTechnicalQuestions.slice(0, 2),
    ],
  };
}

export function buildQaMissionContext(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): QaMissionContext | null {
  const devCtx = buildDeveloperMissionContext({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  const intake = buildDevelopmentIntake({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  if (!devCtx || !intake) return null;

  const checklist = buildValidationChecklist({
    missionId: input.mission.id,
    riskCount: devCtx.technicalRisks.openTechnicalQuestions.length,
    releaseCandidateHint: input.mission.progress >= 85,
  });
  const testPlan = buildTestPlanRecord({
    mission: input.mission,
    implementationPlan: devCtx.implementationPlan,
    repositoryPlan: devCtx.repositoryPlan,
    technicalRisks: devCtx.technicalRisks,
  });
  const acceptance = buildAcceptanceCriteria({
    missionName: input.mission.name,
    implementationSummary: devCtx.implementationPlan.implementationSummary,
  });
  const riskReview = buildQualityRiskReview({
    technicalRisks: devCtx.technicalRisks,
    reviewPreparation: devCtx.reviewPreparation,
    validationChecklist: checklist,
  });

  const readiness = buildQaReadinessContext({
    testPlan,
    acceptanceCriteria: acceptance,
    checklist,
    riskReview,
    releaseValidation: null,
  });

  const releaseValidation = buildReleaseValidation({
    mission: input.mission,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
    validationChecklist: checklist,
    qaReadinessLabel: readiness.statusLabel,
  });

  const readinessWithRelease = buildQaReadinessContext({
    testPlan,
    acceptanceCriteria: acceptance,
    checklist,
    riskReview,
    releaseValidation,
  });

  return {
    mission: input.mission,
    intake,
    testPlan,
    checklist,
    acceptance,
    riskReview,
    releaseValidation,
    readiness: readinessWithRelease,
    upstreamLinks: {
      developerHref: developerWorkspaceHref({ missionId: input.mission.id }),
      implementationPlanReviewHref: devCtx.implementationPlan.artifactReviewHref,
      testPlanReviewHref: testPlan.artifactReviewHref,
    },
  };
}

export function buildQaMissionRows(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): QaMissionRow[] {
  const eligibleMissionIds = buildDeveloperEligibleMissionIds(input.missions, input.tasks);
  return eligibleMissionIds
    .map((missionId) => {
      const mission = input.missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildQaMissionContext({
        mission,
        missions: input.missions,
        tasks: input.tasks,
        pullRequests: input.pullRequests,
        releases: input.releases,
      });
      if (!ctx) return null;

      const reviewState: QaReviewStateId =
        ctx.readiness.status === "ready_for_release_review"
          ? "completed"
          : ctx.readiness.status === "review_candidate"
            ? "in_review"
            : "planned";

      return {
        missionId,
        missionName: mission.name,
        testPlanId: testPlanIdFromMission(missionId),
        qaReadiness: ctx.readiness.statusLabel,
        reviewState,
        updatedAt: mission.updatedAt,
      };
    })
    .filter((r): r is QaMissionRow => r !== null);
}

export function buildQaOverview(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): QaOverviewSummary {
  const eligibleMissionIds = buildDeveloperEligibleMissionIds(input.missions, input.tasks);
  let validationRisks = 0;
  let releaseReviewCandidates = 0;

  for (const id of eligibleMissionIds) {
    const mission = input.missions.find((m) => m.id === id);
    if (!mission) continue;
    const ctx = buildQaMissionContext({
      mission,
      missions: input.missions,
      tasks: input.tasks,
      pullRequests: input.pullRequests,
      releases: input.releases,
    });
    if (!ctx) continue;
    validationRisks += ctx.riskReview.openQaQuestions.length + ctx.riskReview.integrationConcerns.length;
    if (ctx.readiness.status === "ready_for_release_review") releaseReviewCandidates += 1;
  }

  return {
    testPlans: eligibleMissionIds.length,
    qaReviews: eligibleMissionIds.length,
    validationRisks,
    releaseReviewCandidates,
    advisoryNote: qaWorkspaceAdvisoryNote,
  };
}

export function buildQaHandoffContextItems(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): QaHandoffContextItem[] {
  const eligibleMissionIds = buildDeveloperEligibleMissionIds(input.missions, input.tasks);
  return eligibleMissionIds
    .map((missionId) => {
      const mission = input.missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const qaCtx = buildQaMissionContext({
        mission,
        missions: input.missions,
        tasks: input.tasks,
        pullRequests: input.pullRequests,
        releases: input.releases,
      });
      const devCtx = buildDeveloperMissionContext({
        mission,
        missions: input.missions,
        tasks: input.tasks,
      });
      if (!qaCtx || !devCtx) return null;

      return {
        missionId,
        missionName: mission.name,
        implementationPlanTitle: devCtx.implementationPlan.title,
        technicalRiskCount: devCtx.technicalRisks.openTechnicalQuestions.length,
        qaReadiness: qaCtx.readiness.statusLabel,
        qaHref: `/qa-workspace?mission=${missionId}`,
      };
    })
    .filter((i): i is QaHandoffContextItem => i !== null);
}

export function buildQaWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
  testPlanId?: string | null;
  reviewStateFilter?: QaReviewStateId | null;
}) {
  let rows = buildQaMissionRows({
    missions: input.missions,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
  });

  if (input.reviewStateFilter) {
    rows = rows.filter((r) => r.reviewState === input.reviewStateFilter);
  }

  if (input.missionId) {
    rows = rows.filter((r) => r.missionId === input.missionId);
  }

  const selectedMissionId =
    input.missionId ??
    (input.testPlanId
      ? rows.find((r) => r.testPlanId === input.testPlanId)?.missionId
      : rows[0]?.missionId) ??
    null;

  const selectedMission = selectedMissionId
    ? input.missions.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const context =
    selectedMission != null
      ? buildQaMissionContext({
          mission: selectedMission,
          missions: input.missions,
          tasks: input.tasks,
          pullRequests: input.pullRequests,
          releases: input.releases,
        })
      : null;

  return {
    rows,
    eligibleCount: buildDeveloperEligibleMissionIds(input.missions, input.tasks).length,
    selectedMission,
    context,
    overview: buildQaOverview({
      missions: input.missions,
      tasks: input.tasks,
      pullRequests: input.pullRequests,
      releases: input.releases,
    }),
    handoffContextItems: buildQaHandoffContextItems({
      missions: input.missions,
      tasks: input.tasks,
      pullRequests: input.pullRequests,
      releases: input.releases,
    }),
    advisoryNote: qaWorkspaceAdvisoryNote,
    progressNote: context
      ? context.readiness.recommendation
      : rows.length === 0
        ? "No development context available—complete Developer Workspace planning first."
        : "Select a mission to view QA planning support.",
  };
}

