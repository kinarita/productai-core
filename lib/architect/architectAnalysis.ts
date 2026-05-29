import type { Mission, Task } from "@/types/productai";
import {
  buildDirectorEligibleBriefs,
  buildDirectorMissionContext,
} from "@/lib/director/directorAnalysis";
import { buildTechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import { buildSystemDesign } from "@/lib/architect/systemDesign";
import { buildComponentDesign } from "@/lib/architect/componentDesign";
import { buildDataModel } from "@/lib/architect/dataModel";
import { buildApiDesign } from "@/lib/architect/apiDesign";
import { buildDependencyDesign } from "@/lib/architect/dependencyDesign";
import { buildArchitectureReviewContext } from "@/lib/architect/architectureReview";
import type { ArchitectureReviewContext } from "@/lib/architect/architectureReview";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";
import type { SystemDesignArea } from "@/lib/architect/systemDesign";
import type { ComponentDesignRow } from "@/lib/architect/componentDesign";
import type { DataModelEntity } from "@/lib/architect/dataModel";
import type { ApiDesignRow } from "@/lib/architect/apiDesign";
import type { DependencyDesignView } from "@/lib/architect/dependencyDesign";
import { architectWorkspaceAdvisoryNote } from "@/lib/architect/architectWorkspace";
import type { ArchitectureReviewStateId } from "@/lib/architect/architectWorkspace";
import { specificationIdFromMission } from "@/lib/architect/architectWorkspace";

export interface MissionIntakeView {
  missionName: string;
  objective: string;
  scopeSummary: string;
  successCriteria: string[];
  assumptions: string[];
  risks: string[];
  dependencies: string[];
  missionId: string;
}

export interface ArchitectMissionRow {
  missionId: string;
  missionName: string;
  specificationId: string;
  reviewStatus: string;
  openQuestions: number;
  updatedAt: string;
}

export interface ArchitectureOverviewSummary {
  technicalSpecs: number;
  reviewCandidates: number;
  designReady: number;
  openQuestions: number;
  advisoryNote: string;
}

export interface ArchitectHandoffContextItem {
  missionId: string;
  missionName: string;
  objective: string;
  handoffReadiness: string;
  architectHref: string;
}

function isArchitectEligible(missions: Mission[], tasks: Task[], missionId: string): boolean {
  const brief = buildDirectorEligibleBriefs(missions).find((b) => b.missionId === missionId);
  if (!brief) return false;
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return false;
  const directorCtx = buildDirectorMissionContext({
    mission,
    brief,
    missions,
    tasks,
  });
  return directorCtx.architectHandoff.status !== "not_ready";
}

export function buildArchitectEligibleMissionIds(missions: Mission[], tasks: Task[]): string[] {
  return buildDirectorEligibleBriefs(missions)
    .map((b) => b.missionId)
    .filter((id): id is string => !!id && isArchitectEligible(missions, tasks, id));
}

export function buildMissionIntake(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): MissionIntakeView | null {
  const brief = buildDirectorEligibleBriefs(input.missions).find(
    (b) => b.missionId === input.mission.id
  );
  if (!brief) return null;
  const directorCtx = buildDirectorMissionContext({
    mission: input.mission,
    brief,
    missions: input.missions,
    tasks: input.tasks,
  });
  const plan = directorCtx.missionPlan;
  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    objective: plan.objective,
    scopeSummary: plan.scopeSummary,
    successCriteria: plan.successCriteria,
    assumptions: plan.assumptions,
    risks: plan.risks,
    dependencies: plan.dependencies,
  };
}

export interface ArchitectMissionContext {
  mission: Mission;
  intake: MissionIntakeView;
  specification: TechnicalSpecificationRecord;
  systemDesign: SystemDesignArea[];
  components: ComponentDesignRow[];
  dataModel: DataModelEntity[];
  apiDesign: ApiDesignRow[];
  dependencyDesign: DependencyDesignView;
  architectureReview: ArchitectureReviewContext;
}

export function buildArchitectMissionContext(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}): ArchitectMissionContext | null {
  const intake = buildMissionIntake(input);
  if (!intake) return null;

  const brief = buildDirectorEligibleBriefs(input.missions).find(
    (b) => b.missionId === input.mission.id
  );
  if (!brief) return null;

  const directorCtx = buildDirectorMissionContext({
    mission: input.mission,
    brief,
    missions: input.missions,
    tasks: input.tasks,
  });

  const specification = buildTechnicalSpecificationRecord({
    mission: input.mission,
    missionPlan: directorCtx.missionPlan,
  });
  const systemDesign = buildSystemDesign(input.mission);
  const components = buildComponentDesign(input.mission);
  const dataModel = buildDataModel();
  const apiDesign = buildApiDesign(input.mission.id);
  const dependencyDesign = buildDependencyDesign({
    mission: input.mission,
    missionPlan: directorCtx.missionPlan,
  });
  const architectureReview = buildArchitectureReviewContext({
    objective: intake.objective,
    specification,
    systemDesign,
    components,
    dataModel,
    apiDesign,
    dependencyDesign,
  });

  return {
    mission: input.mission,
    intake,
    specification,
    systemDesign,
    components,
    dataModel,
    apiDesign,
    dependencyDesign,
    architectureReview,
  };
}

