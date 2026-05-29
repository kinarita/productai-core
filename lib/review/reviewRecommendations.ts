import type { ArtifactReviewRecord } from "@/lib/review/artifactReview";
import type { ReviewComment } from "@/lib/review/reviewComments";
import { reviewStateNote } from "@/lib/review/reviewStatus";

export interface ReviewRecommendation {
  id: string;
  artifactId: string;
  artifactTitle: string;
  message: string;
  category: "stakeholder" | "readiness" | "feedback" | "continuity";
}

export function buildReviewRecommendations(input: {
  records: ArtifactReviewRecord[];
  comments: ReviewComment[];
}): ReviewRecommendation[] {
  const recommendations: ReviewRecommendation[] = [];

  for (const record of input.records) {
    const artifactComments = input.comments.filter((c) => c.artifactId === record.artifactId);
    const hasConcern = artifactComments.some((c) => c.severity === "concern");

    if (record.artifactType === "product_brief" && record.reviewState === "ready_for_review") {
      recommendations.push({
        id: `rec-${record.artifactId}-stakeholder`,
        artifactId: record.artifactId,
        artifactTitle: record.artifactTitle,
        message: "The Product Brief may benefit from stakeholder review.",
        category: "stakeholder",
      });
    }

    if (
      record.artifactType === "technical_specification" &&
      (record.reviewState === "ready_for_review" || record.reviewState === "approved")
    ) {
      recommendations.push({
        id: `rec-${record.artifactId}-design`,
        artifactId: record.artifactId,
        artifactTitle: record.artifactTitle,
        message: "The Technical Specification appears ready for design review.",
        category: "readiness",
      });
    }

    if (
      (record.artifactType === "test_plan" || record.artifactType === "validation_summary") &&
      (hasConcern || record.reviewState === "changes_requested")
    ) {
      recommendations.push({
        id: `rec-${record.artifactId}-qa`,
        artifactId: record.artifactId,
        artifactTitle: record.artifactTitle,
        message: "The QA Plan contains unresolved review notes.",
        category: "feedback",
      });
    }

    if (record.reviewState === "changes_requested") {
      recommendations.push({
        id: `rec-${record.artifactId}-changes`,
        artifactId: record.artifactId,
        artifactTitle: record.artifactTitle,
        message: reviewStateNote(record.artifactTitle, "changes_requested"),
        category: "feedback",
      });
    }

    if (record.reviewState === "in_review" && record.commentCount > 0) {
      recommendations.push({
        id: `rec-${record.artifactId}-continuity`,
        artifactId: record.artifactId,
        artifactTitle: record.artifactTitle,
        message: `${record.commentCount} human review comment(s) on record—continuity reading suggested.`,
        category: "continuity",
      });
    }
  }

  return recommendations.slice(0, 12);
}
