import type { Mission } from "@/types/productai";
import {
  buildHandoffArtifactsForMission,
  buildMissionHandoffContext,
} from "@/lib/handoff/handoffAnalysis";
import {
  handoffRoleIndex,
  inferHandoffRoleFromWorkflow,
} from "@/lib/handoff/handoffWorkflow";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import { inferProductLifecycleStage } from "@/lib/lifecycle/lifecycleAnalysis";
import type { ReleaseItem, Task } from "@/types/productai";
import type {
  AiWorkerDefinition,
  AiWorkerId,
  AiWorkerRunStatus,
  ProjectStageLabel,
} from "@/lib/agent-first/aiWorkers";
import { aiWorkerDefinitions, projectStageLabels } from "@/lib/agent-first/aiWorkers";
import { workspaceHrefForRole } from "@/lib/ceo-command/ceoCommandCenterWorkspace";

export interface AiWorkerExplainability {
  workSummary: string;
  inputSummary: string;
  outputSummary: string;
  whyReasons: string[];
}

export interface AiWorkerMissionStatus {
  worker: AiWorkerDefinition;
  status: AiWorkerRunStatus;
  statusLabel: string;
  explainability: AiWorkerExplainability;
  workspaceHref: string;
}

export interface ProjectDashboardCard {
  missionId: string;
  missionName: string;
  currentStage: ProjectStageLabel;
  completionPercent: number;
  stageProgress: Array<{ label: ProjectStageLabel; state: "done" | "current" | "upcoming" }>;
  workerSummary: string;
  latestReview: string;
  latestArtifact: string;
  activeWorkerTitle: string;
}

const lifecycleToProjectStage: Record<string, ProjectStageLabel> = {
  idea: "Planning",
  planning: "Planning",
  direction: "Planning",
  architecture: "Architecture",
  design: "Design",
  development: "Development",
  qa: "QA",
  release: "Release",
  outcome: "Release",
};

function inferWorkerStatus(
  workerRoleIndex: number,
  currentRoleIndex: number,
  mission: Mission
): AiWorkerRunStatus {
  if (workerRoleIndex < currentRoleIndex) return "completed";
  if (workerRoleIndex > currentRoleIndex + 1) return "not_started";
  if (workerRoleIndex === currentRoleIndex + 1) return "waiting";
  if (workerRoleIndex === currentRoleIndex) {
    if (mission.status === "completed") return "completed";
    if (mission.progress >= 55) return "in_progress";
    return "in_progress";
  }
  return "not_started";
}

function buildWhyReasons(workerId: AiWorkerId, mission: Mission): string[] {
  switch (workerId) {
    case "product_planner":
      return [
        mission.requirementsSummary
          ? `Problem framing: ${mission.requirementsSummary.slice(0, 140)}${mission.requirementsSummary.length > 140 ? "…" : ""}`
          : "Scope and user problem captured from the CEO request.",
        "MVP boundaries documented before technical design begins.",
      ];
    case "architect":
      return [
        mission.architectureSummary
          ? `Technical direction: ${mission.architectureSummary.slice(0, 140)}${mission.architectureSummary.length > 140 ? "…" : ""}`
          : "System boundaries derived from the approved Product Brief.",
        "Dependencies and integration points recorded for downstream design and build.",
      ];
    case "designer":
      return [
        "UX flows aligned to the technical specification—no auto-generated UI deployment.",
        mission.relatedPullRequests.length > 0
          ? `${mission.relatedPullRequests.length} related PR(s) inform design constraints.`
          : "Component and flow proposals prepared for human review.",
      ];
    case "developer":
      return [
        `Implementation plan covers ${mission.taskIds.length} linked task(s).`,
        mission.relatedBranches.length > 0
          ? `Repository context: ${mission.relatedBranches.length} branch(es) under observation.`
          : "Build plan prepared for QA validation—no autonomous coding.",
      ];
    case "qa_reviewer":
      return [
        mission.releaseReadiness.summary
          ? `Release readiness note: ${mission.releaseReadiness.summary.slice(0, 120)}`
          : "Test and validation checklist derived from the implementation plan.",
        "Human approval required before release execution.",
      ];
  }
}

