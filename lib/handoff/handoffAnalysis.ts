import type { Mission, Task } from "@/types/productai";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import {
  handoffFlowSteps,
  handoffRoleIndex,
  handoffRoleLabel,
  inferHandoffRoleFromWorkflow,
  nextHandoffRole,
} from "@/lib/handoff/handoffWorkflow";
import type { HandoffArtifact, HandoffArtifactTypeId } from "@/lib/handoff/handoffArtifacts";
import {
  artifactTypeLabel,
  getArtifactsForRole,
  getPrimaryArtifactTypeForRole,
} from "@/lib/handoff/handoffArtifacts";
import type { HandoffStatusId } from "@/lib/handoff/handoffStatus";
import { handoffStatusLabel, handoffStatusNote } from "@/lib/handoff/handoffStatus";

export interface HandoffOverviewSummary {
  activeArtifacts: number;
  pendingReviews: number;
  completedHandoffs: number;
  returnedArtifacts: number;
  currentWorkflowPosition: string;
  advisoryNote: string;
}

export interface HandoffTimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  detail: string;
}

export interface MissionHandoffContext {
  missionId: string;
  missionName: string;
  currentRole: HandoffRoleId;
  currentRoleLabel: string;
  currentArtifact: string;
  currentArtifactStatus: HandoffStatusId;
  nextHandoffRole: HandoffRoleId | null;
  nextHandoffRoleLabel: string | null;
  progressNote: string;
  timeline: HandoffTimelineStep[];
  artifacts: HandoffArtifact[];
}

export interface CooHandoffCoordination {
  roleQueue: Array<{ role: HandoffRoleId; roleLabel: string; missionCount: number }>;
  reviewConcentration: number;
  pendingHandoffs: number;
  advisoryNote: string;
}

function inferArtifactStatus(input: {
  roleIndex: number;
  currentRoleIndex: number;
  missionProgress: number;
  isPrimary: boolean;
  missionStatus: Mission["status"];
}): HandoffStatusId {
  const { roleIndex, currentRoleIndex, missionProgress, isPrimary, missionStatus } = input;

  if (roleIndex < currentRoleIndex) {
    return missionStatus === "completed" ? "archived" : "handed_off";
  }
  if (roleIndex > currentRoleIndex) {
    return "draft";
  }

  if (!isPrimary) {
    if (missionProgress >= 85) return "handed_off";
    if (missionProgress >= 70) return "approved";
    return "draft";
  }

  if (missionProgress >= 90) return "ready_for_review";
  if (missionProgress >= 75) return "approved";
  if (missionProgress >= 55) return "ready_for_review";
  if (missionProgress >= 35) return "draft";
  return "draft";
}

function buildArtifactSummary(mission: Mission, typeId: HandoffArtifactTypeId): string {
  const title = artifactTypeLabel(typeId);
  switch (typeId) {
    case "product_brief":
    case "user_problem_statement":
      return mission.requirementsSummary.slice(0, 120) + (mission.requirementsSummary.length > 120 ? "…" : "");
    case "technical_specification":
    case "system_design":
    case "architecture_notes":
      return mission.architectureSummary.slice(0, 120) + (mission.architectureSummary.length > 120 ? "…" : "");
    case "task_breakdown":
      return `${mission.taskIds.length} task(s) linked to this mission.`;
    case "release_checklist":
    case "validation_summary":
      return mission.releaseReadiness.summary;
    case "repository_context":
      return `${mission.relatedBranches.length} branch(es), ${mission.relatedPullRequests.length} PR(s).`;
    default:
      return `${title} context for ${mission.name}.`;
  }
}

export function buildHandoffArtifactsForMission(mission: Mission): HandoffArtifact[] {
  const stageId = inferMissionWorkflowStage(mission);
  const currentRole = inferHandoffRoleFromWorkflow(stageId);
  const currentRoleIndex = handoffRoleIndex(currentRole);
  const artifacts: HandoffArtifact[] = [];

  for (const step of handoffFlowSteps) {
    const roleIndex = handoffRoleIndex(step.id);
    if (roleIndex > currentRoleIndex && mission.status !== "completed") continue;

    const defs = getArtifactsForRole(step.id);
    for (const def of defs) {
      const isPrimary = def.id === getPrimaryArtifactTypeForRole(step.id);
      const status = inferArtifactStatus({
        roleIndex,
        currentRoleIndex,
        missionProgress: mission.progress,
        isPrimary,
        missionStatus: mission.status,
      });

      artifacts.push({
        id: `${mission.id}-${def.id}`,
        missionId: mission.id,
        missionName: mission.name,
        typeId: def.id,
        title: def.title,
        role: step.id,
        roleLabel: handoffRoleLabel(step.id),
        status,
        statusLabel: handoffStatusLabel(status),
        summary: buildArtifactSummary(mission, def.id),
        updatedAt: mission.updatedAt,
        isPrimary,
      });
    }
  }

  return artifacts;
}

