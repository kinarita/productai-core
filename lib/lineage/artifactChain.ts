import type { Mission, Task } from "@/types/productai";
import type { HandoffArtifactTypeId } from "@/lib/handoff/handoffArtifacts";
import { buildHandoffArtifactsForMission } from "@/lib/handoff/handoffAnalysis";
import { handoffStatusLabel } from "@/lib/handoff/handoffStatus";
import { buildArtifactReviewRecord } from "@/lib/review/reviewAnalysis";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import { isReviewTargetType } from "@/lib/review/artifactReview";
import { artifactIdForReview } from "@/lib/review/reviewComments";
import { buildProductIdeas } from "@/lib/idea/ideaAnalysis";
import { ideaStateLabel } from "@/lib/idea/ideaWorkspace";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";
import { displayNameForStep, ownerRoleForStep } from "@/lib/lineage/teamOwnership";
import type { ArtifactLineageRecord } from "@/lib/lineage/artifactLineageRecord";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";

export type LineageArtifactStepId =
  | "idea"
  | "product_brief"
  | "mission_plan"
  | "technical_specification"
  | "design_specification"
  | "implementation_plan"
  | "test_plan";

export interface LineageChainNode {
  stepId: LineageArtifactStepId;
  artifactName: string;
  artifactType: string;
  artifactId: string;
  recordId: string;
  status: string;
  lastUpdated: string;
  ownerRole: string;
  ownerRoleLabel: string;
  workspaceHref: string;
  artifactReviewHref: string;
  lineageHref: string;
  summary: string;
  parentStepId: LineageArtifactStepId | null;
  childStepId: LineageArtifactStepId | null;
}

const chainOrder: LineageArtifactStepId[] = [
  "idea",
  "product_brief",
  "mission_plan",
  "technical_specification",
  "design_specification",
  "implementation_plan",
  "test_plan",
];

const stepToHandoffType: Record<LineageArtifactStepId, HandoffArtifactTypeId> = {
  idea: "ceo_idea_brief",
  product_brief: "product_brief",
  mission_plan: "mission_plan",
  technical_specification: "technical_specification",
  design_specification: "design_specification",
  implementation_plan: "implementation_plan",
  test_plan: "test_plan",
};

const stepToReviewType: Partial<Record<LineageArtifactStepId, ReviewTargetTypeId>> = {
  product_brief: "product_brief",
  mission_plan: "mission_plan",
  technical_specification: "technical_specification",
  design_specification: "design_specification",
  implementation_plan: "implementation_plan",
  test_plan: "test_plan",
};

function workspaceHrefForStep(missionId: string, stepId: LineageArtifactStepId, record: ArtifactLineageRecord): string {
  switch (stepId) {
    case "idea":
      return `/idea-workspace?idea=${record.ideaId}`;
    case "product_brief":
      return `/product-brief?mission=${missionId}`;
    case "mission_plan":
      return `/director-workspace?mission=${missionId}`;
    case "technical_specification":
      return `/architect-workspace?mission=${missionId}`;
    case "design_specification":
      return `/designer-workspace?mission=${missionId}`;
    case "implementation_plan":
      return `/developer-workspace?mission=${missionId}`;
    case "test_plan":
      return `/qa-workspace?mission=${missionId}`;
  }
}

function recordIdForStep(record: ArtifactLineageRecord, stepId: LineageArtifactStepId): string {
  switch (stepId) {
    case "idea":
      return record.ideaId;
    case "product_brief":
      return record.productBriefId;
    case "mission_plan":
      return record.missionPlanId;
    case "technical_specification":
      return record.technicalSpecificationId;
    case "design_specification":
      return record.designSpecificationId;
    case "implementation_plan":
      return record.implementationPlanId;
    case "test_plan":
      return record.testPlanId;
  }
}

export function buildLineageChain(input: {
  mission: Mission;
  tasks: Task[];
  lineage: ArtifactLineageRecord;
}): LineageChainNode[] {
  const handoffArtifacts = buildHandoffArtifactsForMission(input.mission);
  const ideas = buildProductIdeas([input.mission]);
  const idea = ideas.find((i) => i.relatedMissionId === input.mission.id);

  return chainOrder.map((stepId, index) => {
    const handoffType = stepToHandoffType[stepId];
    const handoff = handoffArtifacts.find((a) => a.typeId === handoffType);
    const reviewType = stepToReviewType[stepId];
    const artifactId = reviewType
      ? artifactIdForReview(input.mission.id, reviewType)
      : `${input.mission.id}-${handoffType}`;

    let status = handoff ? handoffStatusLabel(handoff.status) : "Planned";
    let summary = handoff?.summary ?? `${displayNameForStep(stepId)} for ${input.mission.name}.`;

    if (stepId === "idea" && idea) {
      status = ideaStateLabel(idea.status);
      summary = idea.description.slice(0, 120) + (idea.description.length > 120 ? "…" : "");
    }

    if (reviewType && isReviewTargetType(reviewType)) {
      const reviewRecord = buildArtifactReviewRecord({
        mission: input.mission,
        typeId: reviewType,
        tasks: input.tasks,
      });
      status = reviewRecord.reviewStateLabel;
      summary = reviewRecord.summary;
    }

    const ownerRole = ownerRoleForStep(stepId);

    return {
      stepId,
      artifactName: displayNameForStep(stepId),
      artifactType: handoffType.replaceAll("_", " "),
      artifactId,
      recordId: recordIdForStep(input.lineage, stepId),
      status,
      lastUpdated: input.mission.updatedAt,
      ownerRole,
      ownerRoleLabel: handoffRoleLabel(ownerRole),
      workspaceHref: workspaceHrefForStep(input.mission.id, stepId, input.lineage),
      artifactReviewHref: reviewType
        ? `/artifact-review?mission=${input.mission.id}&artifact=${artifactId}`
        : `/idea-workspace?idea=${input.lineage.ideaId}`,
      lineageHref: artifactLineageHref({
        missionId: input.mission.id,
        artifactId,
      }),
      summary,
      parentStepId: index > 0 ? chainOrder[index - 1]! : null,
      childStepId: index < chainOrder.length - 1 ? chainOrder[index + 1]! : null,
    };
  });
}

export function findChainNode(
  chain: LineageChainNode[],
  input?: { stepId?: LineageArtifactStepId; artifactId?: string | null }
): LineageChainNode | null {
  if (input?.artifactId) {
    return chain.find((n) => n.artifactId === input.artifactId) ?? null;
  }
  if (input?.stepId) {
    return chain.find((n) => n.stepId === input.stepId) ?? null;
  }
  return null;
}

export function inferCurrentChainStep(
  chain: LineageChainNode[],
  mission: Mission
): LineageArtifactStepId {
  const progress = mission.progress;
  if (progress >= 90) return "test_plan";
  if (progress >= 75) return "implementation_plan";
  if (progress >= 60) return "design_specification";
  if (progress >= 45) return "technical_specification";
  if (progress >= 30) return "mission_plan";
  if (progress >= 15) return "product_brief";
  return "idea";
}
