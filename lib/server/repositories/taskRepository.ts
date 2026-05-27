import { mapTaskRow, type TaskRecord } from "@/lib/domain/task";
import { db } from "@/lib/server/db/client";

interface ListTaskFilters {
  missionId?: string;
  status?: string;
}

interface CreateTaskInput {
  id: string;
  missionId: string;
  missionName: string;
  relatedDecisionId?: string | null;
  title: string;
  status: string;
  priority?: string | null;
  createdFrom?: string | null;
  progress?: number;
  eta?: string;
  assignedTo: string;
  assignedAgentId?: string | null;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

interface UpdateTaskPatch {
  status?: string;
  priority?: string | null;
  assignedTo?: string;
  assignedAgentId?: string | null;
  relatedDecisionId?: string | null;
  dependencies?: string[];
  updatedAt?: string;
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
                progress, eta, assigned_to, assigned_agent_id, dependencies_json, created_at, updated_at
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
      assigned_agent_id: string | null;
      dependencies_json: string;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map(mapTaskRow);
  }

  getById(taskId: string): TaskRecord | null {
    const row = db
      .prepare(
        `SELECT id, mission_id, mission_name, related_decision_id, title, status, priority, created_from,
                progress, eta, assigned_to, assigned_agent_id, dependencies_json, created_at, updated_at
         FROM tasks
         WHERE id = ?`
      )
      .get(taskId) as
      | {
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
          assigned_agent_id: string | null;
          dependencies_json: string;
          created_at: string;
          updated_at: string;
        }
      | undefined;
    return row ? mapTaskRow(row) : null;
  }

  create(input: CreateTaskInput): TaskRecord {
    db.prepare(
      `INSERT INTO tasks (
         id, mission_id, mission_name, related_decision_id, title, status, priority, created_from,
         progress, eta, assigned_to, assigned_agent_id, dependencies_json, created_at, updated_at
       ) VALUES (
         @id, @missionId, @missionName, @relatedDecisionId, @title, @status, @priority, @createdFrom,
         @progress, @eta, @assignedTo, @assignedAgentId, @dependenciesJson, @createdAt, @updatedAt
       )`
    ).run({
      id: input.id,
      missionId: input.missionId,
      missionName: input.missionName,
      relatedDecisionId: input.relatedDecisionId ?? null,
      title: input.title,
      status: input.status,
      priority: input.priority ?? null,
      createdFrom: input.createdFrom ?? null,
      progress: input.progress ?? 0,
      eta: input.eta ?? "TBD",
      assignedTo: input.assignedTo,
      assignedAgentId: input.assignedAgentId ?? null,
      dependenciesJson: JSON.stringify(input.dependencies ?? []),
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });

    return this.getById(input.id) as TaskRecord;
  }

  update(taskId: string, patch: UpdateTaskPatch): TaskRecord | null {
    const existing = this.getById(taskId);
    if (!existing) return null;

    db.prepare(
      `UPDATE tasks
       SET status = @status,
           priority = @priority,
           assigned_to = @assignedTo,
           assigned_agent_id = @assignedAgentId,
           related_decision_id = @relatedDecisionId,
           dependencies_json = @dependenciesJson,
           updated_at = @updatedAt
       WHERE id = @id`
    ).run({
      id: taskId,
      status: patch.status ?? existing.status,
      priority: patch.priority ?? existing.priority,
      assignedTo: patch.assignedTo ?? existing.assignedTo,
      assignedAgentId: patch.assignedAgentId ?? existing.assignedAgentId,
      relatedDecisionId: patch.relatedDecisionId ?? existing.relatedDecisionId,
      dependenciesJson: JSON.stringify(patch.dependencies ?? existing.dependencies),
      updatedAt: patch.updatedAt ?? existing.updatedAt,
    });

    return this.getById(taskId);
  }
}

export const taskRepository = new TaskRepository();
