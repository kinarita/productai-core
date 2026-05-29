import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { handoffFlowSteps } from "@/lib/handoff/handoffWorkflow";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import type { ArtifactReviewRecord } from "@/lib/review/artifactReview";
import { reviewIdFromArtifact } from "@/lib/cross-review/crossRoleReviewWorkspace";
import type { ReviewStateId } from "@/lib/review/reviewStatus";

export const crossRoleReviewArtifactTypes: ReviewTargetTypeId[] = [
  "product_brief",
  "mission_plan",
  "technical_specification",
  "design_specification",
  "implementation_plan",
  "test_plan",
];

export interface CrossRoleReviewRecord {
  reviewId: string;
  artifactId: string;
  artifactType: ReviewTargetTypeId;
  missionId: string;
  ownerRole: HandoffRoleId;
  reviewerRole: HandoffRoleId;
  reviewState: ReviewStateId;
  createdAt: string;
  updatedAt: string;
}

export function reviewerRoleForOwner(ownerRole: HandoffRoleId): HandoffRoleId {
  const step = handoffFlowSteps.find((s) => s.id === ownerRole);
  return step?.receivesFrom ?? "ceo";
}

export function buildCrossRoleReviewRecord(record: ArtifactReviewRecord): CrossRoleReviewRecord {
  return {
    reviewId: reviewIdFromArtifact(record.artifactId),
    artifactId: record.artifactId,
    artifactType: record.artifactType,
    missionId: record.missionId,
    ownerRole: record.ownerRole,
    reviewerRole: reviewerRoleForOwner(record.ownerRole),
    reviewState: record.reviewState,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
