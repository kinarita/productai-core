import type { AgentRole } from "@/types/productai";
import type { MemoryItem } from "@/types/productai";

/** Phase 12 — presentation-only labels (data keys unchanged). */

export const teamKnowledgeTitle = "Team Knowledge";
export const teamKnowledgeDescription =
  "What your AI team learned—reusable tips for the next project.";

export const memoryCategoryLabels: Record<MemoryItem["category"], string> = {
  learning: "Lessons Learned",
  architecture: "Design Patterns",
  incident: "Problems We Solved",
  pattern: "Best Practices",
};

export const decisionTrailTitle = "Decision Trail";
export const decisionTrailDescription =
  "Show how an idea became software—every step explained in plain language.";

export const deliverableLabel = "Deliverable";
export const historyLabel = "History";
export const reviewHistoryLabel = "Review History";
export const responsibleWorkerLabel = "Responsible AI Worker";

export const lineageViewLabels: Record<string, string> = {
  overview: "Overview",
  chain: `${deliverableLabel} ${historyLabel}`,
  inspector: "Details",
  dependency: "What it depends on",
  review_trace: reviewHistoryLabel,
  ownership: responsibleWorkerLabel,
  summary: "Summary",
  context: "Full story",
};

export const humanTaskRoleLabels: Partial<Record<AgentRole, string>> = {
  Engineer: "Builder",
  Architect: "Architect",
  COO: "Coordinator",
  QA: "QA",
  CEO: "CEO",
  "Runtime Observer": "Observer",
};

export function humanAgentRoleLabel(role: AgentRole): string {
  return humanTaskRoleLabels[role] ?? role;
}

export function humanWorkerStatusForTask(status: string): string {
  switch (status) {
    case "active":
      return "Working";
    case "in_review":
      return "Reviewing";
    case "blocked":
      return "Blocked";
    case "completed":
      return "Done";
    default:
      return "Queued";
  }
}
