export type ReleaseReadinessLevelId =
  | "not_ready"
  | "preparing"
  | "candidate"
  | "ready_for_release"
  | "released";

export type ReleaseWorkspaceViewId =
  | "board"
  | "checklist"
  | "risks"
  | "summary"
  | "context";

export const releaseReadinessLevels: { id: ReleaseReadinessLevelId; title: string }[] = [
  { id: "not_ready", title: "Not Ready" },
  { id: "preparing", title: "Preparing" },
  { id: "candidate", title: "Candidate" },
  { id: "ready_for_release", title: "Ready For Release" },
  { id: "released", title: "Released" },
];

export const releaseWorkspaceAdvisoryNote =
  "Release readiness provides cross-cutting visibility across mission, task, repository, and review—no deploy, release execution, or CI/CD operations.";

export function releaseLevelLabel(id: ReleaseReadinessLevelId): string {
  return releaseReadinessLevels.find((l) => l.id === id)?.title ?? id;
}
