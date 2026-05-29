import type { Mission } from "@/types/productai";
import { designSpecificationIdFromMission } from "@/lib/designer/designerWorkspace";
import { artifactIdForReview } from "@/lib/review/reviewComments";

export interface DesignSpecificationRecord {
  designSpecificationId: string;
  missionId: string;
  title: string;
  designPrinciples: string[];
  layoutGuidelines: string[];
  navigationGuidelines: string[];
  interactionGuidelines: string[];
  accessibilityGuidelines: string[];
  createdAt: string;
  updatedAt: string;
  artifactReviewHref: string;
}

export function buildDesignSpecificationRecord(input: {
  mission: Mission;
}): DesignSpecificationRecord {
  const artifactId = artifactIdForReview(input.mission.id, "design_specification");
  return {
    designSpecificationId: designSpecificationIdFromMission(input.mission.id),
    missionId: input.mission.id,
    title: `${input.mission.name} — Design Specification`,
    designPrinciples: [
      "Executive-readable, calm, recommendation-only tone.",
      "Planning and design support—no execution or autonomous runtime messaging.",
      "Human authorization visible across approval and review panels.",
    ],
    layoutGuidelines: [
      "AppShell with sidebar navigation and card-based sections.",
      "Workspace view toggles as rounded pill controls.",
      "Summary grids with 2–4 stat columns on overview cards.",
    ],
    navigationGuidelines: [
      "CEO Home links to Idea, Brief, Director, Architect, and Designer workspaces.",
      "Deep links preserve mission context via query parameters.",
      "Breadcrumb-style text links between upstream and downstream workspaces.",
    ],
    interactionGuidelines: [
      "Buttons for view selection—no auto workflow transitions.",
      "Artifact Review links open human review context only.",
      "Forbidden phrases avoided (auto approval, auto mission generation).",
    ],
    accessibilityGuidelines: [
      "Uppercase labels for field categories with sufficient contrast.",
      "Table layouts for inventories with clear column headers.",
      "Status pills with text labels—not color-only indicators.",
    ],
    createdAt: input.mission.createdAt ?? input.mission.updatedAt,
    updatedAt: input.mission.updatedAt,
    artifactReviewHref: `/artifact-review?mission=${input.mission.id}&artifact=${artifactId}`,
  };
}
