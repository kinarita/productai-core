import { mapFeedItemRow, type FeedItemRecord } from "@/lib/domain/feed";
import { db } from "@/lib/server/db/client";

interface ListFeedFilters {
  missionId?: string;
  taskId?: string;
  type?: string;
  status?: string;
}

export class FeedRepository {
  list(filters: ListFeedFilters = {}): FeedItemRecord[] {
    const clauses: string[] = [];
    const params: string[] = [];

    if (filters.missionId) {
      clauses.push("mission_id = ?");
      params.push(filters.missionId);
    }
    if (filters.taskId) {
      clauses.push("task_id = ?");
      params.push(filters.taskId);
    }
    if (filters.type) {
      clauses.push("type = ?");
      params.push(filters.type);
    }
    if (filters.status) {
      clauses.push("status = ?");
      params.push(filters.status);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(
        `SELECT id, mission_id, mission_name, task_id, decision_id, type, status, author, author_name, message, created_at
         FROM feed_items
         ${whereSql}
         ORDER BY created_at DESC, id DESC`
      )
      .all(...params) as Array<{
      id: string;
      mission_id: string;
      mission_name: string;
      task_id: string | null;
      decision_id: string | null;
      type: string;
      status: string | null;
      author: string;
      author_name: string;
      message: string;
      created_at: string;
    }>;

    return rows.map(mapFeedItemRow);
  }
}

export const feedRepository = new FeedRepository();