export function buildArchitectureOverview(
  missions: Mission[],
  tasks: Task[]
): ArchitectureOverviewSummary {
  const ids = buildArchitectEligibleMissionIds(missions, tasks);
  let reviewCandidates = 0;
  let designReady = 0;
  let openQuestions = 0;

  ids.forEach((missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;
    const ctx = buildArchitectMissionContext({ mission, missions, tasks });
    if (!ctx) return;
    openQuestions += ctx.specification.openQuestions.length;
    if (ctx.architectureReview.status === "review_candidate") reviewCandidates += 1;
    if (ctx.architectureReview.status === "ready_for_design_review") designReady += 1;
  });

  return {
    technicalSpecs: ids.length,
    reviewCandidates,
    designReady,
    openQuestions,
    advisoryNote: architectWorkspaceAdvisoryNote,
  };
}

export function buildArchitectMissionRows(
  missions: Mission[],
  tasks: Task[]
): ArchitectMissionRow[] {
  return buildArchitectEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildArchitectMissionContext({ mission, missions, tasks });
      if (!ctx) return null;
      return {
        missionId,
        missionName: mission.name,
        specificationId: specificationIdFromMission(missionId),
        reviewStatus: ctx.architectureReview.statusLabel,
        openQuestions: ctx.specification.openQuestions.length,
        updatedAt: mission.updatedAt,
      };
    })
    .filter((r): r is ArchitectMissionRow => r !== null);
}

export function buildArchitectHandoffContextItems(
  missions: Mission[],
  tasks: Task[]
): ArchitectHandoffContextItem[] {
  return buildArchitectEligibleMissionIds(missions, tasks)
    .map((missionId) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return null;
      const ctx = buildArchitectMissionContext({ mission, missions, tasks });
      if (!ctx) return null;
      const directorBrief = buildDirectorEligibleBriefs(missions).find(
        (b) => b.missionId === missionId
      );
      if (!directorBrief) return null;
      const directorCtx = buildDirectorMissionContext({
        mission,
        brief: directorBrief,
        missions,
        tasks,
      });
      if (
        directorCtx.architectHandoff.status !== "handoff_candidate" &&
        directorCtx.architectHandoff.status !== "ready_for_architect_review"
      ) {
        return null;
      }
      return {
        missionId,
        missionName: mission.name,
        objective: ctx.intake.objective,
        handoffReadiness: directorCtx.architectHandoff.statusLabel,
        architectHref: `/architect-workspace?mission=${missionId}`,
      };
    })
    .filter((item): item is ArchitectHandoffContextItem => item !== null);
}

export function buildArchitectWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  specificationId?: string | null;
  reviewStateFilter?: ArchitectureReviewStateId | null;
}) {
  let rows = buildArchitectMissionRows(input.missions, input.tasks);

  if (input.reviewStateFilter) {
    rows = rows.filter((r) => {
      const mission = input.missions.find((m) => m.id === r.missionId);
      if (!mission) return false;
      const ctx = buildArchitectMissionContext({
        mission,
        missions: input.missions,
        tasks: input.tasks,
      });
      return ctx?.architectureReview.status === input.reviewStateFilter;
    });
  }

  if (input.missionId) {
    rows = rows.filter((r) => r.missionId === input.missionId);
  }

  const selectedMissionId =
    input.missionId ??
    (input.specificationId
      ? rows.find((r) => r.specificationId === input.specificationId)?.missionId
      : rows[0]?.missionId) ??
    null;

  const selectedMission = selectedMissionId
    ? input.missions.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const context =
    selectedMission != null
      ? buildArchitectMissionContext({
          mission: selectedMission,
          missions: input.missions,
          tasks: input.tasks,
        })
      : null;

  return {
    rows,
    eligibleCount: buildArchitectEligibleMissionIds(input.missions, input.tasks).length,
    selectedMission,
    context,
    overview: buildArchitectureOverview(input.missions, input.tasks),
    handoffContextItems: buildArchitectHandoffContextItems(input.missions, input.tasks),
    advisoryNote: architectWorkspaceAdvisoryNote,
    progressNote: context
      ? context.architectureReview.recommendation
      : rows.length === 0
        ? "No Director handoff context available—complete Director planning first."
        : "Select a mission to view architecture design support.",
  };
}
