import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";

export type ReviewCommentSeverity = "info" | "suggestion" | "concern";

export interface ReviewComment {
  id: string;
  artifactId: string;
  missionId: string;
  title: string;
  comment: string;
  authorRole: string;
  createdAt: string;
  severity?: ReviewCommentSeverity;
}

/** Human-recorded review comments — seeded only, not AI-generated. */
export const seededReviewComments: ReviewComment[] = [
  {
    id: "rc-1",
    artifactId: "m-1-product_brief",
    missionId: "m-1",
    title: "Stakeholder alignment",
    comment:
      "Enterprise SSO scope should be confirmed with customer success before finalizing MVP boundaries.",
    authorRole: "CEO",
    createdAt: "2026-05-28T10:00:00Z",
    severity: "suggestion",
  },
  {
    id: "rc-2",
    artifactId: "m-1-technical_specification",
    missionId: "m-1",
    title: "Session refresh",
    comment: "Session refresh merge is pending—design review should wait until auth path is stable.",
    authorRole: "Architect",
    createdAt: "2026-05-28T14:30:00Z",
    severity: "concern",
  },
  {
    id: "rc-3",
    artifactId: "m-2-technical_specification",
    missionId: "m-2",
    title: "Partitioning trade-off",
    comment: "Tenant partitioning option documented—CEO decision needed within 48h per COO note.",
    authorRole: "COO",
    createdAt: "2026-05-27T09:15:00Z",
    severity: "info",
  },
  {
    id: "rc-4",
    artifactId: "m-2-mission_plan",
    missionId: "m-2",
    title: "Timeline buffer",
    comment: "Recommend explicit buffer for integration test coverage if Option B is selected.",
    authorRole: "Director",
    createdAt: "2026-05-27T11:00:00Z",
    severity: "suggestion",
  },
  {
    id: "rc-5",
    artifactId: "m-3-test_plan",
    missionId: "m-3",
    title: "Mobile regression",
    comment: "Onboarding flow needs device matrix coverage before release checklist sign-off.",
    authorRole: "QA Reviewer",
    createdAt: "2026-05-29T08:45:00Z",
    severity: "concern",
  },
  {
    id: "rc-6",
    artifactId: "m-1-ui_proposal",
    missionId: "m-1",
    title: "Admin vs member flows",
    comment: "Role-based access flows look aligned with requirements summary—minor copy review suggested.",
    authorRole: "Designer",
    createdAt: "2026-05-28T16:00:00Z",
    severity: "info",
  },
];

export function getCommentsForArtifact(artifactId: string): ReviewComment[] {
  return seededReviewComments.filter((c) => c.artifactId === artifactId);
}

export function getCommentsForMission(missionId: string): ReviewComment[] {
  return seededReviewComments.filter((c) => c.missionId === missionId);
}

export function countCommentsForArtifact(artifactId: string): number {
  return getCommentsForArtifact(artifactId).length;
}

export function artifactIdForReview(missionId: string, type: ReviewTargetTypeId): string {
  return `${missionId}-${type}`;
}
