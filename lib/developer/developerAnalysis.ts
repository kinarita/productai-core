import type { Mission, Task } from "@/types/productai";
import { buildArchitectMissionContext } from "@/lib/architect/architectAnalysis";
import { buildDesignerMissionContext } from "@/lib/designer/designerAnalysis";
import { buildImplementationPlanRecord, type ImplementationPlanRecord } from "@/lib/developer/implementationPlan";
import {
  buildDevelopmentWorkBreakdown,
  type DevelopmentWorkItem,
} from "@/lib/developer/workBreakdown";
import { buildRepositoryPlan, type RepositoryPlanView } from "@/lib/developer/repositoryPlan";
import { buildTechnicalRiskReview, type TechnicalRiskReviewView } from "@/lib/developer/technicalRiskReview";
import {
  buildDevelopmentReviewPreparation,
  type DevelopmentReviewPreparationView,
} from "@/lib/developer/reviewPreparation";
import {
  buildDevelopmentReadinessContext,
  type DevelopmentReadinessContext,
} from "@/lib/developer/developmentReadiness";
import { developerWorkspaceAdvisoryNote } from "@/lib/developer/developerWorkspace";
import type { DevelopmentReadinessStateId } from "@/lib/developer/developerWorkspace";
import { implementationPlanIdFromMission } from "@/lib/developer/developerWorkspace";

export interface DesignIntakeView {
  missionName: string;
  userFlowSummary: string;
  designPrinciples: string[];
  screenInventorySummary: string;
  componentInventorySummary: string;
  uxNotes: string[];
  missionId: string;
}

export interface DeveloperMissionRow {
  missionId: string;
  missionName: string;
  implementationPlanId: string;
  reviewStatus: string;
  technicalRisks: number;
  updatedAt: string;
}

export interface DevelopmentOverviewSummary {
  implementationPlans: number;
  developmentReviews: number;
  technicalRisks: number;
  qaPlanningCandidates: number;
  advisoryNote: string;
}

export interface DevelopmentHandoffContextItem {
  missionId: string;
  missionName: string;
  userFlowTitle: string;
  designSpecificationTitle: string;
  developmentReadiness: string;
  developerHref: string;
}

function isDeveloperEligible(missions: Mission[], tasks: Task[], missionId: string): boolean {
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return false;
  const designerCtx = buildDesignerMissionContext({ mission, missions, tasks });
  return designerCtx != null && designerCtx.designReview.status !== "not_ready";
}

export function buildDeveloperEligibleMissionIds(missions: Mission[], tasks: Task[]): string[] {
  return missions
    .map((m) => m.id)
    .filter((id) => isDeveloperEligible(missions, tasks, id));
}

