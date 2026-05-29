import type { Mission, Task } from "@/types/productai";
import { buildArchitectMissionContext } from "@/lib/architect/architectAnalysis";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import { buildUserFlowRecord, type UserFlowRecord } from "@/lib/designer/userFlow";
import { buildScreenInventory, type ScreenInventoryRow } from "@/lib/designer/screenInventory";
import { buildUxSpecification, type UxSpecificationView } from "@/lib/designer/uxSpecification";
import {
  buildDesignSpecificationRecord,
  type DesignSpecificationRecord,
} from "@/lib/designer/designSpecification";
import { buildComponentInventory, type ComponentInventoryRow } from "@/lib/designer/componentInventory";
import { buildDesignReviewContext, type DesignReviewContext } from "@/lib/designer/designReview";
import { designerWorkspaceAdvisoryNote } from "@/lib/designer/designerWorkspace";
import type { DesignReviewStateId } from "@/lib/designer/designerWorkspace";
import {
  designSpecificationIdFromMission,
  userFlowIdFromMission,
} from "@/lib/designer/designerWorkspace";

export interface TechnicalSpecificationIntakeView {
  missionName: string;
  problemStatement: string;
  proposedSolution: string;
  architectureSummary: string;
  constraints: string[];
  assumptions: string[];
  openQuestions: string[];
  missionId: string;
}

export interface DesignerMissionRow {
  missionId: string;
  missionName: string;
  userFlowId: string;
  designSpecificationId: string;
  reviewStatus: string;
  openUxQuestions: number;
  updatedAt: string;
}

export interface DesignOverviewSummary {
  userFlows: number;
  designReviews: number;
  developmentPlanningCandidates: number;
  openUxQuestions: number;
  advisoryNote: string;
}

export interface DesignHandoffContextItem {
  missionId: string;
  missionName: string;
  technicalSpecificationTitle: string;
  openQuestions: string[];
  designReadiness: string;
  designerHref: string;
}

function isDesignerEligible(missions: Mission[], tasks: Task[], missionId: string): boolean {
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return false;
  const ctx = buildArchitectMissionContext({ mission, missions, tasks });
  return ctx != null && ctx.architectureReview.status !== "not_ready";
}

export function buildDesignerEligibleMissionIds(missions: Mission[], tasks: Task[]): string[] {
  return missions
    .map((m) => m.id)
    .filter((id) => isDesignerEligible(missions, tasks, id));
}

export function buildTechnicalSpecificationIntake(
  specification: TechnicalSpecificationRecord,
  missionName: string
): TechnicalSpecificationIntakeView {
  return {
    missionId: specification.missionId,
    missionName,
    problemStatement: specification.problemStatement,
    proposedSolution: specification.proposedSolution,
    architectureSummary: specification.architectureSummary,
    constraints: specification.constraints,
    assumptions: specification.assumptions,
    openQuestions: specification.openQuestions,
  };
}

export interface DesignerMissionContext {
  mission: Mission;
  intake: TechnicalSpecificationIntakeView;
  userFlow: UserFlowRecord;
  screens: ScreenInventoryRow[];
  ux: UxSpecificationView;
  designSpec: DesignSpecificationRecord;
  components: ComponentInventoryRow[];
  designReview: DesignReviewContext;
}

export function buildDesignerMissionContext(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): DesignerMissionContext | null {
  const architectCtx = buildArchitectMissionContext({
    mission: input.mission,
    missions: input.missions,
    tasks: input.tasks,
  });
  if (!architectCtx) return null;

  const specification = architectCtx.specification;
  const intake = buildTechnicalSpecificationIntake(specification, input.mission.name);
  const userFlow = buildUserFlowRecord({ mission: input.mission, specification });
  const screens = buildScreenInventory(input.mission);
  const ux = buildUxSpecification({ mission: input.mission, specification });
  const designSpec = buildDesignSpecificationRecord({ mission: input.mission });
  const components = buildComponentInventory();
  const designReview = buildDesignReviewContext({
    userFlow,
    screens,
    ux,
    designSpec,
    components,
  });

  return {
    mission: input.mission,
    intake,
    userFlow,
    screens,
    ux,
    designSpec,
    components,
    designReview,
  };
}

