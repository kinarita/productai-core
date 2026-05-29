import type { Mission, Task } from "@/types/productai";
import type { LineageChainNode } from "@/lib/lineage/artifactChain";
import { buildArtifactReviewRecord, buildReviewTimeline } from "@/lib/review/reviewAnalysis";
import { getCommentsForArtifact } from "@/lib/review/reviewComments";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import { isReviewTargetType } from "@/lib/review/artifactReview";

export interface ReviewTraceabilityView {
  artifactReviewStatus: string;
  reviewHistory: Array<{ label: string; detail: string; status: string }>;
  changesRequested: string[];
  approvalContext: string[];
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

export function buildReviewTraceability(input: {
  mission: Mission;
  tasks: Task[];
  selected: LineageChainNode;
}): ReviewTraceabilityView {
  const reviewType = stepToReviewType[input.selected.stepId];

  if (!reviewType || !isReviewTargetType(reviewType)) {
    return {
      artifactReviewStatus: "Idea stage—formal artifact review begins at Product Brief.",
      reviewHistory: [
        {
          label: "Idea captured",
          detail: "CEO idea recorded before Product Brief drafting.",
          status: "completed",
        },
      ],
      changesRequested: [],
      approvalContext: [
        "CEO authorization required before mission direction—no automatic approval.",
      ],
      advisoryNote: "Connect to Artifact Review Workspace when Product Brief is ready.",
    };
  }

  const record = buildArtifactReviewRecord({
    mission: input.mission,
    typeId: reviewType,
    tasks: input.tasks,
  });
  const timeline = buildReviewTimeline({ record });
  const comments = getCommentsForArtifact(record.artifactId);

  const changesRequested =
    record.reviewState === "changes_requested"
      ? comments.map((c) => `${c.title}: ${c.comment}`)
      : [];

  const approvalContext = [
    record.recommendedNextAction,
    record.reviewState === "approved" || record.reviewState === "archived"
      ? "Human approval recorded for continuity—downstream planning may proceed when stakeholders align."
      : "Approval pending—no automatic accept or reject.",
  ];

  return {
    artifactReviewStatus: record.reviewStateLabel,
    reviewHistory: timeline.map((t) => ({
      label: t.label,
      detail: t.detail,
      status: t.status,
    })),
    changesRequested,
    approvalContext,
    advisoryNote:
      "Review traceability links to Artifact Review Workspace—human decisions only.",
  };
}