export function buildDesignIntake(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): DesignIntakeView | null {
  const designerCtx = buildDesignerMissionContext({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  if (!designerCtx) return null;

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    userFlowSummary: designerCtx.userFlow.primaryFlow.join(" → "),
    designPrinciples: designerCtx.designSpec.designPrinciples,
    screenInventorySummary: `${designerCtx.screens.length} screens identified (e.g. ${designerCtx.screens[0]?.screenName ?? "—"})`,
    componentInventorySummary: `${designerCtx.components.length} components documented`,
    uxNotes: [
      ...designerCtx.ux.userGoals.slice(0, 2),
      ...designerCtx.ux.accessibilityNotes.slice(0, 1),
    ],
  };
}

export interface DeveloperMissionContext {
  mission: Mission;
  intake: DesignIntakeView;
  implementationPlan: ImplementationPlanRecord;
  workBreakdown: DevelopmentWorkItem[];
  repositoryPlan: RepositoryPlanView;
  technicalRisks: TechnicalRiskReviewView;
  reviewPreparation: DevelopmentReviewPreparationView;
  readiness: DevelopmentReadinessContext;
}

export function buildDeveloperMissionContext(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): DeveloperMissionContext | null {
  const designerCtx = buildDesignerMissionContext({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  const architectCtx = buildArchitectMissionContext({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  const intake = buildDesignIntake(input);
  if (!designerCtx || !architectCtx || !intake) return null;

  const implementationPlan = buildImplementationPlanRecord({
    mission: input.mission,
    designSpec: designerCtx.designSpec,
    technicalSpec: architectCtx.specification,
  });
  const workBreakdown = buildDevelopmentWorkBreakdown({
    mission: input.mission,
    tasks: input.tasks,
  });
  const repositoryPlan = buildRepositoryPlan(input.mission);
  const technicalRisks = buildTechnicalRiskReview({
    mission: input.mission,
    technicalSpec: architectCtx.specification,
    designSpec: designerCtx.designSpec,
  });
  const reviewPreparation = buildDevelopmentReviewPreparation({
    architectureReview: architectCtx.architectureReview,
    designReview: designerCtx.designReview,
  });
  const readiness = buildDevelopmentReadinessContext({
    hasTechnicalSpec: true,
    hasDesignSpec: true,
    componentCount: designerCtx.components.length,
    workBreakdown,
    repositoryPlan,
    risks: technicalRisks,
  });

  return {
    mission: input.mission,
    intake,
    implementationPlan,
    workBreakdown,
    repositoryPlan,
    technicalRisks,
    reviewPreparation,
    readiness,
  };
}

export function buildDevelopmentOverview(
  missions: Mission[],
  tasks: Task[]
): DevelopmentOverviewSummary {
  const ids = buildDeveloperEligibleMissionIds(missions, tasks);
  let developmentReviews = 0;
  let qaPlanningCandidates = 0;
  let technicalRisks = 0;

  ids.forEach((missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;
    const ctx = buildDeveloperMissionContext({ mission, missions, tasks });
    if (!ctx) return;
    technicalRisks += ctx.technicalRisks.openTechnicalQuestions.length;
    if (
      ctx.readiness.status === "review_candidate" ||
      ctx.readiness.status === "preparing"
    ) {
      developmentReviews += 1;
    }
    if (ctx.readiness.status === "ready_for_qa_planning") {
      qaPlanningCandidates += 1;
    }
  });

  return {
    implementationPlans: ids.length,
    developmentReviews,
    technicalRisks,
    qaPlanningCandidates,
    advisoryNote: developerWorkspaceAdvisoryNote,
  };
}

export function buildDeveloperMissionRows(
  missions: Mission[],
  tasks: Task[]
): DeveloperMissionRow[] {
  return buildDeveloperEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildDeveloperMissionContext({ mission, missions, tasks });
      if (!ctx) return null;
      return {
        missionId,
        missionName: mission.name,
        implementationPlanId: implementationPlanIdFromMission(missionId),
        reviewStatus: ctx.readiness.statusLabel,
        technicalRisks: ctx.technicalRisks.openTechnicalQuestions.length,
        updatedAt: mission.updatedAt,
      };
    })
    .filter((r): r is DeveloperMissionRow => r !== null);
}

export function buildDevelopmentHandoffContextItems(
  missions: Mission[],
  tasks: Task[]
): DevelopmentHandoffContextItem[] {
  return buildDeveloperEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const designerCtx = buildDesignerMissionContext({ mission, missions, tasks });
      const devCtx = buildDeveloperMissionContext({ mission, missions, tasks });
      if (!designerCtx || !devCtx) return null;
      if (
        designerCtx.designReview.status !== "review_candidate" &&
        designerCtx.designReview.status !== "ready_for_development_planning"
      ) {
        return null;
      }
      return {
        missionId,
        missionName: mission.name,
        userFlowTitle: designerCtx.userFlow.title,
        designSpecificationTitle: designerCtx.designSpec.title,
        developmentReadiness: devCtx.readiness.statusLabel,
        developerHref: `/developer-workspace?mission=${missionId}`,
      };
    })
    .filter((item): item is DevelopmentHandoffContextItem => item !== null);
}

export function buildDeveloperWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  implementationPlanId?: string | null;
  reviewStateFilter?: DevelopmentReadinessStateId | null;
}) {
  let rows = buildDeveloperMissionRows(input.missions, input.tasks);

  if (input.reviewStateFilter) {
    rows = rows.filter((r) => {
      const mission = input.missions.find((m) => m.id === r.missionId);
      if (!mission) return false;
      const ctx = buildDeveloperMissionContext({
        mission,
        missions: input.missions,
        tasks: input.tasks,
      });
      return ctx?.readiness.status === input.reviewStateFilter;
    });
  }

  if (input.missionId) {
    rows = rows.filter((r) => r.missionId === input.missionId);
  }

  const selectedMissionId =
    input.missionId ??
    (input.implementationPlanId
      ? rows.find((r) => r.implementationPlanId === input.implementationPlanId)?.missionId
      : rows[0]?.missionId) ??
    null;

  const selectedMission = selectedMissionId
    ? input.missions.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const context =
    selectedMission != null
      ? buildDeveloperMissionContext({
          mission: selectedMission,
          missions: input.missions,
          tasks: input.tasks,
        })
      : null;

  return {
    rows,
    eligibleCount: buildDeveloperEligibleMissionIds(input.missions, input.tasks).length,
    selectedMission,
    context,
    overview: buildDevelopmentOverview(input.missions, input.tasks),
    handoffContextItems: buildDevelopmentHandoffContextItems(input.missions, input.tasks),
    advisoryNote: developerWorkspaceAdvisoryNote,
    progressNote: context
      ? context.readiness.recommendation
      : rows.length === 0
        ? "No design context available—complete Designer Workspace first."
        : "Select a mission to view implementation planning support.",
  };
}
