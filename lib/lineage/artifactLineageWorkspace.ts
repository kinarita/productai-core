export type ArtifactLineageViewId =
  | "overview"
  | "chain"
  | "inspector"
  | "dependency"
  | "review_trace"
  | "ownership"
  | "summary"
  | "context";

export const artifactLineageAdvisoryNote =
  "Artifact lineage explains why each artifact exists—traceability and accountability only. No automatic approval, progression, or optimization.";

export function lineageIdFromMission(missionId: string): string {
  return `lineage-${missionId}`;
}

export function artifactLineageHref(input?: {
  missionId?: string | null;
  artifactId?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input?.missionId) params.set("mission", input.missionId);
  if (input?.artifactId) params.set("artifact", input.artifactId);
  const q = params.toString();
  return q ? `/artifact-lineage?${q}` : "/artifact-lineage";
}
