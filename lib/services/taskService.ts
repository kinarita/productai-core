import type { TaskRecord } from "@/lib/domain/task";
import { apiClient } from "@/lib/services/apiClient";

export async function fetchTasksFromApi(
  params: { missionId?: string; status?: string } = {}
): Promise<TaskRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.status) query.set("status", params.status);
  const url = `/api/tasks${query.size ? `?${query.toString()}` : ""}`;
  const data = await apiClient<{ tasks: TaskRecord[] }>(url);
  return data.tasks;
}

interface CreateTaskInput {
  title: string;
  missionId: string;
  status: string;
  priority?: string;
  assignedAgentId: string;
  relatedDecisionId?: string | null;
  createdFrom?: string | null;
  dependencies?: string[];
}

interface UpdateTaskInput {
  status?: string;
  assignedAgentId?: string;
  priority?: string | null;
  dependencies?: string[];
  updatedAt?: string;
}

export async function createTask(input: CreateTaskInput): Promise<TaskRecord> {
  const data = await apiClient<{ task: TaskRecord }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function updateTask(taskId: string, patch: UpdateTaskInput): Promise<TaskRecord> {
  const data = await apiClient<{ task: TaskRecord }>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data.task;
}
