import type { Mission, Task } from "@/types/productai";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import { buildProductBriefRecords } from "@/lib/brief/productBriefAnalysis";
import { buildProductBriefReviewContext } from "@/lib/brief/productBriefReview";
import { buildMissionPlanRecord, type MissionPlanRecord } from "@/lib/director/missionPlan";
import { buildDeliveryPlan, type DeliveryPlanView } from "@/lib/director/deliveryPlan";
import { buildTaskBreakdown, type TaskBreakdownRow } from "@/lib/director/taskBreakdown";
import { buildReviewSchedule, type ReviewScheduleItem } from "@/lib/director/reviewSchedule";
import { buildDependencyMap, type DependencyMapCard } from "@/lib/director/dependencyMap";
import {
  buildArchitectHandoffContext,
  type ArchitectHandoffContext,
} from "@/lib/director/architectHandoff";
import { directorWorkspaceAdvisoryNote } from "@/lib/director/directorWorkspace";
import type { DirectorReviewScheduleState } from "@/lib/director/directorWorkspace";

export interface ProductBriefIntakeView {
  briefTitle: string;
  status: string;
  plannerNotes: string[];
  openQuestions: string[];
  approvalStatus: string;
  approvedAt: string | null;
  briefId: string;
  missionId: string | null;
}

export interface DirectorPlanningMission {
  missionId: string;
  briefId: string;
  title: string;
  missionName: string;
  briefStatus: string;
  architectReadiness: string;
  updatedAt: string;
}

export interface DirectorPlanningOverview {
  activeMissionPlans: number;
  planningReviews: number;
  handoffCandidates: number;
  architectReady: number;
  advisoryNote: string;
}

export interface ArchitectHandoffCandidate {
  missionId: string;
  missionName: string;
  objective: string;
  scope: string;
  handoffReadiness: string;
  directorHref: string;
}

function isDirectorEligibleBrief(brief: ProductBriefRecord): boolean {
  return (
    brief.status === "approved" ||
    brief.status === "director_handoff_ready" ||
    brief.handoffReady
  );
}

export function buildDirectorEligibleBriefs(missions: Mission[]): ProductBriefRecord[] {
  return buildProductBriefRecords(missions).filter(isDirectorEligibleBrief);
}

export function buildProductBriefIntake(input: {
  brief: ProductBriefRecord;
  missions: Mission[];
}): ProductBriefIntakeView {
  const review = buildProductBriefReviewContext({ brief: input.brief, missions: input.missions });
  return {
    briefTitle: input.brief.title,
    status: input.brief.statusLabel,
    plannerNotes: input.brief.plannerNotes,
    openQuestions: review.openQuestions,
    approvalStatus: input.brief.approvalStateLabel,
    approvedAt: input.brief.approvedAt,
    briefId: input.brief.briefId,
    missionId: input.brief.missionId,
  };
}

export function buildDirectorPlanningOverview(
  missions: Mission[],
  tasks: Task[]
): DirectorPlanningOverview {
  const eligible = buildDirectorEligibleBriefs(missions);
  let handoffCandidates = 0;
  let architectReady = 0;
  let planningReviews = 0;

  eligible.forEach((brief) => {
    const mission = missions.find((m) => m.id === brief.missionId);
    if (!mission) return;
    const ctx = buildDirectorMissionContext({ mission, brief, missions, tasks });
    if (ctx.architectHandoff.status === "handoff_candidate") handoffCandidates += 1;
    if (ctx.architectHandoff.status === "ready_for_architect_review") architectReady += 1;
    planningReviews += ctx.reviewSchedule.filter(
      (r) => r.state === "scheduled" || r.state === "planned"
    ).length;
  });

  return {
    activeMissionPlans: eligible.length,
    planningReviews,
    handoffCandidates,
    architectReady,
    advisoryNote: directorWorkspaceAdvisoryNote,
  };
}

export function buildDirectorPlanningMissions(
  missions: Mission[],
  tasks: Task[]
): DirectorPlanningMission[] {
  return buildDirectorEligibleBriefs(missions)
    .map((brief) => {
      const mission = missions.find((m) => m.id === brief.missionId);
      if (!mission) return null;
      const ctx = buildDirectorMissionContext({ mission, brief, missions, tasks });
      return {
        missionId: mission.id,
        briefId: brief.briefId,
        title: brief.title,
        missionName: mission.name,
        briefStatus: brief.statusLabel,
        architectReadiness: ctx.architectHandoff.statusLabel,
        updatedAt: mission.updatedAt,
      };
    })
    .filter((r): r is DirectorPlanningMission => r !== null);
}

