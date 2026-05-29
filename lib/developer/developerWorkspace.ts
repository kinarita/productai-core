export type DeveloperWorkspaceViewId =
  | "intake"
  | "implementation_plan"
  | "work_breakdown"
  | "repository"
  | "risks"
  | "review_prep"
  | "readiness"
  | "summary"
  | "context";

export type DevelopmentReadinessStateId =
  | "not_ready"
  | "preparing"
  | "review_candidate"
  | "ready_for_qa_planning";

export const developerWorkspaceAdvisoryNote =
  "Implementation planning only—Developer organizes plans and work breakdown. No auto coding, repository changes, pull requests, or deployment.";

export function implementationPlanIdFromMission(missionId: string): string {
  return `iplan-${missionId}`;
}

export function implementationPlanArtifactId(missionId: string): string {
  return `${missionId}-implementation_plan`;
}

export function developerWorkspaceHref(input?: { missionId?: string | null }): string {
  if (!input?.missionId) return "/developer-workspace";
  return `/developer-workspace?mission=${input.missionId}`;
}
