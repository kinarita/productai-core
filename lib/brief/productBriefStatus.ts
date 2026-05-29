export type ProductBriefStateId =
  | "draft"
  | "under_review"
  | "review_requested"
  | "changes_requested"
  | "approved"
  | "director_handoff_ready"
  | "archived";

export interface ProductBriefStateLevel {
  id: ProductBriefStateId;
  title: string;
  description: string;
}

export const productBriefStateLevels: ProductBriefStateLevel[] = [
  { id: "draft", title: "Draft", description: "Brief draft in progress by Product Planner." },
  { id: "under_review", title: "Under Review", description: "Brief under stakeholder review." },
  { id: "review_requested", title: "Review Requested", description: "Formal review request recorded." },
  { id: "changes_requested", title: "Changes Requested", description: "Unresolved feedback requires revision." },
  { id: "approved", title: "Approved", description: "CEO authorization recorded." },
  {
    id: "director_handoff_ready",
    title: "Director Handoff Ready",
    description: "Approved brief available for Director planning consideration.",
  },
  { id: "archived", title: "Archived", description: "Brief archived for continuity reading." },
];

export function productBriefStateLabel(id: ProductBriefStateId): string {
  return productBriefStateLevels.find((s) => s.id === id)?.title ?? id;
}

export function productBriefStateNote(title: string, state: ProductBriefStateId): string {
  switch (state) {
    case "draft":
      return `The ${title} Product Brief remains in draft.`;
    case "under_review":
    case "review_requested":
      return `This Product Brief is currently under review.`;
    case "changes_requested":
      return `This Product Brief has changes requested.`;
    case "approved":
      return `This Product Brief appears ready for CEO approval context—human authorization on record.`;
    case "director_handoff_ready":
      return `This Product Brief is available for Director handoff consideration.`;
    case "archived":
      return `The ${title} Product Brief is archived.`;
    default:
      return `Brief status: ${state}.`;
  }
}
