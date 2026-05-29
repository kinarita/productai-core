export type DirectorWorkspaceViewId =
  | "intake"
  | "mission_plan"
  | "delivery"
  | "tasks"
  | "schedule"
  | "dependencies"
  | "architect"
  | "summary"
  | "context";

export type DirectorReviewScheduleState = "planned" | "scheduled" | "completed";

export type ArchitectHandoffReadinessId =
  | "not_ready"
  | "preparing"
  | "handoff_candidate"
  | "ready_for_architect_review";

export const directorWorkspaceAdvisoryNote =
  "Planning support only—Director organizes Mission Plan, Delivery Plan, Task Breakdown, and Review Schedule. No auto mission creation, task generation, assignment, or Architect handoff.";

export function missionPlanIdFromMission(missionId: string): string {
  return `mpl-${missionId}`;
}

export function directorWorkspaceHref(input?: {
  briefId?: string | null;
  missionId?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input?.briefId) params.set("brief", input.briefId);
  if (input?.missionId) params.set("mission", input.missionId);
  const q = params.toString();
  return q ? `/director-workspace?${q}` : "/director-workspace";
}
