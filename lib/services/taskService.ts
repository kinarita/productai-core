import type { TaskRecord } from "@/lib/domain/task";

export async function fetchTasksFromApi(
  params: { missionId?: string; status?: string } = {}
): Promise<TaskRecord[]> {
  const query = new URLSearchParams();
  if (params.missionId) query.set("mission", params.missionId);
  if (params.status) query.set("status", params.status);
  const url = `/api/tasks${query.size ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`);
  }
  const json = (await res.json()) as { tasks: TaskRecord[] };
  return json.tasks;
}
