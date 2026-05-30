import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";

/** User-facing AI worker (organization roles hidden in Phase 1 nav). */
export type AiWorkerId =
  | "product_planner"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer";

export type AiWorkerRunStatus = "completed" | "in_progress" | "waiting" | "not_started";

export interface AiWorkerDefinition {
  id: AiWorkerId;
  handoffRole: HandoffRoleId;
  emoji: string;
  title: string;
  shortTitle: string;
  inputLabel: string;
  outputLabel: string;
  priority: number;
}

export const aiWorkerDefinitions: AiWorkerDefinition[] = [
  {
    id: "product_planner",
    handoffRole: "product_planner",
    emoji: "🧠",
    title: "Product Planner",
    shortTitle: "Planner",
    inputLabel: "Your product request",
    outputLabel: "Product Brief",
    priority: 1,
  },
  {
    id: "architect",
    handoffRole: "architect",
    emoji: "🏗",
    title: "Architect",
    shortTitle: "Architect",
    inputLabel: "Product Brief",
    outputLabel: "Technical Specification",
    priority: 2,
  },
  {
    id: "designer",
    handoffRole: "designer",
    emoji: "🎨",
    title: "Designer",
    shortTitle: "Designer",
    inputLabel: "Technical Specification",
    outputLabel: "Design Specification",
    priority: 3,
  },
  {
    id: "developer",
    handoffRole: "developer",
    emoji: "💻",
    title: "Developer",
    shortTitle: "Developer",
    inputLabel: "Design Specification",
    outputLabel: "Implementation Plan",
    priority: 4,
  },
  {
    id: "qa_reviewer",
    handoffRole: "qa_reviewer",
    emoji: "🔍",
    title: "QA",
    shortTitle: "QA",
    inputLabel: "Implementation Plan",
    outputLabel: "QA Plan",
    priority: 5,
  },
];

export const projectStageLabels = [
  "Planning",
  "COO Review",
  "Discovery Discussion",
  "CEO Approval",
  "Needs Validation",
  "Architecture",
  "Build",
  "QA",
  "Release",
] as const;

export type ProjectStageLabel = (typeof projectStageLabels)[number];

export function aiWorkerStatusLabel(status: AiWorkerRunStatus): string {
  switch (status) {
    case "completed":
      return "完了";
    case "in_progress":
      return "作業中";
    case "waiting":
      return "待機中";
    case "not_started":
      return "未着手";
  }
}
