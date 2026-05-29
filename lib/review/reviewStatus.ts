export type ReviewStateId =
  | "draft"
  | "ready_for_review"
  | "in_review"
  | "review_requested"
  | "changes_requested"
  | "approved"
  | "archived";

export interface ReviewStateLevel {
  id: ReviewStateId;
  title: string;
  description: string;
}

export const reviewStateLevels: ReviewStateLevel[] = [
  { id: "draft", title: "Draft", description: "Artifact draft within the owning role." },
  { id: "ready_for_review", title: "Ready For Review", description: "Artifact ready for human review." },
  { id: "in_review", title: "In Review", description: "Review in progress by stakeholders." },
  { id: "review_requested", title: "Review Requested", description: "Formal review request recorded." },
  { id: "changes_requested", title: "Changes Requested", description: "Unresolved feedback requires revision." },
  { id: "approved", title: "Approved", description: "Human approval recorded for continuity." },
  { id: "archived", title: "Archived", description: "Review archived after workflow completion." },
];

export function reviewStateLabel(id: ReviewStateId): string {
  return reviewStateLevels.find((s) => s.id === id)?.title ?? id;
}

export function reviewStateNote(artifactTitle: string, state: ReviewStateId): string {
  switch (state) {
    case "draft":
      return `The ${artifactTitle} remains in draft.`;
    case "ready_for_review":
    case "review_requested":
      return `This artifact is currently awaiting review.`;
    case "in_review":
      return `The ${artifactTitle} is in review.`;
    case "changes_requested":
      return `This review contains unresolved feedback.`;
    case "approved":
      return `This artifact appears ready for the next review stage.`;
    case "archived":
      return `The ${artifactTitle} review is archived.`;
    default:
      return `Review state: ${state}.`;
  }
}
