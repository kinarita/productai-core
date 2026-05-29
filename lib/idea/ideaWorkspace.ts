export type IdeaStateId =
  | "captured"
  | "exploring"
  | "refining"
  | "product_brief_draft"
  | "ready_for_review"
  | "approved"
  | "archived";

export type IdeaWorkspaceViewId =
  | "canvas"
  | "problem"
  | "value"
  | "mvp"
  | "features"
  | "brief"
  | "summary"
  | "context";

export interface ProductIdea {
  ideaId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: IdeaStateId;
  owner: "CEO";
  tags: string[];
  notes: string[];
  relatedMissionId?: string;
  relatedMissionName?: string;
}

export const ideaStateLevels: { id: IdeaStateId; title: string; description: string }[] = [
  { id: "captured", title: "Captured", description: "Idea recorded by the CEO." },
  { id: "exploring", title: "Exploring", description: "Opportunity and problem space exploration." },
  { id: "refining", title: "Refining", description: "Planner organizing scope and framing." },
  { id: "product_brief_draft", title: "Product Brief Draft", description: "Draft brief ready for CEO reading." },
  { id: "ready_for_review", title: "Ready For Review", description: "Brief ready for human review and authorization." },
  { id: "approved", title: "Approved", description: "CEO authorized—ready for mission direction consideration." },
  { id: "archived", title: "Archived", description: "Idea archived for continuity reading." },
];

export const ideaWorkspaceAdvisoryNote =
  "CEO thinks, AI organizes, CEO approves—planning support and idea exploration only, no automatic mission or task creation.";

export function ideaStateLabel(id: IdeaStateId): string {
  return ideaStateLevels.find((s) => s.id === id)?.title ?? id;
}

export function ideaProgressNote(idea: ProductIdea): string {
  switch (idea.status) {
    case "captured":
      return "This idea has been captured for exploration.";
    case "exploring":
      return "This idea is currently being explored.";
    case "refining":
      return "This idea is currently being refined.";
    case "product_brief_draft":
      return "The Product Brief draft is ready for review.";
    case "ready_for_review":
      return "The Product Brief is ready for CEO review and authorization.";
    case "approved":
      return "This Product Brief has been approved—Director hand-off may be considered when stakeholders align.";
    case "archived":
      return "This idea is archived for continuity reading.";
    default:
      return "Idea workspace provides planning support only.";
  }
}
