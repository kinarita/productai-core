import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import { buildArtifactLineageRecord } from "@/lib/lineage/artifactLineageRecord";
import {
  buildLineageChain,
  findChainNode,
  inferCurrentChainStep,
  type LineageArtifactStepId,
  type LineageChainNode,
} from "@/lib/lineage/artifactChain";
import { buildArtifactInspector } from "@/lib/lineage/artifactInspector";
import { buildDependencyContext } from "@/lib/lineage/dependencyContext";
import { buildReviewTraceability } from "@/lib/lineage/reviewTraceability";
import { buildTeamOwnershipRows } from "@/lib/lineage/teamOwnership";
import { artifactLineageAdvisoryNote } from "@/lib/lineage/artifactLineageWorkspace";
import { displayNameForStep, ownerRoleForStep } from "@/lib/lineage/teamOwnership";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import { missionWorkflowStages } from "@/lib/mission-team/missionWorkflow";
import { buildArtifactReviewRecords } from "@/lib/review/reviewAnalysis";

export interface LineageOverviewSummary {
  activeLineages: number;
  completeLineages: number;
  incompleteLineages: number;
  reviewConcentrations: number;
  advisoryNote: string;
}

export interface LineageMissionRow {
  missionId: string;
  missionName: string;
  lineageId: string;
  artifactCount: number;
  currentStep: string;
  lastUpdated: string;
}

export interface MissionLineageContextView {
  missionId: string;
  missionName: string;
  currentArtifact: string;
  previousArtifact: string | null;
  nextArtifact: string | null;
  currentOwner: string;
  lineageHref: string;
  progressNote: string;
}

export interface LifecycleLineageContext {
  currentLineagePosition: string;
  previousStageArtifact: string | null;
  nextStageArtifact: string | null;
  lineageHref: string;
}

export interface HandoffLineageContextItem {
  missionId: string;
  missionName: string;
  sourceArtifact: string;
  destinationArtifact: string;
  lineageHref: string;
}

export interface ArtifactLineageMissionContext {
  mission: Mission;
  lineage: ReturnType<typeof buildArtifactLineageRecord>;
  overview: {
    missionName: string;
    currentLifecycleStage: string;
    currentTeamRole: string;
    artifactCount: number;
    lastUpdated: string;
  };
  chain: LineageChainNode[];
  selectedNode: LineageChainNode;
  inspector: ReturnType<typeof buildArtifactInspector>;
  dependency: ReturnType<typeof buildDependencyContext>;
  reviewTrace: ReturnType<typeof buildReviewTraceability>;
  ownership: ReturnType<typeof buildTeamOwnershipRows>;
}

function countCompleteNodes(chain: LineageChainNode[]): number {
  return chain.filter(
    (n) =>
      n.status !== "Draft" &&
      n.status !== "Planned" &&
      n.status !== "Captured" &&
      n.status !== "Exploring"
  ).length;
}

export function buildLineageOverview(input: {
  missions: Mission[];
  tasks: Task[];
}): LineageOverviewSummary {
  let complete = 0;
  let incomplete = 0;
  const reviewRecords = buildArtifactReviewRecords({
    missions: input.missions,
    tasks: input.tasks,
  });
  const reviewConcentrations = reviewRecords.filter(
    (r) =>
      r.reviewState === "ready_for_review" ||
      r.reviewState === "review_requested" ||
      r.reviewState === "in_review" ||
      r.reviewState === "changes_requested"
  ).length;

  for (const mission of input.missions) {
    const lineage = buildArtifactLineageRecord(mission);
    const chain = buildLineageChain({ mission, tasks: input.tasks, lineage });
    const completeCount = countCompleteNodes(chain);
    if (completeCount >= 6) complete += 1;
    else incomplete += 1;
  }

  return {
    activeLineages: input.missions.filter((m) => m.status === "active" || m.status === "planning").length,
    completeLineages: complete,
    incompleteLineages: incomplete,
    reviewConcentrations,
    advisoryNote: artifactLineageAdvisoryNote,
  };
}

export function buildLineageMissionRows(input: {
  missions: Mission[];
  tasks: Task[];
}): LineageMissionRow[] {
  return input.missions.map((mission) => {
    const lineage = buildArtifactLineageRecord(mission);
    const chain = buildLineageChain({ mission, tasks: input.tasks, lineage });
    const currentStepId = inferCurrentChainStep(chain, mission);
    return {
      missionId: mission.id,
      missionName: mission.name,
      lineageId: lineage.lineageId,
      artifactCount: chain.length,
      currentStep: displayNameForStep(currentStepId),
      lastUpdated: mission.updatedAt,
    };
  });
}