export function buildHandoffArtifacts(input: {
  missions: Mission[];
  roleFilter?: HandoffRoleId | null;
  missionId?: string | null;
}): HandoffArtifact[] {
  const filtered = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;

  return filtered
    .flatMap((mission) => buildHandoffArtifactsForMission(mission))
    .filter((a) => !input.roleFilter || a.role === input.roleFilter);
}

export function buildHandoffStatusBoard(artifacts: HandoffArtifact[]) {
  const statuses: HandoffStatusId[] = [
    "draft",
    "ready_for_review",
    "approved",
    "returned",
    "handed_off",
    "archived",
  ];

  return statuses.map((status) => ({
    status,
    title: handoffStatusLabel(status),
    artifacts: artifacts.filter((a) => a.status === status),
  }));
}

export function buildHandoffTimeline(input: {
  mission: Mission;
  artifacts: HandoffArtifact[];
}): HandoffTimelineStep[] {
  const primary = input.artifacts.find((a) => a.isPrimary && a.missionId === input.mission.id);
  const status = primary?.status ?? "draft";

  const steps: Array<{ id: string; label: string; gate: HandoffStatusId[] }> = [
    { id: "created", label: "Artifact Created", gate: ["draft", "ready_for_review", "approved", "returned", "handed_off", "archived"] },
    { id: "review", label: "Review Requested", gate: ["ready_for_review", "approved", "returned", "handed_off", "archived"] },
    { id: "approved", label: "Approved", gate: ["approved", "handed_off", "archived"] },
    { id: "handed_off", label: "Handed Off", gate: ["handed_off", "archived"] },
    { id: "next_role", label: "Next Role Started", gate: ["handed_off", "archived"] },
  ];

  const statusOrder: HandoffStatusId[] = [
    "draft",
    "ready_for_review",
    "approved",
    "returned",
    "handed_off",
    "archived",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => {
    const stepIndex =
      step.id === "created"
        ? 0
        : step.id === "review"
          ? 1
          : step.id === "approved"
            ? 2
            : step.id === "handed_off"
              ? 3
              : 4;

    let detail = "Upcoming in the handoff timeline.";
    if (index <= currentIndex || step.gate.includes(status)) {
      detail =
        index === 0
          ? primary
            ? `${primary.title} created for ${input.mission.name}.`
            : "Artifact creation pending."
          : index === 1 && primary
            ? handoffStatusNote(primary.title, status === "returned" ? "returned" : "ready_for_review")
            : index === 2 && primary
              ? handoffStatusNote(primary.title, "approved")
              : index === 3 && primary
                ? handoffStatusNote(primary.title, "handed_off")
                : index === 4
                  ? `Next role may begin receiving context from ${primary?.title ?? "artifact"}.`
                  : detail;
    }

    return {
      id: step.id,
      label: step.label,
      status:
        stepIndex < currentIndex
          ? ("completed" as const)
          : stepIndex === currentIndex
            ? ("current" as const)
            : ("upcoming" as const),
      detail,
    };
  });
}

export function buildHandoffOverviewSummary(input: {
  missions: Mission[];
}): HandoffOverviewSummary {
  const allArtifacts = input.missions.flatMap((m) => buildHandoffArtifactsForMission(m));
  const active = allArtifacts.filter(
    (a) => a.status === "draft" || a.status === "ready_for_review" || a.status === "approved"
  );
  const pendingReviews = allArtifacts.filter((a) => a.status === "ready_for_review").length;
  const completed = allArtifacts.filter((a) => a.status === "handed_off" || a.status === "archived").length;
  const returned = allArtifacts.filter((a) => a.status === "returned").length;

  const roleCounts = new Map<HandoffRoleId, number>();
  for (const mission of input.missions.filter((m) => m.status === "active" || m.status === "planning")) {
    const role = inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(mission));
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  const topRole = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const position = topRole
    ? `${handoffRoleLabel(topRole[0])} (${topRole[1]} mission(s))`
    : "No active missions";

  return {
    activeArtifacts: active.length,
    pendingReviews,
    completedHandoffs: completed,
    returnedArtifacts: returned,
    currentWorkflowPosition: position,
    advisoryNote:
      "AI team handoff workflow integrates mission context for executive reading—no automatic approval or delegation.",
  };
}

