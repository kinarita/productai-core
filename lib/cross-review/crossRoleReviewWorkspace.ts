export type CrossReviewWorkspaceViewId =
  | "overview"
  | "board"
  | "matrix"
  | "inspector"
  | "dependencies"
  | "traceability"
  | "concentration"
  | "context";

export const crossRoleReviewAdvisoryNote =
  "Cross-role review visibility only—see what is pending, in review, and approved. No automatic approval, prioritization, or execution.";

export function crossReviewWorkspaceHref(input?: {
  missionId?: string | null;
  artifactId?: string | null;
  reviewId?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input?.missionId) params.set("mission", input.missionId);
  if (input?.artifactId) params.set("artifact", input.artifactId);
  if (input?.reviewId) params.set("review", input.reviewId);
  const q = params.toString();
  return q ? `/review-workspace?${q}` : "/review-workspace";
}

export function reviewIdFromArtifact(artifactId: string): string {
  return `review-${artifactId}`;
}
