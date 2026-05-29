export type HandoffStatusId =
  | "draft"
  | "ready_for_review"
  | "approved"
  | "returned"
  | "handed_off"
  | "archived";

export interface HandoffStatusLevel {
  id: HandoffStatusId;
  title: string;
  description: string;
}

export const handoffStatusLevels: HandoffStatusLevel[] = [
  { id: "draft", title: "Draft", description: "Artifact in progress within the owning role." },
  { id: "ready_for_review", title: "Ready For Review", description: "Artifact ready for human or team review." },
  { id: "approved", title: "Approved", description: "Artifact approved for handoff consideration." },
  { id: "returned", title: "Returned", description: "Artifact returned for revision." },
  { id: "handed_off", title: "Handed Off", description: "Artifact passed to the next role in the workflow." },
  { id: "archived", title: "Archived", description: "Artifact archived after workflow completion." },
];

export function handoffStatusLabel(id: HandoffStatusId): string {
  return handoffStatusLevels.find((s) => s.id === id)?.title ?? id;
}

export function handoffStatusNote(artifactTitle: string, status: HandoffStatusId): string {
  switch (status) {
    case "draft":
      return `The ${artifactTitle} is in draft within the current role.`;
    case "ready_for_review":
      return `The ${artifactTitle} is ready for review.`;
    case "approved":
      return `The ${artifactTitle} has been approved for handoff consideration.`;
    case "returned":
      return `The ${artifactTitle} was returned for revision.`;
    case "handed_off":
      return `The ${artifactTitle} has been handed off to the next role in the workflow.`;
    case "archived":
      return `The ${artifactTitle} is archived after workflow completion.`;
    default:
      return `The ${artifactTitle} status is ${status}.`;
  }
}
