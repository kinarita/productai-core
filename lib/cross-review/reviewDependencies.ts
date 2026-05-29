import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";

export interface ReviewDependencyLink {
  parentArtifact: string;
  childArtifact: string;
}

export const reviewDependencyChain: ReviewDependencyLink[] = [
  { parentArtifact: "Product Brief", childArtifact: "Mission Plan" },
  { parentArtifact: "Mission Plan", childArtifact: "Technical Specification" },
  { parentArtifact: "Technical Specification", childArtifact: "Design Specification" },
  { parentArtifact: "Design Specification", childArtifact: "Implementation Plan" },
  { parentArtifact: "Implementation Plan", childArtifact: "Test Plan" },
];

const typeToTitle: Record<ReviewTargetTypeId, string> = {
  product_brief: "Product Brief",
  mission_plan: "Mission Plan",
  technical_specification: "Technical Specification",
  design_specification: "Design Specification",
  ui_proposal: "UI Proposal",
  implementation_plan: "Implementation Plan",
  test_plan: "Test Plan",
  release_checklist: "Release Checklist",
  validation_summary: "Validation Summary",
};

export function reviewDependencyForType(
  artifactType: ReviewTargetTypeId
): { parent: string | null; child: string | null } {
  const title = typeToTitle[artifactType];
  const link = reviewDependencyChain.find(
    (l) => l.parentArtifact === title || l.childArtifact === title
  );
  if (!link) return { parent: null, child: null };
  if (link.parentArtifact === title) {
    return { parent: null, child: link.childArtifact };
  }
  return { parent: link.parentArtifact, child: link.childArtifact === title ? null : link.childArtifact };
}
