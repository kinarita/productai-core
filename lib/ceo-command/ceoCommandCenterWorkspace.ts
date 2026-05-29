import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";

export type CeoCommandCenterViewId =
  | "overview"
  | "pipeline"
  | "review"
  | "mission"
  | "artifact"
  | "team"
  | "feed"
  | "reading"
  | "snapshot"
  | "hub"
  | "context";

export type CeoAttentionFilterId =
  | "all"
  | "reviews"
  | "missions"
  | "lineage"
  | "release";

export const ceoCommandCenterAdvisoryNote =
  "CEO Command Center provides executive visibility across ProductAI workspaces—no automatic instructions, approval, prioritization, or execution.";

export const ceoNavigationLinks: { label: string; href: string }[] = [
  { label: "Idea Workspace", href: "/idea-workspace" },
  { label: "Product Brief Workspace", href: "/product-brief" },
  { label: "Director Workspace", href: "/director-workspace" },
  { label: "Architect Workspace", href: "/architect-workspace" },
  { label: "Designer Workspace", href: "/designer-workspace" },
  { label: "Developer Workspace", href: "/developer-workspace" },
  { label: "QA Workspace", href: "/qa-workspace" },
  { label: "COO Workspace", href: "/coo-workspace" },
  { label: "Review Workspace", href: "/review-workspace" },
  { label: "Artifact Lineage", href: "/artifact-lineage" },
  { label: "Lifecycle Workspace", href: "/product-lifecycle" },
  { label: "Release Workspace", href: "/release-workspace" },
];

export function workspaceHrefForRole(role: HandoffRoleId, missionId: string): string {
  switch (role) {
    case "ceo":
      return `/idea-workspace?idea=idea-${missionId}`;
    case "product_planner":
      return `/product-brief?mission=${missionId}`;
    case "director":
      return `/director-workspace?mission=${missionId}`;
    case "architect":
      return `/architect-workspace?mission=${missionId}`;
    case "designer":
      return `/designer-workspace?mission=${missionId}`;
    case "developer":
      return `/developer-workspace?mission=${missionId}`;
    case "qa_reviewer":
      return `/qa-workspace?mission=${missionId}`;
    default:
      return `/missions/${missionId}`;
  }
}
