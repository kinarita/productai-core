import type { Task } from "@/types/productai";
import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";
import { missionTeamRoles } from "@/lib/mission-team/missionRoles";

export interface TaskOwnershipBucket {
  roleId: MissionTeamRoleId;
  roleTitle: string;
  assignedTasks: number;
  activeTasks: number;
  reviewTasks: number;
  blockedTasks: number;
  taskTitles: string[];
}

const agentToRole: Partial<Record<Task["assignedTo"], MissionTeamRoleId>> = {
  COO: "director",
  Architect: "architect",
  Engineer: "developer",
  QA: "qa_reviewer",
  CEO: "product_planner",
};

function inferRoleFromTask(task: Task): MissionTeamRoleId {
  const mapped = agentToRole[task.assignedTo];
  if (mapped) return mapped;

  const title = task.title.toLowerCase();
  if (/requirement|stakeholder|scope|planning|brief/.test(title)) return "product_planner";
  if (/design|wireframe|ui|ux/.test(title)) return "designer";
  if (/architect|api boundary|technical/.test(title)) return "architect";
  if (/qa|regression|e2e|test/.test(title)) return "qa_reviewer";
  if (/implement|integration|code|refactor/.test(title)) return "developer";
  return "director";
}

export function inferTaskOwnershipRole(task: Task): MissionTeamRoleId {
  return inferRoleFromTask(task);
}

export function buildTaskOwnershipBuckets(tasks: Task[]): TaskOwnershipBucket[] {
  const roleIds: MissionTeamRoleId[] = [
    "product_planner",
    "director",
    "architect",
    "designer",
    "developer",
    "qa_reviewer",
  ];

  return roleIds.map((roleId) => {
    const roleMeta = missionTeamRoles.find((r) => r.id === roleId)!;
    const roleTasks = tasks.filter((t) => inferRoleFromTask(t) === roleId);
    return {
      roleId,
      roleTitle: roleMeta.title,
      assignedTasks: roleTasks.length,
      activeTasks: roleTasks.filter((t) => t.status === "active").length,
      reviewTasks: roleTasks.filter((t) => t.status === "in_review").length,
      blockedTasks: roleTasks.filter((t) => t.status === "blocked").length,
      taskTitles: roleTasks.map((t) => t.title),
    };
  });
}

export function ownershipRoleLabel(roleId: MissionTeamRoleId): string {
  return missionTeamRoles.find((r) => r.id === roleId)?.title ?? roleId;
}
