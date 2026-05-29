export type QaWorkspaceViewId =
  | "intake"
  | "test_plan"
  | "checklist"
  | "acceptance"
  | "risk_review"
  | "release_validation"
  | "readiness"
  | "summary"
  | "context";

export type QaReviewStateId = "planned" | "in_review" | "completed";

export type QaReadinessStatusId =
  | "not_ready"
  | "preparing"
  | "review_candidate"
  | "ready_for_release_review";

export const qaWorkspaceAdvisoryNote =
  "Quality planning only—QA Reviewer organizes validation plans and readiness context. No auto testing, QA approval, release approval, repository changes, pull requests, CI/CD, MCP execution, or deployment.";

export function testPlanIdFromMission(missionId: string): string {
  return `tplan-${missionId}`;
}

export function testPlanArtifactId(missionId: string): string {
  return `${missionId}-test_plan`;
}

export function qaWorkspaceHref(input?: { missionId?: string | null }): string {
  if (!input?.missionId) return "/qa-workspace";
  return `/qa-workspace?mission=${input.missionId}`;
}

