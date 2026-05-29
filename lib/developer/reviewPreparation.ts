import type { ArchitectureReviewContext } from "@/lib/architect/architectureReview";
import type { DesignReviewContext } from "@/lib/designer/designReview";

export interface DevelopmentReviewPreparationView {
  reviewTargets: string[];
  reviewScope: string[];
  reviewNotes: string[];
  recommendedReviewAreas: string[];
}

export function buildDevelopmentReviewPreparation(input: {
  architectureReview: ArchitectureReviewContext;
  designReview: DesignReviewContext;
}): DevelopmentReviewPreparationView {
  return {
    reviewTargets: [
      "Architecture Review",
      "Design Review",
      "Implementation Review",
      "Implementation Plan artifact",
    ],
    reviewScope: [
      `Architecture: ${input.architectureReview.statusLabel}`,
      `Design: ${input.designReview.statusLabel}`,
      "Implementation plan scope—frontend, backend, database, AI, integration",
    ],
    reviewNotes: [
      input.architectureReview.recommendation,
      input.designReview.recommendation,
      "Human review required before QA planning—no automatic approval.",
    ],
    recommendedReviewAreas: [
      "Session and auth boundaries (from technical specification)",
      "Workspace navigation and executive-readable tone (from design specification)",
      "Task breakdown alignment with mission plan—no auto task generation",
      "Repository plan vs. execution boundary documentation",
    ],
  };
}