export function buildArtifactLineageMissionContext(input: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  selectedArtifactId?: string | null;
  selectedStepId?: LineageArtifactStepId | null;
}): ArtifactLineageMissionContext {
  const lineage = buildArtifactLineageRecord(input.mission);
  const chain = buildLineageChain({
    mission: input.mission,
    tasks: input.tasks,
    lineage,
  });

  const currentStepId = inferCurrentChainStep(chain, input.mission);
  const selected =
    findChainNode(chain, {
      artifactId: input.selectedArtifactId,
      stepId: input.selectedStepId ?? undefined,
    }) ??
    findChainNode(chain, { stepId: currentStepId }) ??
    chain[0]!;

  const stageId = inferMissionWorkflowStage(input.mission);
  const stage = missionWorkflowStages.find((s) => s.id === stageId);

  return {
    mission: input.mission,
    lineage,
    overview: {
      missionName: input.mission.name,
      currentLifecycleStage: stage?.title ?? input.mission.lifecycle,
      currentTeamRole: handoffRoleLabel(ownerRoleForStep(currentStepId)),
      artifactCount: chain.length,
      lastUpdated: input.mission.updatedAt,
    },
    chain,
    selectedNode: selected,
    inspector: buildArtifactInspector({
      mission: input.mission,
      tasks: input.tasks,
      feedItems: input.feedItems,
      selected,
    }),
    dependency: buildDependencyContext({
      mission: input.mission,
      tasks: input.tasks,
      selected,
    }),
    reviewTrace: buildReviewTraceability({
      mission: input.mission,
      tasks: input.tasks,
      selected,
    }),
    ownership: buildTeamOwnershipRows(),
  };
}

export function buildMissionLineageContext(input: {
  mission: Mission;
  tasks: Task[];
}): MissionLineageContextView {
  const lineage = buildArtifactLineageRecord(input.mission);
  const chain = buildLineageChain({ mission: input.mission, tasks: input.tasks, lineage });
  const currentStepId = inferCurrentChainStep(chain, input.mission);
  const current = findChainNode(chain, { stepId: currentStepId })!;

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentArtifact: current.artifactName,
    previousArtifact: current.parentStepId ? displayNameForStep(current.parentStepId) : null,
    nextArtifact: current.childStepId ? displayNameForStep(current.childStepId) : null,
    currentOwner: current.ownerRoleLabel,
    lineageHref: `/artifact-lineage?mission=${input.mission.id}`,
    progressNote:
      "Trace artifact lineage to understand why each deliverable exists—human authorization only.",
  };
}

export function buildLifecycleLineageContext(input: {
  mission: Mission;
  tasks: Task[];
}): LifecycleLineageContext {
  const lineage = buildArtifactLineageRecord(input.mission);
  const chain = buildLineageChain({ mission: input.mission, tasks: input.tasks, lineage });
  const currentStepId = inferCurrentChainStep(chain, input.mission);
  const current = findChainNode(chain, { stepId: currentStepId })!;

  return {
    currentLineagePosition: current.artifactName,
    previousStageArtifact: current.parentStepId ? displayNameForStep(current.parentStepId) : null,
    nextStageArtifact: current.childStepId ? displayNameForStep(current.childStepId) : null,
    lineageHref: `/artifact-lineage?mission=${input.mission.id}&artifact=${current.artifactId}`,
  };
}

export function buildHandoffLineageContextItems(input: {
  missions: Mission[];
  tasks: Task[];
}): HandoffLineageContextItem[] {
  return input.missions
    .filter((m) => m.status === "active" || m.status === "planning")
    .map((mission) => {
      const lineage = buildArtifactLineageRecord(mission);
      const chain = buildLineageChain({ mission, tasks: input.tasks, lineage });
      const currentStepId = inferCurrentChainStep(chain, mission);
      const current = findChainNode(chain, { stepId: currentStepId })!;
      const source = current.parentStepId
        ? displayNameForStep(current.parentStepId)
        : "Idea";
      const dest = current.childStepId
        ? displayNameForStep(current.childStepId)
        : current.artifactName;

      return {
        missionId: mission.id,
        missionName: mission.name,
        sourceArtifact: source,
        destinationArtifact: dest,
        lineageHref: `/artifact-lineage?mission=${mission.id}`,
      };
    });
}

export function buildArtifactLineageWorkspaceData(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  missionId?: string | null;
  artifactId?: string | null;
}) {
  let rows = buildLineageMissionRows({ missions: input.missions, tasks: input.tasks });

  if (input.missionId) {
    rows = rows.filter((r) => r.missionId === input.missionId);
  }

  const selectedMissionId =
    input.missionId ?? rows[0]?.missionId ?? input.missions[0]?.id ?? null;

  const selectedMission = selectedMissionId
    ? input.missions.find((m) => m.id === selectedMissionId) ?? null
    : null;

  const context =
    selectedMission != null
      ? buildArtifactLineageMissionContext({
          mission: selectedMission,
          missions: input.missions,
          tasks: input.tasks,
          feedItems: input.feedItems,
          selectedArtifactId: input.artifactId,
        })
      : null;

  return {
    rows,
    overview: buildLineageOverview({ missions: input.missions, tasks: input.tasks }),
    selectedMission,
    context,
    handoffLineageItems: buildHandoffLineageContextItems({
      missions: input.missions,
      tasks: input.tasks,
    }),
    advisoryNote: artifactLineageAdvisoryNote,
    progressNote: context
      ? `Selected: ${context.selectedNode.artifactName} — ${context.selectedNode.status}`
      : rows.length === 0
        ? "No missions available for lineage tracing."
        : "Select a mission to trace artifact lineage.",
  };
}
