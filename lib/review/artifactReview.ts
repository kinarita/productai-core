import type { HandoffArtifactTypeId } from "@/lib/handoff/handoffArtifacts";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import type { ReviewStateId } from "@/lib/review/reviewStatus";

export type ReviewTargetTypeId = Extract<
  HandoffArtifactTypeId,
  | "product_brief"
  | "mission_plan"
  | "technical_specification"
  | "design_specification"
  | "ui_proposal"
  | "implementation_plan"
  | "test_plan"
  | "release_checklist"
  | "validation_summary"
>;

export type ReviewWorkspaceViewId =
  | "board"
  | "timeline"
  | "comments"
  | "recommendations"
  | "summary"
  | "context";

export interface ReviewTargetDefinition {
  id: ReviewTargetTypeId;
  title: string;
  ownerRole: HandoffRoleId;
  description: string;
}

export const reviewTargetDefinitions: ReviewTargetDefinition[] = [
  {
    id: "product_brief",
    title: "Product Brief",
    ownerRole: "product_planner",
    description: "Product scope and value proposition for executive review.",
  },
  {
    id: "mission_plan",
    title: "Mission Plan",
    ownerRole: "director",
    description: "Mission delivery plan and coordination milestones.",
  },
  {
    id: "technical_specification",
    title: "Technical Specification",
    ownerRole: "architect",
    description: "Technical requirements and system constraints.",
  },
  {
    id: "design_specification",
    title: "Design Specification",
    ownerRole: "designer",
    description: "UX and UI design specification for human review.",
  },
  {
    id: "ui_proposal",
    title: "UI Proposal",
    ownerRole: "designer",
    description: "UI direction and user experience alignment.",
  },
  {
    id: "implementation_plan",
    title: "Implementation Plan",
    ownerRole: "developer",
    description: "Implementation approach and development sequencing.",
  },
  {
    id: "test_plan",
    title: "QA Plan",
    ownerRole: "qa_reviewer",
    description: "Quality validation and test coverage plan.",
  },
  {
    id: "release_checklist",
    title: "Release Checklist",
    ownerRole: "qa_reviewer",
    description: "Pre-release validation checklist.",
  },
  {
    id: "validation_summary",
    title: "Validation Summary",
    ownerRole: "qa_reviewer",
    description: "QA validation summary for release consideration.",
  },
];

export interface ArtifactReviewRecord {
  artifactId: string;
  artifactType: ReviewTargetTypeId;
  artifactTitle: string;
  missionId: string;
  missionName: string;
  ownerRole: HandoffRoleId;
  ownerRoleLabel: string;
  reviewState: ReviewStateId;
  reviewStateLabel: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  commentCount: number;
  lastReviewedAt: string | null;
  recommendedNextAction: string;
  summary: string;
}

export const artifactReviewWorkspaceAdvisoryNote =
  "Artifact review workspace supports human approval and continuity reading—no automatic approve, reject, or workflow transition.";

export function isReviewTargetType(id: HandoffArtifactTypeId): id is ReviewTargetTypeId {
  return reviewTargetDefinitions.some((t) => t.id === id);
}

export function reviewTargetLabel(id: ReviewTargetTypeId): string {
  return reviewTargetDefinitions.find((t) => t.id === id)?.title ?? id;
}