export function buildArchitectHandoffCandidates(
  missions: Mission[],
  tasks: Task[]
): ArchitectHandoffCandidate[] {
  return buildDirectorEligibleBriefs(missions)
    .map((brief) => {
      const mission = missions.find((m) => m.id === brief.missionId);
      if (!mission) return null;
      const ctx = buildDirectorMissionContext({ mission, brief, missions, tasks });
      if (
        ctx.architectHandoff.status !== "handoff_candidate" &&
        ctx.architectHandoff.status !== "ready_for_architect_review"
      ) {
        return null;
      }
      return {
        missionId: mission.id,
        missionName: mission.name,
        objective: ctx.missionPlan?.objective ?? mission.summary,
        scope: ctx.missionPlan?.scopeSummary ?? mission.description,
        handoffReadiness: ctx.architectHandoff.statusLabel,
        directorHref: `/director-workspace?mission=${mission.id}&brief=${brief.briefId}`,
      };
    })
    .filter((c): c is ArchitectHandoffCandidate => c !== null);
}

export interface DirectorMissionContext {
  brief: ProductBriefRecord;
  mission: Mission;
  intake: ProductBriefIntakeView;
  missionPlan: MissionPlanRecord;
  deliveryPlan: DeliveryPlanView;
  taskBreakdown: TaskBreakdownRow[];
  reviewSchedule: ReviewScheduleItem[];
  dependencyMap: DependencyMapCard[];
  architectHandoff: ArchitectHandoffContext;
}

export function buildDirectorMissionContext(input: {
  mission: Mission;
  brief: ProductBriefRecord;
  missions: Mission[];
  tasks: Task[];
}): DirectorMissionContext {
  const missionPlan = buildMissionPlanRecord({
    mission: input.mission,
    brief: input.brief,
  });
  const deliveryPlan = buildDeliveryPlan(input.mission);
  const taskBreakdown = buildTaskBreakdown({
    mission: input.mission,
    tasks: input.tasks,
  });
  const reviewSchedule = buildReviewSchedule(input.mission);
  const architectHandoff = buildArchitectHandoffContext({
    brief: input.brief,
    missionPlan,
    deliveryPlan,
    taskBreakdown,
    reviewSchedule,
  });

  return {
    brief: input.brief,
    mission: input.mission,
    intake: buildProductBriefIntake({
      brief: input.brief,
      missions: input.missions,
    }),
    missionPlan,
    deliveryPlan,
    taskBreakdown,
    reviewSchedule,
    dependencyMap: buildDependencyMap({
      mission: input.mission,
      brief: input.brief,
      allMissions: input.missions,
    }),
    architectHandoff,
  };
}

export function buildDirectorWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  briefId?: string | null;
  missionId?: string | null;
  reviewStateFilter?: DirectorReviewScheduleState | null;
}) {
  const eligible = buildDirectorEligibleBriefs(input.missions);
  let filteredEligible = eligible;

  if (input.missionId) {
    filteredEligible = eligible.filter((b) => b.missionId === input.missionId);
  }

  let missionsList = buildDirectorPlanningMissions(input.missions, input.tasks);

  if (input.missionId) {
    missionsList = missionsList.filter((m) => m.missionId === input.missionId);
  }

  const selectedBrief =
    (input.briefId
      ? filteredEligible.find((b) => b.briefId === input.briefId) ??
        eligible.find((b) => b.briefId === input.briefId)
      : input.missionId
        ? filteredEligible.find((b) => b.missionId === input.missionId)
        : filteredEligible[0] ?? eligible[0]) ?? null;

  const selectedMission =
    selectedBrief?.missionId != null
      ? input.missions.find((m) => m.id === selectedBrief.missionId) ?? null
      : null;

  let context: DirectorMissionContext | null = null;
  if (selectedBrief && selectedMission) {
    context = buildDirectorMissionContext({
      mission: selectedMission,
      brief: selectedBrief,
      missions: input.missions,
      tasks: input.tasks,
    });
    if (input.reviewStateFilter && context) {
      context = {
        ...context,
        reviewSchedule: context.reviewSchedule.filter(
          (r) => r.state === input.reviewStateFilter
        ),
      };
    }
  }

  return {
    eligibleBriefs: eligible,
    missionsList,
    selectedBrief,
    selectedMission,
    context,
    overview: buildDirectorPlanningOverview(input.missions, input.tasks),
    architectCandidates: buildArchitectHandoffCandidates(input.missions, input.tasks),
    advisoryNote: directorWorkspaceAdvisoryNote,
    progressNote: context
      ? context.architectHandoff.recommendation
      : eligible.length === 0
        ? "No approved Product Briefs available for Director planning yet."
        : "Select an approved brief to view mission planning.",
  };
}