function buildExplainability(
  worker: AiWorkerDefinition,
  mission: Mission,
  artifacts: ReturnType<typeof buildHandoffArtifactsForMission>
): AiWorkerExplainability {
  const primary = artifacts.find((a) => a.role === worker.handoffRole && a.isPrimary);
  const inputFrom = artifacts.find(
    (a) =>
      a.isPrimary &&
      a.role !== worker.handoffRole &&
      handoffRoleIndex(a.role) === handoffRoleIndex(worker.handoffRole) - 1
  );

  return {
    workSummary: primary
      ? `${worker.title} produced ${primary.title} (${primary.statusLabel}).`
      : `${worker.title} is queued for this mission.`,
    inputSummary: inputFrom
      ? `${worker.inputLabel}: ${inputFrom.summary}`
      : worker.id === "product_planner"
        ? `${worker.inputLabel}: ${mission.requirementsSummary.slice(0, 160) || mission.description}`
        : `${worker.inputLabel}: awaiting upstream artifact.`,
    outputSummary: primary
      ? `${worker.outputLabel}: ${primary.summary}`
      : `${worker.outputLabel}: not yet published.`,
    whyReasons: buildWhyReasons(worker.id, mission),
  };
}

export function buildAiWorkerStatusesForMission(mission: Mission): AiWorkerMissionStatus[] {
  const currentRole = inferHandoffRoleFromWorkflow(inferMissionWorkflowStage(mission));
  const currentRoleIndex = handoffRoleIndex(currentRole);
  const artifacts = buildHandoffArtifactsForMission(mission);

  return aiWorkerDefinitions.map((worker) => {
    const workerRoleIndex = handoffRoleIndex(worker.handoffRole);
    const status = inferWorkerStatus(workerRoleIndex, currentRoleIndex, mission);
    return {
      worker,
      status,
      statusLabel:
        status === "completed"
          ? "完了"
          : status === "in_progress"
            ? "作業中"
            : status === "waiting"
              ? "待機中"
              : "未着手",
      explainability: buildExplainability(worker, mission, artifacts),
      workspaceHref: workspaceHrefForRole(worker.handoffRole, mission.id),
    };
  });
}

export function buildProjectDashboardCard(input: {
  mission: Mission;
  tasks: Task[];
  releases: ReleaseItem[];
}): ProjectDashboardCard {
  const lifecycleStage = inferProductLifecycleStage({
    mission: input.mission,
    releases: input.releases,
    signalCount: 0,
  });
  const currentStage = lifecycleToProjectStage[lifecycleStage] ?? "Planning";
  const stageIndex = projectStageLabels.indexOf(currentStage);
  const completionPercent = Math.min(100, Math.max(0, input.mission.progress));

  const stageProgress = projectStageLabels.map((label, index) => ({
    label,
    state:
      index < stageIndex
        ? ("done" as const)
        : index === stageIndex
          ? ("current" as const)
          : ("upcoming" as const),
  }));

  const workers = buildAiWorkerStatusesForMission(input.mission);
  const active = workers.find((w) => w.status === "in_progress") ?? workers.find((w) => w.status === "waiting");
  const artifacts = buildHandoffArtifactsForMission(input.mission);
  const latestReview = artifacts.find((a) => a.status === "ready_for_review");
  const latestArtifact = artifacts.find((a) => a.isPrimary && a.role === active?.worker.handoffRole) ?? artifacts.find((a) => a.isPrimary);

  const handoffContext = buildMissionHandoffContext({ mission: input.mission, tasks: input.tasks });

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentStage,
    completionPercent,
    stageProgress,
    workerSummary: active
      ? `${active.worker.emoji} ${active.worker.title} — ${active.statusLabel}`
      : "All AI workers idle or complete",
    latestReview: latestReview
      ? `${latestReview.title} (${latestReview.statusLabel})`
      : "No review pending",
    latestArtifact: latestArtifact
      ? `${latestArtifact.title}: ${latestArtifact.summary.slice(0, 80)}`
      : handoffContext.currentArtifact,
    activeWorkerTitle: active?.worker.title ?? "—",
  };
}

export function buildProjectDashboardCards(input: {
  missions: Mission[];
  tasks: Task[];
  releases: ReleaseItem[];
}): ProjectDashboardCard[] {
  return input.missions
    .filter((m) => m.status === "active" || m.status === "planning")
    .map((mission) =>
      buildProjectDashboardCard({
        mission,
        tasks: input.tasks,
        releases: input.releases,
      })
    );
}
