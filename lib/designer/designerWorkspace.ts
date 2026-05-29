export type DesignerWorkspaceViewId =
  | "intake"
  | "user_flow"
  | "screens"
  | "ux"
  | "design_spec"
  | "components"
  | "review"
  | "summary"
  | "context";

export type DesignReviewStateId =
  | "not_ready"
  | "preparing"
  | "review_candidate"
  | "ready_for_development_planning";

export const designerWorkspaceAdvisoryNote =
  "Design support only—Designer organizes UX and UI specifications. No auto UI generation, Figma editing, component creation, or coding.";

export function userFlowIdFromMission(missionId: string): string {
  return `uflow-${missionId}`;
}

export function designSpecificationIdFromMission(missionId: string): string {
  return `dspec-${missionId}`;
}

export function designSpecificationArtifactId(missionId: string): string {
  return `${missionId}-design_specification`;
}

export function designerWorkspaceHref(input?: { missionId?: string | null }): string {
  if (!input?.missionId) return "/designer-workspace";
  return `/designer-workspace?mission=${input.missionId}`;
}
