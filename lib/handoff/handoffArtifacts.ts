import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import type { HandoffStatusId } from "@/lib/handoff/handoffStatus";

export type HandoffArtifactTypeId =
  | "product_brief"
  | "user_problem_statement"
  | "mvp_scope"
  | "feature_proposal"
  | "mission_plan"
  | "delivery_plan"
  | "task_breakdown"
  | "review_schedule"
  | "technical_specification"
  | "system_design"
  | "architecture_notes"
  | "dependency_plan"
  | "ui_proposal"
  | "user_flow"
  | "design_notes"
  | "component_proposal"
  | "implementation_plan"
  | "development_notes"
  | "repository_context"
  | "review_notes"
  | "test_plan"
  | "qa_notes"
  | "release_checklist"
  | "validation_summary"
  | "ceo_idea_brief";

export interface HandoffArtifactDefinition {
  id: HandoffArtifactTypeId;
  title: string;
  role: HandoffRoleId;
  description: string;
}

export interface HandoffArtifact {
  id: string;
  missionId: string;
  missionName: string;
  typeId: HandoffArtifactTypeId;
  title: string;
  role: HandoffRoleId;
  roleLabel: string;
  status: HandoffStatusId;
  statusLabel: string;
  summary: string;
  updatedAt: string;
  isPrimary: boolean;
}

export const handoffArtifactDefinitions: HandoffArtifactDefinition[] = [
  { id: "ceo_idea_brief", title: "CEO Idea Brief", role: "ceo", description: "Executive product idea framing." },
  { id: "product_brief", title: "Product Brief", role: "product_planner", description: "Product scope and value proposition." },
  { id: "user_problem_statement", title: "User Problem Statement", role: "product_planner", description: "User problem and opportunity framing." },
  { id: "mvp_scope", title: "MVP Scope", role: "product_planner", description: "Minimum viable product boundaries." },
  { id: "feature_proposal", title: "Feature Proposal", role: "product_planner", description: "Prioritized feature proposals." },
  { id: "mission_plan", title: "Mission Plan", role: "director", description: "Mission delivery plan and milestones." },
  { id: "delivery_plan", title: "Delivery Plan", role: "director", description: "Delivery schedule and coordination." },
  { id: "task_breakdown", title: "Task Breakdown", role: "director", description: "Decomposed mission tasks." },
  { id: "review_schedule", title: "Review Schedule", role: "director", description: "Review cadence and checkpoints." },
  { id: "technical_specification", title: "Technical Specification", role: "architect", description: "Technical requirements and constraints." },
  { id: "system_design", title: "System Design", role: "architect", description: "System architecture and boundaries." },
  { id: "architecture_notes", title: "Architecture Notes", role: "architect", description: "Design decisions and trade-offs." },
  { id: "dependency_plan", title: "Dependency Plan", role: "architect", description: "Cross-system dependency mapping." },
  { id: "ui_proposal", title: "UI Proposal", role: "designer", description: "UI direction and layout proposals." },
  { id: "user_flow", title: "User Flow", role: "designer", description: "End-to-end user journey flows." },
  { id: "design_notes", title: "Design Notes", role: "designer", description: "UX and design system notes." },
  { id: "component_proposal", title: "Component Proposal", role: "designer", description: "Reusable component proposals." },
  { id: "implementation_plan", title: "Implementation Plan", role: "developer", description: "Implementation approach and sequencing." },
  { id: "development_notes", title: "Development Notes", role: "developer", description: "Implementation progress notes." },
  { id: "repository_context", title: "Repository Context", role: "developer", description: "Branch, PR, and code context." },
  { id: "review_notes", title: "Review Notes", role: "developer", description: "Code review and implementation notes." },
  { id: "test_plan", title: "Test Plan", role: "qa_reviewer", description: "Quality validation plan." },
  { id: "qa_notes", title: "QA Notes", role: "qa_reviewer", description: "QA findings and review notes." },
  { id: "release_checklist", title: "Release Checklist", role: "qa_reviewer", description: "Pre-release validation checklist." },
  { id: "validation_summary", title: "Validation Summary", role: "qa_reviewer", description: "QA validation summary for release." },
];

export function getArtifactsForRole(role: HandoffRoleId): HandoffArtifactDefinition[] {
  return handoffArtifactDefinitions.filter((a) => a.role === role);
}

export function getPrimaryArtifactTypeForRole(role: HandoffRoleId): HandoffArtifactTypeId {
  const defs = getArtifactsForRole(role);
  if (role === "ceo") return "ceo_idea_brief";
  if (role === "release") return "validation_summary";
  return defs[0]?.id ?? "product_brief";
}

export function artifactTypeLabel(id: HandoffArtifactTypeId): string {
  return handoffArtifactDefinitions.find((a) => a.id === id)?.title ?? id;
}
