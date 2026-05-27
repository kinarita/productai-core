import { mapTaskRow, type TaskRecord } from "@/lib/domain/task";
import { db } from "@/lib/server/db/client";

interface ListTaskFilters {
  missionId?: string;
  status?: string;
}

export class TaskRepository {
  list(filters: ListTaskFilters = {}): TaskRecord[] {
    const clauses: string[] = [];
    const params: string[] = [];

    if (filters.missionId) {
      clauses.push("mission_id = ?");
      params.push(filters.missionId);
    }
    if (filters.status) {
      clauses.push("status = ?");
      params.push(filters.status);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, mission_id, mission_name, related_decision_id, title, status, priority, created_from,
                progress, eta, assigned_to, dependencies_json, created_at, updated_at
         FROM tasks
         ${whereSql}
         ORDER BY updated_at DESC, id ASC`
      )
      .all(...params) as Array<{
      id: string;
      mission_id: string;
      mission_name: string;
      related_decision_id: string | null;
      title: string;
      status: string;
      priority: string | null;
      created_from: string | null;
      progress: number;
      eta: string;
      assigned_to: string;
      dependencies_json: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(mapTaskRow);
  }
}

export const taskRepository = new TaskRepository();
