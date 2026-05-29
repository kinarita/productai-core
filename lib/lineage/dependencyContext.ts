import type { LineageChainNode } from "@/lib/lineage/artifactChain";
import { displayNameForStep } from "@/lib/lineage/teamOwnership";
import { buildArtifactReviewRecord } from "@/lib/review/reviewAnalysis";
import type { Mission, Task } from "@/types/productai";
import { isReviewTargetType } from "@/lib/review/artifactReview";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import { inferMissionWorkflowStage } from "@/lib/mission-team/missionWorkflow";
import { missionWorkflowStages } from "@/lib/mission-team/missionWorkflow";

export interface DependencyContextView {
  artifactName: string;
  parentArtifact: string | null;
  childArtifact: string | null;
  relatedReviews: string[];
  relatedLifecycleStage: string;
  advisoryNote: string;
}

const stepToReviewType: Partial<Record<LineageChainNode["stepId"], ReviewTargetTypeId>> = {
  product_brief: "product_brief",
  mission_plan: "mission_plan",
  technical_specification: "technical_specification",
  design_specification: "design_specification",
  implementation_plan: "implementation_plan",
  test_plan: "test_plan",
};

export function buildDependencyContext(input: {
  mission: Mission;
  tasks: Task[];
  selected: LineageChainNode;
}): DependencyContextView {
  const parent = input.selected.parentStepId
    ? displayNameForStep(input.selected.parentStepId)
    : null;
  const child = input.selected.childStepId
    ? displayNameForStep(input.selected.childStepId)
    : null;

  const reviewType = stepToReviewType[input.selected.stepId];
  const relatedReviews: string[] = [];
  if (reviewType && isReviewTargetType(reviewType)) {
    const record = buildArtifactReviewRecord({
      mission: input.mission,
      typeId: reviewType,
      tasks: input.tasks,
    });
    relatedReviews.push(
      `Review state: ${record.reviewStateLabel}`,
      record.recommendedNextAction,
      record.commentCount > 0 ? `${record.commentCount} human comment(s) on record` : "No review comments yet"
    );
  } else {
    relatedReviews.push("Idea framing precedes formal Product Brief review.");
  }

  const stageId = inferMissionWorkflowStage(input.mission);
  const stage = missionWorkflowStages.find((s) => s.id === stageId);

  return {
    artifactName: input.selected.artifactName,
    parentArtifact: parent,
    childArtifact: child,
    relatedReviews,
    relatedLifecycleStage: stage?.title ?? input.mission.lifecycle,
    advisoryNote:
      "Parent and child links show planning lineage—not automatic workflow transitions.",
  };
}
