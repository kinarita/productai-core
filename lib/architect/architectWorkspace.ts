export type ArchitectWorkspaceViewId =
  | "intake"
  | "specification"
  | "system_design"
  | "components"
  | "data_model"
  | "api"
  | "dependencies"
  | "review"
  | "summary"
  | "context";

export type ArchitectureReviewStateId =
  | "not_ready"
  | "preparing"
  | "review_candidate"
  | "ready_for_design_review";

export const architectWorkspaceAdvisoryNote =
  "Planning and design support only—Architect organizes specifications and design artifacts. No auto coding, repository changes, or deployment.";

export function specificationIdFromMission(missionId: string): string {
  return `tspec-${missionId}`;
}

export function technicalSpecificationArtifactId(missionId: string): string {
  return `${missionId}-technical_specification`;
}

export function architectWorkspaceHref(input?: { missionId?: string | null }): string {
  if (!input?.missionId) return "/architect-workspace";
  return `/architect-workspace?mission=${input.missionId}`;
}