export function buildDesignOverview(missions: Mission[], tasks: Task[]): DesignOverviewSummary {
  const ids = buildDesignerEligibleMissionIds(missions, tasks);
  let designReviews = 0;
  let developmentPlanningCandidates = 0;
  let openUxQuestions = 0;

  ids.forEach((missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;
    const ctx = buildDesignerMissionContext({ mission, missions, tasks });
    if (!ctx) return;
    openUxQuestions += ctx.intake.openQuestions.length;
    if (
      ctx.designReview.status === "review_candidate" ||
      ctx.designReview.status === "preparing"
    ) {
      designReviews += 1;
    }
    if (ctx.designReview.status === "ready_for_development_planning") {
      developmentPlanningCandidates += 1;
    }
  });

  return {
    userFlows: ids.length,
    designReviews,
    developmentPlanningCandidates,
    openUxQuestions,
    advisoryNote: designerWorkspaceAdvisoryNote,
  };
}

export function buildDesignerMissionRows(missions: Mission[], tasks: Task[]): DesignerMissionRow[] {
  return buildDesignerEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildDesignerMissionContext({ mission, missions, tasks });
      if (!ctx) return null;
      return {
        missionId,
        missionName: mission.name,
        userFlowId: userFlowIdFromMission(missionId),
        designSpecificationId: designSpecificationIdFromMission(missionId),
        reviewStatus: ctx.designReview.statusLabel,
        openUxQuestions: ctx.intake.openQuestions.length,
        updatedAt: mission.updatedAt,
      };
    })
    .filter((r): r is DesignerMissionRow => r !== null);
}

export function buildDesignHandoffContextItems(
  missions: Mission[],
  tasks: Task[]
): DesignHandoffContextItem[] {
  return buildDesignerEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildDesignerMissionContext({ mission, missions, tasks });
      if (!ctx) return null;
      const architectCtx = buildArchitectMissionContext({ mission, missions, tasks });
      if (
        !architectCtx ||
        (architectCtx.architectureReview.status !== "review_candidate" &&
          architectCtx.architectureReview.status !== "ready_for_design_review")
      ) {
        return null;
      }
      return {
        missionId,
        missionName: mission.name,
        technicalSpecificationTitle: architectCtx.specification.title,
        openQuestions: ctx.intake.openQuestions,
        designReadiness: ctx.designReview.statusLabel,
        designerHref: `/designer-workspace?mission=${missionId}`,
      };
    })
    .filter((item): item is DesignHandoffContextItem => item !== null);
}

export function buildDesignerWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  userFlowId?: string | null;
  designSpecificationId?: string | null;
  reviewStateFilter?: DesignReviewStateId | null;
}) {
  let rows = buildDesignerMissionRows(input.missions, input.tasks);

  if (input.reviewStateFilter) {
    rows = rows.filter((r) => {
      const mission = input.missions.find((m) => m.id === r.missionId);
      if (!mission) return false;
      const ctx = buildDesignerMissionContext({ mission, missions: input.missions, tasks: input.tasks });
      return ctx?.designReview.status === input.reviewStateFilter;
    });
  }

  if (input.missionId) {
    rows = rows.filter((r) => r.missionId === input.missionId);
  }

  const selectedMissionId =
    input.missionId ??
    (input.userFlowId
      ? rows.find((r) => r.userFlowId === input.userFlowId)?.missionId
      : input.designSpecificationId
        ? rows.find((r) => r.designSpecificationId === input.designSpecificationId)?.missionId
        : rows[0]?.missionId) ??
    null;

  const selectedMission = selectedMissionId
    ? input.missions.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const context =
    selectedMission != null
      ? buildDesignerMissionContext({
          mission: selectedMission,
          missions: input.missions,
          tasks: input.tasks,
        })
      : null;

  return {
    rows,
    eligibleCount: buildDesignerEligibleMissionIds(input.missions, input.tasks).length,
    selectedMission,
    context,
    overview: buildDesignOverview(input.missions, input.tasks),
    handoffContextItems: buildDesignHandoffContextItems(input.missions, input.tasks),
    advisoryNote: designerWorkspaceAdvisoryNote,
    progressNote: context
      ? context.designReview.recommendation
      : rows.length === 0
        ? "No technical specification context—complete Architect Workspace first."
        : "Select a mission to view UX and design support.",
  };
}