export function buildCeoHandoffSummary(input: { missions: Mission[] }) {
  const overview = buildHandoffOverviewSummary(input);
  const roleCounts = new Map<HandoffRoleId, number>();
  for (const mission of input.missions.filter((m) => m.status === "active" || m.status === "planning")) {
    const role = inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(mission));
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  const topRole = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const allArtifacts = input.missions.flatMap((m) => buildHandoffArtifactsForMission(m));

  return {
    currentRole: topRole ? handoffRoleLabel(topRole[0]) : "—",
    pendingReviews: overview.pendingReviews,
    waitingHandoffs: allArtifacts.filter((a) => a.status === "approved").length,
    completedHandoffs: overview.completedHandoffs,
    advisoryNote: overview.advisoryNote,
  };
}

export function buildCooHandoffCoordination(input: { missions: Mission[] }): CooHandoffCoordination {
  const roleQueue = handoffFlowSteps
    .filter((s) => s.id !== "ceo" && s.id !== "release")
    .map((step) => ({
      role: step.id,
      roleLabel: step.title,
      missionCount: input.missions.filter((m) => {
        if (m.status !== "active" && m.status !== "planning") return false;
        return inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(m)) === step.id;
      }).length,
    }))
    .filter((r) => r.missionCount > 0);

  const allArtifacts = input.missions.flatMap((m) => buildHandoffArtifactsForMission(m));
  const reviewConcentration = allArtifacts.filter((a) => a.status === "ready_for_review").length;
  const pendingHandoffs = allArtifacts.filter(
    (a) => a.status === "approved" || a.status === "ready_for_review"
  ).length;

  return {
    roleQueue,
    reviewConcentration,
    pendingHandoffs,
    advisoryNote:
      "Workflow coordination shows role queue and review concentration—COO reads alignment, not automatic delegation.",
  };
}

export function buildMissionHandoffContext(input: {
  mission: Mission;
  tasks: Task[];
}): MissionHandoffContext {
  const artifacts = buildHandoffArtifactsForMission(input.mission);
  const stageId = inferMissionWorkflowStage(input.mission);
  const currentRole = inferHandoffRoleFromWorkflow(stageId);
  const primary = artifacts.find((a) => a.isPrimary && a.role === currentRole);
  const nextRole = nextHandoffRole(currentRole);

  let progressNote = `The ${primary?.title ?? "artifact"} is ready for review.`;
  if (primary?.status === "handed_off") {
    progressNote = `The ${primary.title} has been handed off to the ${nextRole ? handoffRoleLabel(nextRole) : "next"} stage.`;
  } else if (primary?.status === "draft") {
    progressNote = `The ${primary?.title ?? "artifact"} is in draft within the ${handoffRoleLabel(currentRole)} stage.`;
  } else if (primary?.status === "ready_for_review") {
    progressNote = `The ${primary.title} is ready for review.`;
  } else if (currentRole === "qa_reviewer") {
    progressNote = "The QA Review is awaiting validation.";
  }

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentRole,
    currentRoleLabel: handoffRoleLabel(currentRole),
    currentArtifact: primary?.title ?? artifactTypeLabel(getPrimaryArtifactTypeForRole(currentRole)),
    currentArtifactStatus: primary?.status ?? "draft",
    nextHandoffRole: nextRole,
    nextHandoffRoleLabel: nextRole ? handoffRoleLabel(nextRole) : null,
    progressNote,
    timeline: buildHandoffTimeline({ mission: input.mission, artifacts }),
    artifacts,
  };
}

export function buildHandoffFlowView(input: { missions: Mission[] }) {
  return handoffFlowSteps.map((step) => {
    const missionsAtRole = input.missions.filter((m) => {
      if (m.status === "completed" && step.id === "release") return true;
      if (m.status !== "active" && m.status !== "planning") return false;
      return inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(m)) === step.id;
    });

    const artifacts = missionsAtRole.flatMap((m) =>
      buildHandoffArtifactsForMission(m).filter((a) => a.role === step.id && a.isPrimary)
    );

    return {
      role: step.id,
      title: step.title,
      description: step.description,
      missionCount: missionsAtRole.length,
      primaryArtifacts: artifacts,
      receivesFrom: step.receivesFrom,
      handsOffTo: step.handsOffTo,
    };
  });
}
