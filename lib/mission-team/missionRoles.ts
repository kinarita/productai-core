export type MissionTeamRoleId =
  | "product_planner"
  | "director"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer";

export type SharedServiceRoleId = "memory_manager" | "repository_manager" | "support";

export interface MissionTeamRole {
  id: MissionTeamRoleId;
  title: string;
  shortTitle: string;
  description: string;
  deliverables: string[];
}

export const missionTeamRoles: MissionTeamRole[] = [
  {
    id: "product_planner",
    title: "Product Planner",
    shortTitle: "Planner",
    description:
      "Refines CEO ideas into product briefs, user problems, value propositions, MVP scope, and feature priority.",
    deliverables: ["Product Brief", "Feature Proposal", "MVP Scope"],
  },
  {
    id: "director",
    title: "Director",
    shortTitle: "Director",
    description:
      "Plans the mission, decomposes work, coordinates schedules, assignments, reviews, and risk sharing.",
    deliverables: ["Mission Plan", "Delivery Plan", "Review Schedule"],
  },
  {
    id: "architect",
    title: "Architect",
    shortTitle: "Architect",
    description: "Owns system design, technology choices, data models, and API design.",
    deliverables: ["Architecture Spec", "Technical Design"],
  },
  {
    id: "designer",
    title: "Designer",
    shortTitle: "Designer",
    description: "Owns UX, UI, and design system alignment for the mission.",
    deliverables: ["Wireframe", "Design Proposal"],
  },
  {
    id: "developer",
    title: "Developer",
    shortTitle: "Developer",
    description: "Implements features, refactors, and resolves technical issues.",
    deliverables: ["Code", "Pull Request"],
  },
  {
    id: "qa_reviewer",
    title: "QA Reviewer",
    shortTitle: "QA",
    description: "Confirms quality through review and testing.",
    deliverables: ["QA Report", "Review Notes"],
  },
];

export const sharedServiceRoles = [
  {
    id: "memory_manager" as const,
    title: "Memory Manager",
    description: "Organizational memory and continuity context.",
  },
  {
    id: "repository_manager" as const,
    title: "Repository Manager",
    description: "Repository structure and change traceability.",
  },
  {
    id: "support" as const,
    title: "Support",
    description: "Cross-mission operational support.",
  },
];

export const cooCoordinationNote =
  "The AI COO coordinates Product Planner, Director, and Architect—it does not author product plans directly. COO focuses on alignment and executive-readable mission health.";

export function getMissionTeamRole(id: MissionTeamRoleId): MissionTeamRole {
  return missionTeamRoles.find((r) => r.id === id) ?? missionTeamRoles[0];
}
