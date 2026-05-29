import type { Mission, Task, AgentRole } from "@/types/productai";

export type WorkBreakdownArea = "Frontend" | "Backend" | "Database" | "AI" | "Integration";

export interface DevelopmentWorkItem {
  workItem: string;
  area: WorkBreakdownArea;
  ownerRole: string;
  dependencies: string;
  reviewRequired: boolean;
}

function mapRoleToArea(assignedTo: AgentRole, title: string): WorkBreakdownArea {
  const lower = title.toLowerCase();
  if (lower.includes("api") || lower.includes("backend") || assignedTo === "Engineer") {
    if (lower.includes("ui") || lower.includes("workspace")) return "Frontend";
    return assignedTo === "Architect" ? "Integration" : "Backend";
  }
  if (assignedTo === "Architect") return "Integration";
  if (assignedTo === "QA") return "Frontend";
  if (assignedTo === "COO" || assignedTo === "CEO") return "Integration";
  return "Frontend";
}

function mapRoleLabel(assignedTo: AgentRole): string {
  switch (assignedTo) {
    case "Architect":
      return "Architect";
    case "Engineer":
      return "Developer";
    case "QA":
      return "QA Reviewer";
    default:
      return assignedTo;
  }
}

export function buildDevelopmentWorkBreakdown(input: {
  mission: Mission;
  tasks: Task[];
}): DevelopmentWorkItem[] {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);

  if (!missionTasks.length) {
    return [
      {
        workItem: "Frame implementation plan from design and technical artifacts",
        area: "Integration",
        ownerRole: "Developer",
        dependencies: "Design Specification, Technical Specification",
        reviewRequired: true,
      },
    ];
  }

  return missionTasks.map((task) => ({
    workItem: task.title,
    area: mapRoleToArea(task.assignedTo, task.title),
    ownerRole: mapRoleLabel(task.assignedTo),
    dependencies: task.dependencies.length ? task.dependencies.join(", ") : "—",
    reviewRequired: task.status === "in_review" || task.status === "blocked",
  }));
}
