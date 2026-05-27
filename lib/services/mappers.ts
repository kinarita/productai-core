import { agents } from "@/data/mockData";
import type { Agent, OrganizationFeedItem, Task } from "@/types/productai";

export function mapTaskToCreatePayload(task: Task) {
  const agent = agents.find((a) => a.role === task.assignedTo);
  return {
    title: task.title,
    missionId: task.missionId,
    status: task.status,
    priority: task.priority,
    assignedAgentId: task.assignedAgentId ?? agent?.id ?? "eng-1",
    relatedDecisionId: task.relatedDecisionId ?? null,
    createdFrom: task.createdFrom ?? "manual",
    dependencies: task.dependencies,
  };
}

export function mapTaskPatchPayload(
  task: Task,
  patch: {
    status?: Task["status"];
    assignedAgentId?: string;
    priority?: string | null;
    dependencies?: string[];
    updatedAt?: string;
  }
) {
  return {
    status: patch.status ?? task.status,
    assignedAgentId: patch.assignedAgentId ?? task.assignedAgentId,
    priority: patch.priority ?? task.priority,
    dependencies: patch.dependencies ?? task.dependencies,
    updatedAt: patch.updatedAt ?? "Just now",
  };
}

export function mapFeedItemToCreatePayload(item: Omit<OrganizationFeedItem, "id" | "timestamp">) {
  return {
    missionId: item.missionId,
    taskId: item.taskId ?? null,
    decisionId: item.decisionId ?? null,
    type: item.type,
    status: item.status ?? null,
    message: item.message,
    agentId: item.agentId,
    title: item.title,
    author: item.author,
    authorName: item.authorName,
  };
}

export function mapAgentToAssignedPatch(agent?: Agent) {
  return agent ? { assignedAgentId: agent.id } : {};
}
