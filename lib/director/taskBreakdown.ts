import type { Mission, Task, AgentRole } from "@/types/productai";

export type TaskBreakdownRole =
  | "Architect"
  | "Designer"
  | "Developer"
  | "QA Reviewer";

export interface TaskBreakdownRow {
  taskId: string;
  taskName: string;
  role: TaskBreakdownRole;
  stage: string;
  dependency: string;
  reviewRequired: boolean;
}

function mapAgentRoleToBreakdownRole(assignedTo: AgentRole): TaskBreakdownRole {
  switch (assignedTo) {
    case "Architect":
      return "Architect";
    case "QA":
      return "QA Reviewer";
    case "Engineer":
      return "Developer";
    case "COO":
    case "CEO":
      return "Designer";
    default:
      return "Developer";
  }
}

function inferStage(mission: Mission, task: Task): string {
  if (task.status === "in_review") return "Review";
  if (mission.lifecycle === "Architecture") return "Architecture";
  if (mission.lifecycle === "UI/UX" || mission.lifecycle === "Specification") return "Design";
  if (mission.lifecycle === "Implementation") return "Development";
  if (mission.lifecycle === "Review" || mission.lifecycle === "Release") return "QA";
  return "Planning";
}

export function buildTaskBreakdown(input: {
  mission: Mission;
  tasks: Task[];
}): TaskBreakdownRow[] {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);

  return missionTasks.map((task) => ({
    taskId: task.id,
    taskName: task.title,
    role: mapAgentRoleToBreakdownRole(task.assignedTo),
    stage: inferStage(input.mission, task),
    dependency: task.dependencies.length ? task.dependencies.join(", ") : "—",
    reviewRequired: task.status === "in_review" || task.status === "blocked",
  }));
}
